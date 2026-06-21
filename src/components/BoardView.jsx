import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Tag as TagIcon, ChevronDown } from 'lucide-react';
import Column from './Column';
import CardModal from './CardModal';
import * as api from '../lib/api';

export default function BoardView({ board, onBoardDataChanged }) {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [openCard, setOpenCard] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [addingCol, setAddingCol] = useState(false);
  const [error, setError] = useState('');

  const loadBoardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cols, crds, tgs] = await Promise.all([
        api.fetchColumns(board.id),
        api.fetchCards(board.id),
        api.fetchTags(board.id),
      ]);
      setColumns(cols);
      setCards(crds);
      setTags(tgs);
    } catch (e) {
      setError('โหลดข้อมูลบอร์ดไม่สำเร็จ: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [board.id]);

  useEffect(() => { loadBoardData(); }, [loadBoardData]);

  const handleDragStart = (e, card) => setDraggingCard(card);
  const handleDragEnd = () => { setDraggingCard(null); setDragOverCol(null); };

  const handleDrop = async (e, colId) => {
    e.preventDefault();
    if (!draggingCard) return;
    const targetCol = columns.find((c) => c.id === colId);
    const wasDoneCol = columns.find((c) => c.id === draggingCard.column_id);
    const isNowDone = targetCol?.key === 'done' || targetCol?.name?.toLowerCase() === 'done';
    const wasDone = wasDoneCol?.key === 'done' || wasDoneCol?.name?.toLowerCase() === 'done';

    const doneAt = !wasDone && isNowDone ? new Date().toISOString() : (wasDone && !isNowDone ? null : draggingCard.done_at);

    setCards((prev) => prev.map((c) => c.id === draggingCard.id ? { ...c, column_id: colId, done_at: doneAt } : c));
    setDraggingCard(null);
    setDragOverCol(null);

    try {
      await api.updateCard(draggingCard.id, { column_id: colId, done_at: doneAt });
      onBoardDataChanged?.();
    } catch (e) {
      setError('ย้ายการ์ดไม่สำเร็จ: ' + e.message);
      loadBoardData();
    }
  };

  const handleQuickAdd = async (colId, title) => {
    const targetCol = columns.find((c) => c.id === colId);
    const isDone = targetCol?.key === 'done' || targetCol?.name?.toLowerCase() === 'done';
    try {
      const newCard = await api.createCard({
        board_id: board.id, column_id: colId, title, desc: '', priority: 'none',
        deadline: null, tags: [], checklist: [], done_at: isDone ? new Date().toISOString() : null,
      });
      setCards((prev) => [...prev, newCard]);
      onBoardDataChanged?.();
    } catch (e) {
      setError('เพิ่มการ์ดไม่สำเร็จ: ' + e.message);
    }
  };

  const handleSaveCard = async (updatedCard) => {
    try {
      const saved = await api.updateCard(updatedCard.id, {
        title: updatedCard.title, desc: updatedCard.desc, deadline: updatedCard.deadline,
        priority: updatedCard.priority, tags: updatedCard.tags, checklist: updatedCard.checklist,
      });
      setCards((prev) => prev.map((c) => c.id === saved.id ? saved : c));
      setOpenCard(null);
      onBoardDataChanged?.();
    } catch (e) {
      setError('บันทึกการ์ดไม่สำเร็จ: ' + e.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await api.deleteCard(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setOpenCard(null);
      onBoardDataChanged?.();
    } catch (e) {
      setError('ลบการ์ดไม่สำเร็จ: ' + e.message);
    }
  };

  const handleRenameCol = async (colId, name) => {
    setColumns((prev) => prev.map((c) => c.id === colId ? { ...c, name } : c));
    try {
      await api.renameColumn(colId, name);
    } catch (e) {
      setError('เปลี่ยนชื่อคอลัมน์ไม่สำเร็จ: ' + e.message);
    }
  };

  const handleDeleteColumn = async (colId) => {
    if (columns.length <= 1) return;
    try {
      await api.deleteColumn(colId);
      setColumns((prev) => prev.filter((c) => c.id !== colId));
      setCards((prev) => prev.filter((c) => c.column_id !== colId));
      onBoardDataChanged?.();
    } catch (e) {
      setError('ลบคอลัมน์ไม่สำเร็จ: ' + e.message);
    }
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) { setAddingCol(false); return; }
    try {
      const newCol = await api.createColumn(board.id, newColName.trim(), columns.length);
      setColumns((prev) => [...prev, newCol]);
    } catch (e) {
      setError('เพิ่มคอลัมน์ไม่สำเร็จ: ' + e.message);
    }
    setNewColName('');
    setAddingCol(false);
  };

  const filteredCards = cards.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.desc || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag && !(c.tags || []).includes(filterTag)) return false;
    return true;
  });

  const doneColIds = columns.filter((c) => c.key === 'done' || c.name.toLowerCase() === 'done').map((c) => c.id);
  const totalCards = cards.length;
  const doneCards = cards.filter((c) => doneColIds.includes(c.column_id)).length;
  const progress = totalCards === 0 ? 0 : Math.round((doneCards / totalCards) * 100);

  if (loading) {
    return <div className="text-muted text-sm text-center" style={{ padding: 60 }}>กำลังโหลดบอร์ด...</div>;
  }

  return (
    <div className="flex-col" style={{ minHeight: '100%' }}>
      {error && <div className="alert-error">{error}</div>}

      <div className="glass-panel" style={{ padding: '24px', marginBottom: 32 }}>
        <div className="flex items-baseline gap-4 wrap" style={{ marginBottom: 16 }}>
          <span className="font-fraunces font-bold text-transparent bg-clip-text" style={{ fontSize: 48, lineHeight: 1, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', textShadow: 'var(--shadow-glow)' }}>{progress}%</span>
          <span className="text-muted text-sm font-medium">เสร็จแล้ว {doneCards} จาก {totalCards} งาน</span>
        </div>
        <div className="progress-bg">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-3 wrap" style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3 flex-1 shrink-0 glass" style={{ borderRadius: 'var(--radius-full)', padding: '10px 16px', minWidth: 240 }}>
          <Search size={18} className="text-cyan" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหางานในบอร์ด..." className="input-ghost flex-1" style={{ fontSize: 15, color: 'white' }} />
          {search && <X size={16} className="text-muted" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setFilterOpen(!filterOpen)} className={`btn ${filterTag ? 'btn-primary' : 'glass'}`} style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px' }}>
            <TagIcon size={16} /> {filterTag ? tags.find((t) => t.id === filterTag)?.name : 'กรองด้วยแท็ก'} <ChevronDown size={14} />
          </button>
          {filterOpen && (
            <div className="glass-panel" style={{ position: 'absolute', top: 52, right: 0, padding: 8, zIndex: 20, minWidth: 180 }}>
              <div onClick={() => { setFilterTag(null); setFilterOpen(false); }} className="btn-ghost" style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>ทั้งหมด</div>
              {tags.map((t) => (
                <div key={t.id} onClick={() => { setFilterTag(t.id); setFilterOpen(false); }} className="btn-ghost flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, boxShadow: `0 0 8px ${t.color}` }} /> <span className="text-white font-medium">{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="board-scroll">
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            cards={filteredCards.filter((c) => c.column_id === col.id)}
            tags={tags}
            onOpenCard={setOpenCard}
            onQuickAdd={handleQuickAdd}
            onDrop={handleDrop}
            onDragOver={setDragOverCol}
            dragOverCol={dragOverCol}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggingId={draggingCard?.id}
            onRename={handleRenameCol}
            onDeleteColumn={handleDeleteColumn}
          />
        ))}

        <div className="board-column" style={{ padding: '0 0' }}>
          {addingCol ? (
            <input autoFocus value={newColName} onChange={(e) => setNewColName(e.target.value)} onBlur={handleAddColumn} onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()} placeholder="ชื่อคอลัมน์ใหม่" className="input glass" style={{ width: '100%', padding: '16px' }} />
          ) : (
            <button onClick={() => setAddingCol(true)} className="btn btn-dashed" style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
              <Plus size={18} className="text-cyan" /> สร้างคอลัมน์เพิ่ม
            </button>
          )}
        </div>
      </div>

      {openCard && (
        <CardModal card={openCard} tags={tags} onClose={() => setOpenCard(null)} onSave={handleSaveCard} onDelete={handleDeleteCard} />
      )}
    </div>
  );
}

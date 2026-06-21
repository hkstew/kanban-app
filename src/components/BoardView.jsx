import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Tag as TagIcon, ChevronDown } from 'lucide-react';
import Column from './Column';
import CardModal from './CardModal';
import * as api from '../lib/api';

const COLORS = { ink: '#1C1B1A', paperDim: '#F1EDE5', green: '#3D7A6B', line: '#D9D4C9', muted: '#8A857C' };

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
    return <div style={{ padding: 30, color: COLORS.muted, fontSize: 14 }}>กำลังโหลดบอร์ด...</div>;
  }

  return (
    <div>
      {error && (
        <div style={{ background: '#FCE9E7', border: '1px solid #E8645A55', color: '#B23A30', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ padding: '4px 4px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, color: COLORS.green, lineHeight: 1 }}>{progress}%</span>
          <span style={{ fontSize: 12, color: COLORS.muted }}>เสร็จแล้ว {doneCards} จาก {totalCards} งาน</span>
        </div>
        <div style={{ height: 6, background: COLORS.paperDim, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: COLORS.green, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 160px', border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '6px 10px', background: 'white' }}>
          <Search size={14} color={COLORS.muted} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหางาน..." style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, background: 'transparent' }} />
          {search && <X size={13} style={{ cursor: 'pointer', color: COLORS.muted }} onClick={() => setSearch('')} />}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setFilterOpen(!filterOpen)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8, border: `1px solid ${filterTag ? COLORS.ink : COLORS.line}`, background: filterTag ? COLORS.ink : 'white', color: filterTag ? 'white' : COLORS.ink, cursor: 'pointer', fontSize: 13 }}>
            <TagIcon size={13} /> {filterTag ? tags.find((t) => t.id === filterTag)?.name : 'แท็ก'} <ChevronDown size={12} />
          </button>
          {filterOpen && (
            <div style={{ position: 'absolute', top: 36, right: 0, background: 'white', border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 6, zIndex: 20, minWidth: 140, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <div onClick={() => { setFilterTag(null); setFilterOpen(false); }} style={{ padding: '6px 8px', fontSize: 13, cursor: 'pointer', borderRadius: 5 }}>ทั้งหมด</div>
              {tags.map((t) => (
                <div key={t.id} onClick={() => { setFilterTag(t.id); setFilterOpen(false); }} style={{ padding: '6px 8px', fontSize: 13, cursor: 'pointer', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} /> {t.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12 }}>
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

        <div style={{ minWidth: 200, paddingTop: 4 }}>
          {addingCol ? (
            <input autoFocus value={newColName} onChange={(e) => setNewColName(e.target.value)} onBlur={handleAddColumn} onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()} placeholder="ชื่อคอลัมน์ใหม่" style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
          ) : (
            <button onClick={() => setAddingCol(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: `1px dashed ${COLORS.line}`, background: 'transparent', color: COLORS.muted, cursor: 'pointer', fontSize: 13, width: '100%' }}>
              <Plus size={14} /> เพิ่มคอลัมน์
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

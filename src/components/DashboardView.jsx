import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

export default function DashboardView({ userId, boards, onSelectBoard, refreshKey }) {
  const [allCards, setAllCards] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const boardIds = boards.map((b) => b.id);
        if (boardIds.length === 0) {
          if (!cancelled) { setAllCards([]); setAllColumns([]); setLoading(false); }
          return;
        }
        const [{ data: cards, error: cardErr }, { data: cols, error: colErr }] = await Promise.all([
          supabase.from('cards').select('*').in('board_id', boardIds),
          supabase.from('columns').select('*').in('board_id', boardIds),
        ]);
        if (cardErr) throw cardErr;
        if (colErr) throw colErr;
        if (!cancelled) { setAllCards(cards || []); setAllColumns(cols || []); }
      } catch (e) {
        if (!cancelled) setError('โหลดภาพรวมไม่สำเร็จ: ' + e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [boards, refreshKey]);

  if (loading) return <div className="text-muted text-sm text-center" style={{ padding: 40 }}>กำลังโหลดภาพรวม...</div>;
  if (error) return <div className="alert-error">{error}</div>;

  const colMap = Object.fromEntries(allColumns.map((c) => [c.id, c]));
  const boardMap = Object.fromEntries(boards.map((b) => [b.id, b.name]));

  const isDoneCol = (colId) => {
    const col = colMap[colId];
    return col && (col.key === 'done' || col.name?.toLowerCase() === 'done');
  };
  const isTodoCol = (colId) => {
    const col = colMap[colId];
    return col && (col.key === 'todo' || col.name?.toLowerCase() === 'to do');
  };

  const total = allCards.length;
  const doneCount = allCards.filter((c) => isDoneCol(c.column_id)).length;
  const todoCount = allCards.filter((c) => isTodoCol(c.column_id)).length;
  const doingCount = total - doneCount - todoCount;

  const overdue = allCards.filter((c) => c.deadline && !isDoneCol(c.column_id) && daysUntil(c.deadline) < 0);
  const upcoming = allCards.filter((c) => c.deadline && !isDoneCol(c.column_id) && daysUntil(c.deadline) >= 0 && daysUntil(c.deadline) <= 3);

  const weekAgo = Date.now() - 7 * 86400000;
  const completedThisWeek = allCards.filter((c) => c.done_at && new Date(c.done_at).getTime() >= weekAgo).length;

  const StatBlock = ({ label, value, colorClass }) => (
    <div className="card flex-1 shrink-0" style={{ padding: '16px', minWidth: '120px' }}>
      <div className={`font-fraunces font-bold text-2xl ${colorClass || 'text-ink'}`} style={{ lineHeight: 1 }}>{value}</div>
      <div className="text-muted text-xs font-medium" style={{ marginTop: 8 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <h2 className="font-fraunces font-bold text-xl text-ink" style={{ margin: '0 0 16px' }}>ภาพรวมทั้งหมด</h2>

      <div className="flex gap-3 wrap" style={{ marginBottom: 24 }}>
        <StatBlock label="To do" value={todoCount} />
        <StatBlock label="Doing" value={doingCount} colorClass="text-gold" />
        <StatBlock label="Done" value={doneCount} colorClass="text-green" />
        <StatBlock label="เสร็จในสัปดาห์นี้" value={completedThisWeek} colorClass="text-green" />
      </div>

      <div className="flex-col gap-4" style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
            <AlertCircle size={16} className="text-error" />
            <span className="font-fraunces font-bold text-base">เลยกำหนดแล้ว ({overdue.length})</span>
          </div>
          {overdue.length === 0 && <div className="text-muted text-sm">ไม่มีงานค้าง — เยี่ยมมาก</div>}
          {overdue.map((c) => (
            <div key={c.id} onClick={() => onSelectBoard(c.board_id)} className="flex justify-between items-center text-sm" style={{ padding: '8px 0', borderTop: '1px solid var(--paper-dim)', cursor: 'pointer' }}>
              <span>{c.title}</span>
              <span className="text-error font-bold">{c.deadline} · {boardMap[c.board_id]}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
            <Clock size={16} className="text-gold" />
            <span className="font-fraunces font-bold text-base">ใกล้ครบกำหนด ({upcoming.length})</span>
          </div>
          {upcoming.length === 0 && <div className="text-muted text-sm">ไม่มีงานใกล้ครบกำหนด</div>}
          {upcoming.map((c) => (
            <div key={c.id} onClick={() => onSelectBoard(c.board_id)} className="flex justify-between items-center text-sm" style={{ padding: '8px 0', borderTop: '1px solid var(--paper-dim)', cursor: 'pointer' }}>
              <span>{c.title}</span>
              <span className="text-gold font-bold">{c.deadline} · {boardMap[c.board_id]}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 className="font-fraunces font-bold text-lg text-ink" style={{ margin: '0 0 16px' }}>ความคืบหน้าแต่ละบอร์ด</h3>
      <div className="flex-col gap-3">
        {boards.map((b) => {
          const boardCards = allCards.filter((c) => c.board_id === b.id);
          const t = boardCards.length;
          const d = boardCards.filter((c) => isDoneCol(c.column_id)).length;
          const p = t === 0 ? 0 : Math.round((d / t) * 100);
          return (
            <div key={b.id} onClick={() => onSelectBoard(b.id)} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <span className="font-bold text-sm">{b.name}</span>
                <span className="text-muted text-xs font-bold">{p}%</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${p}%` }} />
              </div>
            </div>
          );
        })}
        {boards.length === 0 && <div className="text-muted text-sm text-center" style={{ padding: '20px 0' }}>ยังไม่มีบอร์ด — สร้างบอร์ดแรกของคุณ</div>}
      </div>
    </div>
  );
}

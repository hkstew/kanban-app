import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const COLORS = { ink: '#1C1B1A', paperDim: '#F1EDE5', accent: '#E8645A', green: '#3D7A6B', gold: '#D4A24C', line: '#D9D4C9', muted: '#8A857C' };

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

  if (loading) return <div style={{ padding: 30, color: COLORS.muted, fontSize: 14 }}>กำลังโหลดภาพรวม...</div>;
  if (error) return <div style={{ padding: 16, color: COLORS.accent, fontSize: 13 }}>{error}</div>;

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

  const StatBlock = ({ label, value, color }) => (
    <div style={{ flex: '1 1 100px', background: 'white', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '14px 14px' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: color || COLORS.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: '4px 4px 30px' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, margin: '4px 0 16px', color: COLORS.ink }}>ภาพรวมทั้งหมด</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatBlock label="To do" value={todoCount} />
        <StatBlock label="Doing" value={doingCount} color={COLORS.gold} />
        <StatBlock label="Done" value={doneCount} color={COLORS.green} />
        <StatBlock label="เสร็จในสัปดาห์นี้" value={completedThisWeek} color={COLORS.green} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'white', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <AlertCircle size={15} color={COLORS.accent} />
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 15 }}>เลยกำหนดแล้ว ({overdue.length})</span>
          </div>
          {overdue.length === 0 && <div style={{ fontSize: 13, color: COLORS.muted }}>ไม่มีงานค้าง — เยี่ยมมาก</div>}
          {overdue.map((c) => (
            <div key={c.id} onClick={() => onSelectBoard(c.board_id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${COLORS.paperDim}`, cursor: 'pointer', fontSize: 13 }}>
              <span>{c.title}</span>
              <span style={{ color: COLORS.accent, fontWeight: 600 }}>{c.deadline} · {boardMap[c.board_id]}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Clock size={15} color={COLORS.gold} />
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 15 }}>ใกล้ครบกำหนด ({upcoming.length})</span>
          </div>
          {upcoming.length === 0 && <div style={{ fontSize: 13, color: COLORS.muted }}>ไม่มีงานใกล้ครบกำหนด</div>}
          {upcoming.map((c) => (
            <div key={c.id} onClick={() => onSelectBoard(c.board_id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${COLORS.paperDim}`, cursor: 'pointer', fontSize: 13 }}>
              <span>{c.title}</span>
              <span style={{ color: COLORS.gold, fontWeight: 600 }}>{c.deadline} · {boardMap[c.board_id]}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>ความคืบหน้าแต่ละบอร์ด</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {boards.map((b) => {
          const boardCards = allCards.filter((c) => c.board_id === b.id);
          const t = boardCards.length;
          const d = boardCards.filter((c) => isDoneCol(c.column_id)).length;
          const p = t === 0 ? 0 : Math.round((d / t) * 100);
          return (
            <div key={b.id} onClick={() => onSelectBoard(b.id)} style={{ background: 'white', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</span>
                <span style={{ fontSize: 13, color: COLORS.muted }}>{p}%</span>
              </div>
              <div style={{ height: 5, background: COLORS.paperDim, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p}%`, background: COLORS.green }} />
              </div>
            </div>
          );
        })}
        {boards.length === 0 && <div style={{ fontSize: 13, color: COLORS.muted }}>ยังไม่มีบอร์ด — สร้างบอร์ดแรกของคุณ</div>}
      </div>
    </div>
  );
}

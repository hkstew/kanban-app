import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
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

  if (loading) return <div className="text-muted text-sm text-center" style={{ padding: 60 }}>กำลังวิเคราะห์ข้อมูลภาพรวม...</div>;
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
    <div className="glass-panel flex-1 shrink-0" style={{ padding: '24px 20px', minWidth: '130px', textAlign: 'center' }}>
      <div className={`font-fraunces font-bold text-4xl ${colorClass || 'text-white'}`} style={{ lineHeight: 1, textShadow: colorClass ? `0 0 16px var(--${colorClass.replace('text-', 'accent-')})` : 'none' }}>{value}</div>
      <div className="text-muted text-xs font-medium" style={{ marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 60 }}>
      <h2 className="font-fraunces font-bold text-2xl text-white" style={{ margin: '0 0 24px' }}>ภาพรวมของคุณ</h2>

      <div className="flex gap-4 wrap" style={{ marginBottom: 32 }}>
        <StatBlock label="To do" value={todoCount} />
        <StatBlock label="Doing" value={doingCount} colorClass="text-gold" />
        <StatBlock label="Done" value={doneCount} colorClass="text-green" />
        <StatBlock label="เสร็จใน 7 วัน" value={completedThisWeek} colorClass="text-cyan" />
      </div>

      <div className="flex-col gap-4" style={{ marginBottom: 40 }}>
        <div className="glass-panel" style={{ padding: 24, borderLeft: '4px solid var(--accent-red)' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            <AlertCircle size={20} className="text-error" style={{ filter: 'drop-shadow(0 0 8px var(--accent-red))' }} />
            <span className="font-fraunces font-bold text-lg text-white">เลยกำหนดแล้ว ({overdue.length})</span>
          </div>
          {overdue.length === 0 && <div className="text-muted text-sm flex items-center gap-2"><CheckCircle size={14} className="text-green" /> ไม่มีงานค้าง — เยี่ยมมาก!</div>}
          {overdue.map((c) => (
            <div key={c.id} onClick={() => onSelectBoard(c.board_id)} className="flex justify-between items-center text-sm" style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <span className="font-medium">{c.title}</span>
              <span className="text-error font-bold" style={{ textShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }}>{c.deadline} · {boardMap[c.board_id]}</span>
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: 24, borderLeft: '4px solid var(--accent-gold)' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            <Clock size={20} className="text-gold" style={{ filter: 'drop-shadow(0 0 8px var(--accent-gold))' }} />
            <span className="font-fraunces font-bold text-lg text-white">ใกล้ครบกำหนด ({upcoming.length})</span>
          </div>
          {upcoming.length === 0 && <div className="text-muted text-sm">ไม่มีงานที่ใกล้ถึงกำหนดส่ง</div>}
          {upcoming.map((c) => (
            <div key={c.id} onClick={() => onSelectBoard(c.board_id)} className="flex justify-between items-center text-sm" style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <span className="font-medium">{c.title}</span>
              <span className="text-gold font-bold">{c.deadline} · {boardMap[c.board_id]}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 className="font-fraunces font-bold text-xl text-white" style={{ margin: '0 0 20px' }}>ความคืบหน้าบอร์ด</h3>
      <div className="flex-col gap-4">
        {boards.map((b) => {
          const boardCards = allCards.filter((c) => c.board_id === b.id);
          const t = boardCards.length;
          const d = boardCards.filter((c) => isDoneCol(c.column_id)).length;
          const p = t === 0 ? 0 : Math.round((d / t) * 100);
          return (
            <div key={b.id} onClick={() => onSelectBoard(b.id)} className="glass-panel" style={{ padding: '20px 24px', cursor: 'pointer', transition: 'var(--transition)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <span className="font-bold text-base text-white">{b.name}</span>
                <span className="text-cyan text-sm font-bold" style={{ textShadow: 'var(--shadow-glow)' }}>{p}%</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${p}%` }} />
              </div>
            </div>
          );
        })}
        {boards.length === 0 && <div className="text-muted text-sm text-center" style={{ padding: '20px 0' }}>ยังไม่มีบอร์ด — สร้างบอร์ดแรกของคุณเพื่อเริ่มทำงาน</div>}
      </div>
    </div>
  );
}

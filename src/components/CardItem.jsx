import React, { useState } from 'react';
import { Calendar, Check } from 'lucide-react';

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

export function deadlineColor(dateStr, isDone) {
  if (!dateStr || isDone) return null;
  const d = daysUntil(dateStr);
  if (d < 0) return 'var(--accent-red)';
  if (d <= 2) return 'var(--accent-gold)';
  return null;
}

function PriorityDot({ level }) {
  const map = { high: 'var(--accent-red)', medium: 'var(--accent-gold)', low: 'var(--text-muted)' };
  if (!level || level === 'none') return null;
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: map[level], display: 'inline-block', boxShadow: `0 0 8px ${map[level]}` }} />;
}

export function CardItem({ card, tags, isDoneColumn, onOpen, onDragStart, onDragEnd, isDragging }) {
  const cardTags = tags.filter((t) => (card.tags || []).includes(t.id));
  const dColor = deadlineColor(card.deadline, isDoneColumn);
  const chkDone = (card.checklist || []).filter((c) => c.done).length;
  const chkTotal = (card.checklist || []).length;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(card)}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      style={{
        borderLeft: dColor ? `3px solid ${dColor}` : `1px solid rgba(255,255,255,0.1)`,
      }}
    >
      {cardTags.length > 0 && (
        <div className="flex gap-2 wrap" style={{ marginBottom: 10 }}>
          {cardTags.map((t) => (
            <span key={t.id} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: t.color + '33', color: t.color, fontWeight: 600, border: `1px solid ${t.color}55` }}>{t.name}</span>
          ))}
        </div>
      )}
      <div className="flex items-baseline gap-2 text-sm text-white" style={{ lineHeight: 1.4 }}>
        <span style={{ transform: 'translateY(-1px)' }}><PriorityDot level={card.priority} /></span>
        <span className="font-medium">{card.title}</span>
      </div>
      <div className="flex gap-4 items-center wrap" style={{ marginTop: 12 }}>
        {card.deadline && (
          <span className="flex items-center gap-2 text-xs" style={{ color: dColor || 'var(--text-muted)', fontWeight: dColor ? 600 : 500, textShadow: dColor ? `0 0 8px ${dColor}55` : 'none' }}>
            <Calendar size={13} /> {card.deadline}
          </span>
        )}
        {chkTotal > 0 && (
          <span className="flex items-center gap-2 text-xs text-muted font-medium">
            <Check size={13} className={chkDone === chkTotal ? 'text-green' : 'text-cyan'} /> {chkDone}/{chkTotal}
          </span>
        )}
      </div>
    </div>
  );
}

export function QuickAdd({ onAdd }) {
  const [val, setVal] = useState('');
  const submit = () => {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal('');
  };
  return (
    <div className="flex gap-2" style={{ marginBottom: 16 }}>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="+ เพิ่มงานเร็ว..."
        className="input input-ghost"
        style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: `1px dashed var(--border-light)`, fontSize: 13, background: 'rgba(0,0,0,0.2)' }}
      />
    </div>
  );
}

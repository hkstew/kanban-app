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
  if (d < 0) return 'var(--accent)';
  if (d <= 2) return 'var(--gold)';
  return null;
}

function PriorityDot({ level }) {
  const map = { high: 'var(--accent)', medium: 'var(--gold)', low: 'var(--muted)' };
  if (!level || level === 'none') return null;
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: map[level], display: 'inline-block' }} />;
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
        borderLeft: dColor ? `3px solid ${dColor}` : `1px solid var(--line)`,
      }}
    >
      {cardTags.length > 0 && (
        <div className="flex gap-2 wrap" style={{ marginBottom: 8 }}>
          {cardTags.map((t) => (
            <span key={t.id} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: t.color + '22', color: t.color, fontWeight: 600 }}>{t.name}</span>
          ))}
        </div>
      )}
      <div className="flex items-baseline gap-2 text-sm text-ink" style={{ lineHeight: 1.4 }}>
        <span style={{ transform: 'translateY(-1px)' }}><PriorityDot level={card.priority} /></span>
        <span className="font-medium">{card.title}</span>
      </div>
      <div className="flex gap-3 items-center" style={{ marginTop: 8 }}>
        {card.deadline && (
          <span className="flex items-center gap-2 text-xs" style={{ color: dColor || 'var(--muted)', fontWeight: dColor ? 600 : 400 }}>
            <Calendar size={12} /> {card.deadline}
          </span>
        )}
        {chkTotal > 0 && (
          <span className="flex items-center gap-2 text-xs text-muted">
            <Check size={12} /> {chkDone}/{chkTotal}
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
    <div className="flex gap-2" style={{ marginBottom: 12 }}>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="+ เพิ่มงานเร็ว..."
        className="input input-ghost"
        style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: `1px dashed var(--line)`, fontSize: 13 }}
      />
    </div>
  );
}

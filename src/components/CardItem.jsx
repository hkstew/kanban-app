import React, { useState } from 'react';
import { Calendar, Check } from 'lucide-react';

const COLORS = {
  ink: '#1C1B1A', accent: '#E8645A', gold: '#D4A24C', line: '#D9D4C9', muted: '#8A857C',
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

function deadlineColor(dateStr, isDone) {
  if (!dateStr || isDone) return null;
  const d = daysUntil(dateStr);
  if (d < 0) return COLORS.accent;
  if (d <= 2) return COLORS.gold;
  return null;
}

function PriorityDot({ level }) {
  const map = { high: COLORS.accent, medium: COLORS.gold, low: COLORS.muted };
  if (!level || level === 'none') return null;
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: map[level], display: 'inline-block' }} />;
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
      style={{
        background: 'white', border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '10px 12px',
        marginBottom: 8, cursor: 'pointer', opacity: isDragging ? 0.4 : 1,
        borderLeft: dColor ? `3px solid ${dColor}` : `1px solid ${COLORS.line}`,
      }}
    >
      {cardTags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
          {cardTags.map((t) => (
            <span key={t.id} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: t.color + '22', color: t.color, fontWeight: 600 }}>{t.name}</span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 14, color: COLORS.ink, lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <span style={{ marginTop: 5 }}><PriorityDot level={card.priority} /></span>
        <span>{card.title}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
        {card.deadline && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: dColor || COLORS.muted, fontWeight: dColor ? 700 : 400 }}>
            <Calendar size={11} /> {card.deadline}
          </span>
        )}
        {chkTotal > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: COLORS.muted }}>
            <Check size={11} /> {chkDone}/{chkTotal}
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
    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="+ เพิ่มงานเร็ว..."
        style={{ flex: 1, padding: '7px 9px', borderRadius: 6, border: `1px dashed ${COLORS.line}`, fontSize: 13, outline: 'none', background: 'transparent' }}
      />
    </div>
  );
}

export { daysUntil, deadlineColor };

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CardItem, QuickAdd } from './CardItem';

const COLORS = { ink: '#1C1B1A', paperDim: '#F1EDE5', line: '#D9D4C9', muted: '#8A857C' };

export default function Column({ column, cards, tags, onOpenCard, onQuickAdd, onDrop, onDragOver, dragOverCol, onDragStart, onDragEnd, draggingId, onRename, onDeleteColumn }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const isDoneColumn = column.key === 'done' || column.name.toLowerCase() === 'done';

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
      onDrop={(e) => onDrop(e, column.id)}
      style={{
        background: dragOverCol === column.id ? COLORS.paperDim : 'transparent',
        borderRadius: 10, padding: '10px 8px', minWidth: 260, width: 260, flexShrink: 0,
        border: dragOverCol === column.id ? `1px dashed ${COLORS.muted}` : '1px solid transparent',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { onRename(column.id, name || column.name); setEditing(false); }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
          />
        ) : (
          <h3 onClick={() => setEditing(true)} style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, margin: 0, cursor: 'text', color: COLORS.ink }}>
            {column.name} <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>{cards.length}</span>
          </h3>
        )}
        <button onClick={() => onDeleteColumn(column.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      <QuickAdd onAdd={(title) => onQuickAdd(column.id, title)} />

      <div>
        {cards.map((c) => (
          <CardItem key={c.id} card={c} tags={tags} isDoneColumn={isDoneColumn} onOpen={onOpenCard} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={draggingId === c.id} />
        ))}
        {cards.length === 0 && (
          <div style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>ยังไม่มีงาน</div>
        )}
      </div>
    </div>
  );
}

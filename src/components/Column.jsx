import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CardItem, QuickAdd } from './CardItem';

export default function Column({ column, cards, tags, onOpenCard, onQuickAdd, onDrop, onDragOver, dragOverCol, onDragStart, onDragEnd, draggingId, onRename, onDeleteColumn }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const isDoneColumn = column.key === 'done' || column.name.toLowerCase() === 'done';

  return (
    <div
      className="board-column"
      onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
      onDrop={(e) => onDrop(e, column.id)}
      style={{
        background: dragOverCol === column.id ? 'var(--paper-dim)' : 'transparent',
        borderRadius: 'var(--radius-md)', padding: '12px 8px',
        border: dragOverCol === column.id ? '1px dashed var(--muted)' : '1px solid transparent',
        transition: 'var(--transition)'
      }}
    >
      <div className="flex justify-between items-center" style={{ marginBottom: 12, padding: '0 4px' }}>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { onRename(column.id, name || column.name); setEditing(false); }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="input-ghost font-fraunces font-bold text-base text-ink"
            style={{ width: '100%' }}
          />
        ) : (
          <h3 onClick={() => setEditing(true)} className="font-fraunces font-bold text-base text-ink" style={{ margin: 0, cursor: 'text' }}>
            {column.name} <span className="font-medium text-xs text-muted" style={{ fontFamily: 'Inter, sans-serif', marginLeft: 4 }}>{cards.length}</span>
          </h3>
        )}
        <button onClick={() => onDeleteColumn(column.id)} className="btn-ghost" style={{ padding: 4, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <QuickAdd onAdd={(title) => onQuickAdd(column.id, title)} />

      <div style={{ paddingBottom: 24 }}>
        {cards.map((c) => (
          <CardItem key={c.id} card={c} tags={tags} isDoneColumn={isDoneColumn} onOpen={onOpenCard} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={draggingId === c.id} />
        ))}
        {cards.length === 0 && (
          <div className="text-center text-xs text-muted" style={{ padding: '24px 0', fontStyle: 'italic' }}>ยังไม่มีงาน</div>
        )}
      </div>
    </div>
  );
}

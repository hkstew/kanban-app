import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CardItem, QuickAdd } from './CardItem';

export default function Column({ column, cards, tags, onOpenCard, onQuickAdd, onDrop, onDragOver, dragOverCol, onDragStart, onDragEnd, draggingId, onRename, onDeleteColumn }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const isDoneColumn = column.key === 'done' || column.name.toLowerCase() === 'done';

  return (
    <div
      className="board-column glass"
      onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
      onDrop={(e) => onDrop(e, column.id)}
      style={{
        background: dragOverCol === column.id ? 'rgba(255,255,255,0.08)' : 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)', padding: '16px 12px',
        border: dragOverCol === column.id ? '1px dashed var(--accent-cyan)' : '1px solid var(--border-light)',
        transition: 'var(--transition)'
      }}
    >
      <div className="flex justify-between items-center" style={{ marginBottom: 16, padding: '0 4px' }}>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { onRename(column.id, name || column.name); setEditing(false); }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="input-ghost font-fraunces font-bold text-lg text-white"
            style={{ width: '100%', padding: 0 }}
          />
        ) : (
          <h3 onClick={() => setEditing(true)} className="font-fraunces font-bold text-lg text-white" style={{ margin: 0, cursor: 'text', display: 'flex', alignItems: 'center', gap: 8 }}>
            {column.name} <span className="font-medium text-xs text-muted" style={{ fontFamily: 'Inter, sans-serif', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)' }}>{cards.length}</span>
          </h3>
        )}
        <button onClick={() => onDeleteColumn(column.id)} className="btn-ghost" style={{ padding: 6, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <QuickAdd onAdd={(title) => onQuickAdd(column.id, title)} />

      <div style={{ paddingBottom: 24, flex: 1 }}>
        {cards.map((c) => (
          <CardItem key={c.id} card={c} tags={tags} isDoneColumn={isDoneColumn} onOpen={onOpenCard} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={draggingId === c.id} />
        ))}
        {cards.length === 0 && (
          <div className="text-center text-sm text-muted" style={{ padding: '32px 0', fontStyle: 'italic', opacity: 0.7 }}>ยังไม่มีงานในนี้</div>
        )}
      </div>
    </div>
  );
}

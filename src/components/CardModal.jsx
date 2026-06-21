import React, { useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';

function IconBtn({ onClick, children, title }) {
  return (
    <button onClick={onClick} title={title} className="btn-outline btn-icon" style={{ borderRadius: 'var(--radius-sm)' }}>
      {children}
    </button>
  );
}

export default function CardModal({ card, tags, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.desc || '');
  const [deadline, setDeadline] = useState(card.deadline || '');
  const [priority, setPriority] = useState(card.priority || 'none');
  const [selectedTags, setSelectedTags] = useState(card.tags || []);
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [newChk, setNewChk] = useState('');

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  const addChecklistItem = () => {
    if (!newChk.trim()) return;
    setChecklist((prev) => [...prev, { id: `chk_${Date.now()}`, text: newChk.trim(), done: false }]);
    setNewChk('');
  };

  const toggleChk = (id) => setChecklist((prev) => prev.map((c) => c.id === id ? { ...c, done: !c.done } : c));
  const removeChk = (id) => setChecklist((prev) => prev.filter((c) => c.id !== id));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...card, title: title.trim(), desc, deadline: deadline || null, priority, tags: selectedTags, checklist });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end" style={{ marginBottom: 8 }}>
          <IconBtn onClick={onClose} title="ปิด"><X size={16} /></IconBtn>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ชื่องาน"
          className="input-ghost font-fraunces font-bold text-2xl text-ink"
          style={{ width: '100%', marginBottom: 16 }}
        />

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="รายละเอียดเพิ่มเติม..."
          rows={3}
          className="input"
          style={{ resize: 'vertical', marginBottom: 20 }}
        />

        <div className="flex gap-4 wrap" style={{ marginBottom: 20 }}>
          <div className="flex-1 shrink-0" style={{ minWidth: 140 }}>
            <label className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>กำหนดส่ง</label>
            <input type="date" value={deadline || ''} onChange={(e) => setDeadline(e.target.value)} className="input" />
          </div>
          <div className="flex-1 shrink-0" style={{ minWidth: 140 }}>
            <label className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>ความสำคัญ</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
              <option value="none">ไม่ระบุ</option>
              <option value="low">ต่ำ</option>
              <option value="medium">กลาง</option>
              <option value="high">สูง</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>แท็ก</label>
          <div className="flex gap-2 wrap">
            {tags.map((t) => {
              const active = selectedTags.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 12,
                    border: `1px solid ${active ? t.color : 'var(--line)'}`,
                    background: active ? t.color : 'white',
                    color: active ? 'white' : 'var(--ink)',
                    cursor: 'pointer', fontWeight: active ? 600 : 500,
                    transition: 'var(--transition)'
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <label className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
            เช็คลิสต์ {checklist.length > 0 && `(${checklist.filter((c) => c.done).length}/${checklist.length})`}
          </label>
          {checklist.map((c) => (
            <div key={c.id} className="flex items-center gap-3" style={{ marginBottom: 8 }}>
              <button
                onClick={() => toggleChk(c.id)}
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${c.done ? 'var(--green)' : 'var(--line)'}`,
                  background: c.done ? 'var(--green)' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'var(--transition)'
                }}
              >
                {c.done && <Check size={14} color="white" strokeWidth={3} />}
              </button>
              <span className="flex-1 text-sm" style={{ textDecoration: c.done ? 'line-through' : 'none', color: c.done ? 'var(--muted)' : 'var(--ink)' }}>{c.text}</span>
              <button onClick={() => removeChk(c.id)} className="btn-ghost" style={{ padding: 4, borderRadius: 'var(--radius-sm)' }}><X size={14} /></button>
            </div>
          ))}
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            <input value={newChk} onChange={(e) => setNewChk(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()} placeholder="เพิ่มรายการย่อย..." className="input flex-1" />
            <button onClick={addChecklistItem} className="btn btn-outline">+</button>
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <button onClick={() => onDelete(card.id)} className="btn" style={{ background: '#FCE9E7', color: 'var(--text-error)' }}>
            <Trash2 size={16} /> ลบการ์ด
          </button>
          <button onClick={handleSave} className="btn btn-primary flex-1">
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Check, Trash2, Calendar as CalendarIcon, Tag as TagIcon, Flag } from 'lucide-react';

function IconBtn({ onClick, children, title }) {
  return (
    <button onClick={onClick} title={title} className="btn-outline btn-icon" style={{ borderRadius: 'var(--radius-full)' }}>
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
        <div className="flex justify-end" style={{ marginBottom: 12 }}>
          <IconBtn onClick={onClose} title="ปิด"><X size={16} /></IconBtn>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ชื่องาน..."
          className="input-ghost font-fraunces font-bold text-3xl text-white"
          style={{ width: '100%', marginBottom: 20 }}
        />

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="รายละเอียดเพิ่มเติม (Markdown รองรับบางส่วน)..."
          rows={3}
          className="input"
          style={{ resize: 'vertical', marginBottom: 24, fontSize: 14 }}
        />

        <div className="flex gap-4 wrap" style={{ marginBottom: 24 }}>
          <div className="flex-1 shrink-0 glass" style={{ minWidth: 150, padding: 12, borderRadius: 'var(--radius-lg)' }}>
            <label className="text-muted text-xs font-bold flex items-center gap-2" style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><CalendarIcon size={14} /> กำหนดส่ง</label>
            <input type="date" value={deadline || ''} onChange={(e) => setDeadline(e.target.value)} className="input-ghost text-white font-medium text-sm" style={{ width: '100%' }} />
          </div>
          <div className="flex-1 shrink-0 glass" style={{ minWidth: 150, padding: 12, borderRadius: 'var(--radius-lg)' }}>
            <label className="text-muted text-xs font-bold flex items-center gap-2" style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><Flag size={14} /> ความสำคัญ</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-ghost text-white font-medium text-sm" style={{ width: '100%' }}>
              <option value="none">ไม่ระบุ</option>
              <option value="low">ต่ำ (Low)</option>
              <option value="medium">กลาง (Medium)</option>
              <option value="high">สูง (High)</option>
            </select>
          </div>
        </div>

        <div className="glass" style={{ marginBottom: 24, padding: 16, borderRadius: 'var(--radius-lg)' }}>
          <label className="text-muted text-xs font-bold flex items-center gap-2" style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}><TagIcon size={14} /> แท็ก</label>
          <div className="flex gap-2 wrap">
            {tags.map((t) => {
              const active = selectedTags.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12,
                    border: `1px solid ${active ? t.color : 'rgba(255,255,255,0.1)'}`,
                    background: active ? `${t.color}33` : 'rgba(255,255,255,0.03)',
                    color: active ? t.color : 'var(--text-main)',
                    cursor: 'pointer', fontWeight: 600,
                    transition: 'var(--transition)',
                    boxShadow: active ? `0 0 10px ${t.color}44` : 'none'
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <label className="text-white text-base font-bold flex items-center gap-2" style={{ marginBottom: 16 }}>
            <Check size={18} className="text-cyan" /> เช็คลิสต์งานย่อย {checklist.length > 0 && <span className="text-muted text-sm font-medium">({checklist.filter((c) => c.done).length}/{checklist.length})</span>}
          </label>
          {checklist.map((c) => (
            <div key={c.id} className="flex items-center gap-3" style={{ marginBottom: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => toggleChk(c.id)}
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${c.done ? 'var(--accent-cyan)' : 'var(--border-light)'}`,
                  background: c.done ? 'var(--accent-cyan)' : 'transparent',
                  boxShadow: c.done ? 'var(--shadow-glow)' : 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'var(--transition)'
                }}
              >
                {c.done && <Check size={14} color="white" strokeWidth={3} />}
              </button>
              <span className="flex-1 text-sm font-medium" style={{ textDecoration: c.done ? 'line-through' : 'none', color: c.done ? 'var(--text-muted)' : 'var(--text-main)' }}>{c.text}</span>
              <button onClick={() => removeChk(c.id)} className="btn-ghost" style={{ padding: 6, borderRadius: 'var(--radius-full)' }}><X size={14} /></button>
            </div>
          ))}
          <div className="flex gap-2" style={{ marginTop: 16 }}>
            <input value={newChk} onChange={(e) => setNewChk(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()} placeholder="พิมพ์เพิ่มรายการย่อย แล้วกด Enter..." className="input flex-1" style={{ padding: '12px 16px', borderRadius: 'var(--radius-full)' }} />
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <button onClick={() => onDelete(card.id)} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 20px', borderRadius: 'var(--radius-full)' }}>
            <Trash2 size={16} /> ลบ
          </button>
          <button onClick={handleSave} className="btn btn-primary flex-1" style={{ padding: '12px 20px', borderRadius: 'var(--radius-full)', fontSize: 15 }}>
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  );
}

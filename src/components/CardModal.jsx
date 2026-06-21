import React, { useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';

const COLORS = {
  ink: '#1C1B1A', paper: '#FAF8F4', accent: '#E8645A', green: '#3D7A6B',
  gold: '#D4A24C', line: '#D9D4C9', muted: '#8A857C',
};

function IconBtn({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 6, border: `1px solid ${COLORS.line}`,
        background: COLORS.paper, cursor: 'pointer', color: COLORS.ink,
      }}
    >
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,27,26,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.paper, width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto', borderRadius: '16px 16px 0 0', padding: '20px 20px 28px', border: `1px solid ${COLORS.line}`, borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <IconBtn onClick={onClose} title="ปิด"><X size={16} /></IconBtn>
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่องาน" style={{ width: '100%', fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', color: COLORS.ink, marginBottom: 10 }} />

        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="รายละเอียดเพิ่มเติม..." rows={3} style={{ width: '100%', fontSize: 14, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 10, outline: 'none', resize: 'vertical', background: 'white', marginBottom: 16, boxSizing: 'border-box' }} />

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>กำหนดส่ง</label>
            <input type="date" value={deadline || ''} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>ความสำคัญ</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '7px 8px', borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 13, background: 'white' }}>
              <option value="none">ไม่ระบุ</option>
              <option value="low">ต่ำ</option>
              <option value="medium">กลาง</option>
              <option value="high">สูง</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>แท็ก</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map((t) => {
              const active = selectedTags.includes(t.id);
              return (
                <button key={t.id} onClick={() => toggleTag(t.id)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, border: `1px solid ${active ? t.color : COLORS.line}`, background: active ? t.color : 'white', color: active ? 'white' : COLORS.ink, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
            เช็คลิสต์ {checklist.length > 0 && `(${checklist.filter((c) => c.done).length}/${checklist.length})`}
          </label>
          {checklist.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <button onClick={() => toggleChk(c.id)} style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${c.done ? COLORS.green : COLORS.line}`, background: c.done ? COLORS.green : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.done && <Check size={12} color="white" strokeWidth={3} />}
              </button>
              <span style={{ flex: 1, fontSize: 13, textDecoration: c.done ? 'line-through' : 'none', color: c.done ? COLORS.muted : COLORS.ink }}>{c.text}</span>
              <button onClick={() => removeChk(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, padding: 2 }}><X size={13} /></button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input value={newChk} onChange={(e) => setNewChk(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()} placeholder="เพิ่มรายการย่อย..." style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: `1px solid ${COLORS.line}`, fontSize: 13, outline: 'none' }} />
            <button onClick={addChecklistItem} style={{ padding: '0 12px', borderRadius: 6, border: `1px solid ${COLORS.line}`, background: 'white', cursor: 'pointer' }}>+</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <button onClick={() => onDelete(card.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: `1px solid ${COLORS.line}`, background: 'white', color: COLORS.accent, cursor: 'pointer', fontSize: 13 }}>
            <Trash2 size={14} /> ลบการ์ด
          </button>
          <button onClick={handleSave} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none', background: COLORS.ink, color: COLORS.paper, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

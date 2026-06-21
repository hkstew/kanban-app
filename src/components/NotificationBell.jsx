import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

export default function NotificationBell({ boards, onSelectBoard }) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchAlerts = async () => {
    if (!boards || boards.length === 0) return;
    try {
      setLoading(true);
      const boardIds = boards.map(b => b.id);
      
      const [{ data: cards }, { data: cols }] = await Promise.all([
        supabase.from('cards').select('id, title, deadline, board_id, column_id').in('board_id', boardIds).not('deadline', 'is', null),
        supabase.from('columns').select('id, key, name').in('board_id', boardIds)
      ]);

      if (!cards || !cols) return;

      const doneColIds = cols.filter(c => c.key === 'done' || c.name.toLowerCase() === 'done').map(c => c.id);
      
      const newAlerts = [];
      cards.forEach(c => {
        if (doneColIds.includes(c.column_id)) return;
        const d = daysUntil(c.deadline);
        if (d < 0) {
          newAlerts.push({ id: c.id, type: 'overdue', card: c, days: Math.abs(d) });
        } else if (d >= 0 && d <= 2) {
          newAlerts.push({ id: c.id, type: 'upcoming', card: c, days: d });
        }
      });
      
      // Sort by urgency: overdue first (highest days overdue), then upcoming (lowest days left)
      setAlerts(newAlerts.sort((a, b) => {
        if (a.type === 'overdue' && b.type === 'upcoming') return -1;
        if (a.type === 'upcoming' && b.type === 'overdue') return 1;
        if (a.type === 'overdue') return b.days - a.days; 
        return a.days - b.days;
      }));
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Refresh every 30 mins
    const interval = setInterval(fetchAlerts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [boards]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button onClick={() => { setOpen(!open); if (!open) fetchAlerts(); }} className="btn btn-outline btn-icon" style={{ position: 'relative', borderRadius: 'var(--radius-full)' }}>
        <Bell size={18} className="text-white" />
        {alerts.length > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 10px var(--accent-red)' }} />
        )}
      </button>

      {open && (
        <div className="glass-panel" style={{ position: 'absolute', top: 48, right: 0, width: 320, padding: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="flex justify-between items-center">
            <h3 className="font-fraunces font-bold text-white text-lg" style={{ margin: 0 }}>การแจ้งเตือน ({alerts.length})</h3>
          </div>
          
          {loading && <div className="text-muted text-xs text-center">กำลังซิงค์...</div>}
          
          {!loading && alerts.length === 0 && (
            <div className="text-muted text-sm text-center" style={{ padding: '30px 0' }}>ไม่มีงานที่ใกล้กำหนดส่ง 🎉</div>
          )}

          {!loading && alerts.length > 0 && (
            <div className="flex-col gap-3" style={{ maxHeight: 350, overflowY: 'auto', paddingRight: 4 }}>
              {alerts.map(a => (
                <div 
                  key={a.id} 
                  onClick={() => { onSelectBoard(a.card.board_id); setOpen(false); }} 
                  className="glass" 
                  style={{ 
                    padding: '14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', 
                    borderLeft: `4px solid ${a.type === 'overdue' ? 'var(--accent-red)' : 'var(--accent-gold)'}`,
                    transition: 'var(--transition)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div style={{ marginTop: 2 }}>
                      {a.type === 'overdue' ? <AlertCircle size={16} className="text-error" style={{ filter: 'drop-shadow(0 0 4px var(--accent-red))' }} /> : <Clock size={16} className="text-gold" style={{ filter: 'drop-shadow(0 0 4px var(--accent-gold))' }} />}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{a.card.title}</div>
                      <div className={`text-xs font-bold ${a.type === 'overdue' ? 'text-error' : 'text-gold'}`} style={{ marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {a.type === 'overdue' ? `เลยกำหนดมาแล้ว ${a.days} วัน` : (a.days === 0 ? 'ครบกำหนดวันนี้!' : `ครบกำหนดในอีก ${a.days} วัน`)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

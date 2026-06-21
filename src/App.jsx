import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trello, LayoutDashboard, Trash2, LogOut } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import * as api from './lib/api';
import AuthScreen from './components/AuthScreen';
import BoardView from './components/BoardView';
import DashboardView from './components/DashboardView';

const COLORS = { ink: '#1C1B1A', paper: '#FAF8F4', line: '#D9D4C9', muted: '#8A857C' };

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [view, setView] = useState('dashboard');
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [addingBoard, setAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadBoards = useCallback(async () => {
    if (!session?.user) return;
    setBoardsLoading(true);
    setError('');
    try {
      const data = await api.fetchBoards(session.user.id);
      setBoards(data);
      if (data.length > 0 && !activeBoardId) setActiveBoardId(data[0].id);
    } catch (e) {
      setError('โหลดบอร์ดไม่สำเร็จ: ' + e.message);
    } finally {
      setBoardsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => { if (session?.user) loadBoards(); }, [session, loadBoards]);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const handleAddBoard = async () => {
    if (!newBoardName.trim()) { setAddingBoard(false); return; }
    try {
      const newBoard = await api.createBoard(session.user.id, newBoardName.trim());
      setBoards((prev) => [...prev, newBoard]);
      setActiveBoardId(newBoard.id);
      setView('board');
    } catch (e) {
      setError('สร้างบอร์ดไม่สำเร็จ: ' + e.message);
    }
    setNewBoardName('');
    setAddingBoard(false);
  };

  const handleDeleteBoard = async (id) => {
    try {
      await api.deleteBoard(id);
      const remaining = boards.filter((b) => b.id !== id);
      setBoards(remaining);
      if (activeBoardId === id) {
        setActiveBoardId(remaining[0]?.id || null);
        setView('dashboard');
      }
    } catch (e) {
      setError('ลบบอร์ดไม่สำเร็จ: ' + e.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBoards([]);
    setActiveBoardId(null);
  };

  if (session === undefined) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.paper, color: COLORS.muted, fontFamily: 'Inter, sans-serif' }}>กำลังโหลด...</div>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.paper, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '18px 16px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trello size={16} color={COLORS.paper} />
            </div>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 19, color: COLORS.ink }}>งานของฉัน</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView(view === 'dashboard' ? 'board' : 'dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: `1px solid ${COLORS.line}`, background: 'white', cursor: 'pointer', fontSize: 13, color: COLORS.ink }}>
              {view === 'dashboard' ? <><Trello size={14} /> ดูบอร์ด</> : <><LayoutDashboard size={14} /> ภาพรวม</>}
            </button>
            <button onClick={handleLogout} title="ออกจากระบบ" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, padding: 0, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: 'white', cursor: 'pointer', color: COLORS.muted }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FCE9E7', border: '1px solid #E8645A55', color: '#B23A30', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {view === 'board' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {boards.map((b) => (
              <button key={b.id} onClick={() => setActiveBoardId(b.id)} style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${b.id === activeBoardId ? COLORS.ink : COLORS.line}`, background: b.id === activeBoardId ? COLORS.ink : 'white', color: b.id === activeBoardId ? 'white' : COLORS.ink, cursor: 'pointer', fontSize: 13, fontWeight: b.id === activeBoardId ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {b.name}
              </button>
            ))}
            {addingBoard ? (
              <input autoFocus value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onBlur={handleAddBoard} onKeyDown={(e) => e.key === 'Enter' && handleAddBoard()} placeholder="ชื่อบอร์ดใหม่" style={{ padding: '7px 12px', borderRadius: 20, border: `1px solid ${COLORS.line}`, fontSize: 13, width: 140 }} />
            ) : (
              <button onClick={() => setAddingBoard(true)} style={{ padding: '7px 12px', borderRadius: 20, border: `1px dashed ${COLORS.line}`, background: 'transparent', cursor: 'pointer', fontSize: 13, color: COLORS.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <Plus size={13} style={{ verticalAlign: -2 }} /> บอร์ดใหม่
              </button>
            )}
          </div>
        )}

        {boardsLoading ? (
          <div style={{ padding: 30, color: COLORS.muted, fontSize: 14 }}>กำลังโหลด...</div>
        ) : view === 'dashboard' ? (
          <DashboardView userId={session.user.id} boards={boards} refreshKey={refreshKey} onSelectBoard={(id) => { setActiveBoardId(id); setView('board'); }} />
        ) : activeBoard ? (
          <>
            <BoardView board={activeBoard} onBoardDataChanged={() => setRefreshKey((k) => k + 1)} />
            {boards.length > 1 && (
              <button onClick={() => handleDeleteBoard(activeBoard.id)} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, border: `1px solid ${COLORS.line}`, background: 'white', color: COLORS.muted, cursor: 'pointer', fontSize: 12 }}>
                <Trash2 size={12} /> ลบบอร์ดนี้
              </button>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.muted }}>ยังไม่มีบอร์ด — สร้างบอร์ดใหม่เพื่อเริ่มต้น</div>
        )}
      </div>
    </div>
  );
}

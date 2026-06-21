import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trello, LayoutDashboard, Trash2, LogOut } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import * as api from './lib/api';
import AuthScreen from './components/AuthScreen';
import BoardView from './components/BoardView';
import DashboardView from './components/DashboardView';

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
    return <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}><div className="text-muted text-sm">กำลังโหลด...</div></div>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
          <div className="flex items-center gap-2">
            <div className="bg-ink flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)' }}>
              <Trello size={18} className="text-white" />
            </div>
            <span className="font-fraunces font-bold text-xl text-ink">งานของฉัน</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView(view === 'dashboard' ? 'board' : 'dashboard')} className="btn btn-outline">
              {view === 'dashboard' ? <><Trello size={16} /> ดูบอร์ด</> : <><LayoutDashboard size={16} /> ภาพรวม</>}
            </button>
            <button onClick={handleLogout} title="ออกจากระบบ" className="btn btn-outline btn-icon">
              <LogOut size={16} className="text-muted" />
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {view === 'board' && (
          <div className="flex gap-2" style={{ marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
            {boards.map((b) => (
              <button key={b.id} onClick={() => setActiveBoardId(b.id)} className={`btn shrink-0 ${b.id === activeBoardId ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: 'var(--radius-full)' }}>
                {b.name}
              </button>
            ))}
            {addingBoard ? (
              <input autoFocus value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onBlur={handleAddBoard} onKeyDown={(e) => e.key === 'Enter' && handleAddBoard()} placeholder="ชื่อบอร์ดใหม่" className="input shrink-0" style={{ width: '160px', borderRadius: 'var(--radius-full)', padding: '8px 14px' }} />
            ) : (
              <button onClick={() => setAddingBoard(true)} className="btn btn-dashed shrink-0" style={{ borderRadius: 'var(--radius-full)' }}>
                <Plus size={16} /> บอร์ดใหม่
              </button>
            )}
          </div>
        )}

        {boardsLoading ? (
          <div className="text-center text-muted text-sm" style={{ padding: '40px' }}>กำลังโหลด...</div>
        ) : view === 'dashboard' ? (
          <DashboardView userId={session.user.id} boards={boards} refreshKey={refreshKey} onSelectBoard={(id) => { setActiveBoardId(id); setView('board'); }} />
        ) : activeBoard ? (
          <div className="flex-col gap-4">
            <BoardView board={activeBoard} onBoardDataChanged={() => setRefreshKey((k) => k + 1)} />
            {boards.length > 1 && (
              <button onClick={() => handleDeleteBoard(activeBoard.id)} className="btn btn-ghost text-xs" style={{ marginTop: '16px', alignSelf: 'flex-start' }}>
                <Trash2 size={14} /> ลบบอร์ดนี้
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-muted" style={{ padding: '80px 0' }}>ยังไม่มีบอร์ด — สร้างบอร์ดใหม่เพื่อเริ่มต้น</div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { LogOut, LayoutDashboard, Trello, Plus, Trash2 } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import BoardView from './components/BoardView';
import DashboardView from './components/DashboardView';
import NotificationBell from './components/NotificationBell';

export default function App() {
  const [session, setSession] = useState(undefined);
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [view, setView] = useState('board'); // 'board' | 'dashboard'
  const [addingBoard, setAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadBoards = async () => {
    if (!session) return;
    setBoardsLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const { data: bData, error: bError } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: true });
      if (bError) throw bError;
      setBoards(bData || []);
      if (bData && bData.length > 0 && !activeBoardId) {
        setActiveBoardId(bData[0].id);
      }
    } catch (e) {
      setError('โหลดข้อมูลบอร์ดไม่สำเร็จ: ' + e.message);
    } finally {
      setBoardsLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadBoards();
    else { setBoards([]); setActiveBoardId(null); }
  }, [session, refreshKey]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddBoard = async () => {
    if (!newBoardName.trim()) {
      setAddingBoard(false);
      return;
    }
    try {
      const { data, error: err } = await supabase.auth.getUser();
      if (err) throw err;
      const { data: newB, error: insertErr } = await supabase
        .from('boards')
        .insert([{ name: newBoardName.trim(), user_id: data.user.id }])
        .select()
        .single();
      if (insertErr) throw insertErr;

      // สร้างคอลัมน์เริ่มต้นให้เลย 3 อัน
      await supabase.from('columns').insert([
        { board_id: newB.id, name: 'To Do', position: 0, key: 'todo' },
        { board_id: newB.id, name: 'Doing', position: 1, key: 'doing' },
        { board_id: newB.id, name: 'Done', position: 2, key: 'done' }
      ]);

      setBoards([...boards, newB]);
      setActiveBoardId(newB.id);
      setView('board');
    } catch (e) {
      setError('สร้างบอร์ดไม่สำเร็จ: ' + e.message);
    }
    setNewBoardName('');
    setAddingBoard(false);
  };

  const handleDeleteBoard = async (id) => {
    if (boards.length <= 1) return;
    try {
      const { error: err } = await supabase.from('boards').delete().eq('id', id);
      if (err) throw err;
      const remaining = boards.filter(b => b.id !== id);
      setBoards(remaining);
      setActiveBoardId(remaining[0].id);
    } catch (e) {
      setError('ลบบอร์ดไม่สำเร็จ: ' + e.message);
    }
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);

  if (session === undefined) {
    return <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}><div className="text-muted text-sm">กำลังโหลด...</div></div>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel flex justify-between items-center wrap gap-4" style={{ marginBottom: '32px', padding: '16px 24px' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', boxShadow: 'var(--shadow-glow)' }}>
              <Trello size={20} className="text-white" />
            </div>
            <span className="font-fraunces font-bold text-2xl text-white">งานของฉัน</span>
          </div>
          <div className="flex gap-3 wrap">
            <NotificationBell boards={boards} onSelectBoard={(id) => { setActiveBoardId(id); setView('board'); }} />
            <button onClick={() => setView(view === 'dashboard' ? 'board' : 'dashboard')} className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: 'var(--radius-full)' }}>
              {view === 'dashboard' ? <><Trello size={16} /> กลับสู่บอร์ด</> : <><LayoutDashboard size={16} /> ภาพรวมทั้งหมด</>}
            </button>
            <button onClick={handleLogout} title="ออกจากระบบ" className="btn btn-outline btn-icon" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--accent-red)', borderRadius: 'var(--radius-full)' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {view === 'board' && (
          <div className="flex gap-3" style={{ marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
            {boards.map((b) => (
              <button key={b.id} onClick={() => setActiveBoardId(b.id)} className={`btn shrink-0 ${b.id === activeBoardId ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px', fontSize: 14 }}>
                {b.name}
              </button>
            ))}
            {addingBoard ? (
              <input autoFocus value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onBlur={handleAddBoard} onKeyDown={(e) => e.key === 'Enter' && handleAddBoard()} placeholder="ชื่อบอร์ดใหม่" className="input shrink-0" style={{ width: '180px', borderRadius: 'var(--radius-full)', padding: '10px 16px' }} />
            ) : (
              <button onClick={() => setAddingBoard(true)} className="btn btn-dashed shrink-0" style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px' }}>
                <Plus size={16} className="text-cyan" /> สร้างบอร์ดใหม่
              </button>
            )}
          </div>
        )}

        {boardsLoading ? (
          <div className="text-center text-muted text-sm" style={{ padding: '60px' }}>กำลังโหลดข้อมูลของคุณ...</div>
        ) : view === 'dashboard' ? (
          <DashboardView userId={session.user.id} boards={boards} refreshKey={refreshKey} onSelectBoard={(id) => { setActiveBoardId(id); setView('board'); }} />
        ) : activeBoard ? (
          <div className="flex-col gap-6">
            <BoardView board={activeBoard} onBoardDataChanged={() => setRefreshKey((k) => k + 1)} />
            {boards.length > 1 && (
              <button onClick={() => handleDeleteBoard(activeBoard.id)} className="btn btn-ghost text-xs" style={{ alignSelf: 'flex-start', color: 'var(--accent-red)' }}>
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

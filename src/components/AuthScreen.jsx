import React, { useState } from 'react';
import { Trello, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || !password) {
      setError('กรอกอีเมลและรหัสผ่านให้ครบ');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setInfo('สมัครสำเร็จ — เช็คอีเมลเพื่อยืนยันบัญชี');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด ลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="flex items-center justify-center gap-3" style={{ marginBottom: 32 }}>
          <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', boxShadow: 'var(--shadow-glow)' }}>
            <Trello size={24} className="text-white" />
          </div>
          <span className="font-fraunces font-bold text-3xl text-white" style={{ letterSpacing: '0.5px' }}>งานของฉัน</span>
        </div>

        <div className="glass-panel" style={{ padding: 32 }}>
          <h1 className="font-fraunces font-bold text-xl text-center text-white" style={{ margin: '0 0 24px' }}>
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
          </h1>

          <form onSubmit={handleSubmit}>
            <label className="text-muted text-xs font-medium" style={{ display: 'block', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              style={{ marginBottom: 16, padding: '12px 16px' }}
            />

            <label className="text-muted text-xs font-medium" style={{ display: 'block', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="input"
              style={{ marginBottom: 24, padding: '12px 16px' }}
            />

            {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}
            {info && <div className="text-green text-sm font-medium" style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)' }}>{info}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 16, opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={18} className="spin" />}
              {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="text-center text-sm text-muted" style={{ marginTop: 24 }}>
            {mode === 'login' ? (
              <>ยังไม่มีบัญชี? <button onClick={() => { setMode('signup'); setError(''); setInfo(''); }} className="btn-ghost" style={{ border: 'none', background: 'none', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', padding: '0 4px' }}>สมัครสมาชิก</button></>
            ) : (
              <>มีบัญชีอยู่แล้ว? <button onClick={() => { setMode('login'); setError(''); setInfo(''); }} className="btn-ghost" style={{ border: 'none', background: 'none', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', padding: '0 4px' }}>เข้าสู่ระบบ</button></>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

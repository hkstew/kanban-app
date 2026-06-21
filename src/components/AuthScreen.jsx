import React, { useState } from 'react';
import { Trello, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
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
        setInfo('สมัครสำเร็จ — เช็คอีเมลเพื่อยืนยันบัญชี (ถ้าโปรเจกต์ Supabase เปิดให้ยืนยันอีเมล)');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด ลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div className="flex items-center justify-center gap-2" style={{ marginBottom: 28 }}>
          <div className="bg-ink flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)' }}>
            <Trello size={17} className="text-white" />
          </div>
          <span className="font-fraunces font-bold text-xl">งานของฉัน</span>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h1 className="font-fraunces font-bold text-lg text-center" style={{ margin: '0 0 18px' }}>
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
          </h1>

          <form onSubmit={handleSubmit}>
            <label className="text-muted text-xs font-medium" style={{ display: 'block', marginBottom: 6 }}>อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              style={{ marginBottom: 14 }}
            />

            <label className="text-muted text-xs font-medium" style={{ display: 'block', marginBottom: 6 }}>รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="input"
              style={{ marginBottom: 18 }}
            />

            {error && <div className="text-error text-sm font-medium" style={{ marginBottom: 14 }}>{error}</div>}
            {info && <div className="text-green text-sm font-medium" style={{ marginBottom: 14 }}>{info}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
            >
              {loading && <Loader2 size={15} className="spin" />}
              {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="text-center text-sm text-muted" style={{ marginTop: 16 }}>
            {mode === 'login' ? (
              <>ยังไม่มีบัญชี? <button onClick={() => { setMode('signup'); setError(''); setInfo(''); }} className="btn-ghost" style={{ border: 'none', background: 'none', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>สมัครสมาชิก</button></>
            ) : (
              <>มีบัญชีอยู่แล้ว? <button onClick={() => { setMode('login'); setError(''); setInfo(''); }} className="btn-ghost" style={{ border: 'none', background: 'none', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>เข้าสู่ระบบ</button></>
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

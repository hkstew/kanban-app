import React, { useState } from 'react';
import { Trello, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const COLORS = {
  ink: '#1C1B1A',
  paper: '#FAF8F4',
  line: '#D9D4C9',
  muted: '#8A857C',
  accent: '#E8645A',
};

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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: COLORS.paper, padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trello size={17} color={COLORS.paper} />
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 21 }}>งานของฉัน</span>
        </div>

        <div style={{ background: 'white', border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 24 }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 600, margin: '0 0 18px', textAlign: 'center' }}>
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
          </h1>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 5 }}>อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }}
            />

            <label style={{ fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 5 }}>รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: `1px solid ${COLORS.line}`, fontSize: 14, marginBottom: 18, boxSizing: 'border-box' }}
            />

            {error && <div style={{ color: COLORS.accent, fontSize: 13, marginBottom: 14 }}>{error}</div>}
            {info && <div style={{ color: '#3D7A6B', fontSize: 13, marginBottom: 14 }}>{info}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: COLORS.ink, color: COLORS.paper, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <Loader2 size={15} className="spin" />}
              {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.muted }}>
            {mode === 'login' ? (
              <>ยังไม่มีบัญชี? <button onClick={() => { setMode('signup'); setError(''); setInfo(''); }} style={{ background: 'none', border: 'none', color: COLORS.ink, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>สมัครสมาชิก</button></>
            ) : (
              <>มีบัญชีอยู่แล้ว? <button onClick={() => { setMode('login'); setError(''); setInfo(''); }} style={{ background: 'none', border: 'none', color: COLORS.ink, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>เข้าสู่ระบบ</button></>
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

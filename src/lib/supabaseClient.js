import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'ยังไม่ได้ตั้งค่า Supabase URL/Key — ใส่ค่าในไฟล์ .env (ดู .env.example) แล้ว restart dev server'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

# Kanban App — คู่มือติดตั้งและ Deploy

เว็บแอป Kanban board ส่วนตัว เชื่อมต่อ Supabase (database + login) สร้างด้วย React + Vite

---

## จุดที่ต้องใส่ค่าของคุณเอง

**ไฟล์: `.env.example`** → ต้องเปลี่ยนชื่อเป็น `.env` แล้วใส่ค่า 2 บรรทัดนี้:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

หาค่าได้จาก Supabase Dashboard ของคุณ → เมนู **Settings > API**
- `VITE_SUPABASE_URL` = ค่าในช่อง **Project URL**
- `VITE_SUPABASE_ANON_KEY` = ค่าในช่อง **anon public** (อยู่ใต้ Project API keys)

ห้ามใช้ค่า `service_role` key เด็ดขาด (อันนั้นเป็น secret key ฝั่งเซิร์ฟเวอร์เท่านั้น ใส่ใน frontend ไม่ได้)

---

## ขั้นตอนที่ 1: ตั้งฐานข้อมูลใน Supabase

1. เข้า Supabase Dashboard ของโปรเจกต์คุณ
2. เมนูซ้าย ไปที่ **SQL Editor** → กด **New query**
3. เปิดไฟล์ `supabase_schema.sql` ในโปรเจกต์นี้ → คัดลอกทั้งหมด → วางในช่อง SQL Editor
4. กด **Run** (มุมขวาล่าง) — จะสร้างตาราง boards, columns, tags, cards พร้อมระบบความปลอดภัย (RLS) ให้อัตโนมัติ

ถ้าต้องการให้ login ได้ทันทีโดยไม่ต้องยืนยันอีเมล (สะดวกกว่าตอนทดสอบ):
- ไปที่ **Authentication > Providers > Email**
- ปิดตัวเลือก "Confirm email"

---

## ขั้นตอนที่ 2: ใส่ค่า Supabase ในโปรเจกต์

1. คัดลอกไฟล์ `.env.example` แล้วเปลี่ยนชื่อเป็น `.env`
2. เปิดไฟล์ `.env` ใส่ค่า URL และ key ตามที่บอกไว้ด้านบน
3. บันทึกไฟล์

---

## ขั้นตอนที่ 3: ทดสอบบนเครื่องตัวเอง (ไม่บังคับ แต่แนะนำ)

ต้องมี [Node.js](https://nodejs.org) ติดตั้งไว้ก่อน (เวอร์ชัน 18 ขึ้นไป)

```bash
npm install
npm run dev
```

จะเปิดเว็บที่ `http://localhost:5173` ลองสมัครบัญชี/login/สร้างบอร์ดดูว่าทำงานถูกต้อง

---

## ขั้นตอนที่ 4: Deploy ขึ้น Vercel (ฟรี)

**วิธีที่ง่ายที่สุด — ผ่านเว็บ Vercel โดยตรง:**

1. เข้า [vercel.com](https://vercel.com) → สมัคร/login (ใช้ GitHub login ได้)
2. อัปโหลดโค้ดนี้ขึ้น GitHub ก่อน (สร้าง repo ใหม่ แล้ว push โค้ดทั้งโฟลเดอร์นี้ขึ้นไป)
   - **สำคัญ:** ห้าม push ไฟล์ `.env` ขึ้น GitHub (ไฟล์ `.gitignore` กันไว้ให้แล้ว แต่เช็คอีกทีว่าไม่หลุดไป)
3. ใน Vercel กด **Add New > Project** → เลือก repo ที่เพิ่ง push
4. Vercel จะตรวจพบว่าเป็นโปรเจกต์ Vite อัตโนมัติ ไม่ต้องตั้งค่า build command เอง
5. ก่อนกด Deploy ให้เพิ่ม **Environment Variables** (สำคัญมาก เพราะไฟล์ `.env` ไม่ได้ขึ้นไปด้วย):
   - `VITE_SUPABASE_URL` = ค่าเดียวกับใน `.env`
   - `VITE_SUPABASE_ANON_KEY` = ค่าเดียวกับใน `.env`
6. กด **Deploy** รอประมาณ 1-2 นาที จะได้ URL ของเว็บแอป เช่น `your-kanban.vercel.app`

**ทางเลือก: ไม่อยากใช้ GitHub** — ใช้ [Vercel CLI](https://vercel.com/docs/cli) แทนได้ (ติดตั้ง Node.js แล้วรัน `npx vercel` ในโฟลเดอร์นี้ จะถามทีละขั้นตอนเอง รวมถึงให้ใส่ environment variables ผ่าน terminal ได้เลย)

---

## โครงสร้างไฟล์

```
kanban-app/
├── .env.example          ← เปลี่ยนชื่อเป็น .env แล้วใส่ค่า Supabase
├── supabase_schema.sql   ← รันใน Supabase SQL Editor ครั้งเดียว
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                  ← หน้าหลัก จัดการ login state + นำทาง
    ├── index.css
    ├── lib/
    │   ├── supabaseClient.js    ← เชื่อมต่อ Supabase
    │   └── api.js                ← ฟังก์ชันอ่าน/เขียนข้อมูลทั้งหมด
    └── components/
        ├── AuthScreen.jsx        ← หน้า login/สมัครสมาชิก
        ├── BoardView.jsx         ← หน้าบอร์ด (คอลัมน์ + การ์ด)
        ├── DashboardView.jsx     ← หน้าภาพรวมทุกบอร์ด
        ├── Column.jsx
        ├── CardItem.jsx
        └── CardModal.jsx         ← popup แก้ไขรายละเอียดการ์ด
```

---

## ฟีเจอร์ที่มี

- ระบบ login/สมัครสมาชิกด้วยอีเมล (Supabase Auth) — ข้อมูลแต่ละคนแยกกันสนิท เห็นเฉพาะของตัวเอง
- หลายบอร์ด สลับดูได้
- ลาก-วางการ์ดระหว่างคอลัมน์ เพิ่ม/ลบ/เปลี่ยนชื่อคอลัมน์เอง
- การ์ดงาน: รายละเอียด, แท็กสี, deadline (ขึ้นสีเตือน), priority, checklist ย่อย
- ค้นหา + กรองตามแท็ก
- Progress bar ต่อบอร์ด
- Dashboard ภาพรวมทุกบอร์ด: งานเลยกำหนด/ใกล้ครบกำหนด, งานเสร็จในสัปดาห์นี้
- Quick add — พิมพ์แล้ว Enter เพิ่มการ์ดทันที
- ใช้ข้ามอุปกรณ์ได้ (มือถือ/คอม) ข้อมูล sync ผ่าน Supabase แบบเรียลไทม์เมื่อโหลดหน้าใหม่

## ข้อควรรู้

- ระบบยังไม่ใช่ real-time sync (ถ้าเปิด 2 อุปกรณ์พร้อมกันแล้วแก้พร้อมกัน ฝั่งที่บันทึกทีหลังจะทับฝั่งแรก) — ถ้าต้องการ real-time แจ้งได้ จะเพิ่ม Supabase Realtime subscription ให้ภายหลัง
- ลืมรหัสผ่าน: ตอนนี้ยังไม่มีปุ่ม "ลืมรหัสผ่าน" ถ้าต้องการ แจ้งได้ จะเพิ่มให้

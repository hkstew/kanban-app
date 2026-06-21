-- ---------- ตาราง boards ----------
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------- ตาราง columns ----------
create table if not exists columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  name text not null,
  position int not null default 0,
  key text, -- 'todo' | 'doing' | 'done' | null (สำหรับคอลัมน์ที่ผู้ใช้สร้างเอง)
  created_at timestamptz not null default now()
);

-- ---------- ตาราง tags ----------
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  name text not null,
  color text not null default '#3D7A6B',
  created_at timestamptz not null default now()
);

-- ---------- ตาราง cards ----------
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  column_id uuid not null references columns(id) on delete cascade,
  title text not null,
  "desc" text default '',
  priority text default 'none', -- 'none' | 'low' | 'medium' | 'high'
  deadline date,
  tags jsonb default '[]'::jsonb,       -- array ของ tag id
  checklist jsonb default '[]'::jsonb,  -- array ของ {id, text, done}
  done_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Index เพื่อความเร็ว ----------
create index if not exists idx_boards_user on boards(user_id);
create index if not exists idx_columns_board on columns(board_id);
create index if not exists idx_tags_board on tags(board_id);
create index if not exists idx_cards_board on cards(board_id);
create index if not exists idx_cards_column on cards(column_id);

-- ====================================================================
-- Row Level Security (RLS) — ทำให้แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง
-- ====================================================================

alter table boards enable row level security;
alter table columns enable row level security;
alter table tags enable row level security;
alter table cards enable row level security;

-- boards: เจ้าของเท่านั้นที่เข้าถึงได้
create policy "boards_select_own" on boards for select using (auth.uid() = user_id);
create policy "boards_insert_own" on boards for insert with check (auth.uid() = user_id);
create policy "boards_update_own" on boards for update using (auth.uid() = user_id);
create policy "boards_delete_own" on boards for delete using (auth.uid() = user_id);

-- columns: เข้าถึงได้ถ้า board นั้นเป็นของตัวเอง
create policy "columns_select_own" on columns for select using (
  exists (select 1 from boards where boards.id = columns.board_id and boards.user_id = auth.uid())
);
create policy "columns_insert_own" on columns for insert with check (
  exists (select 1 from boards where boards.id = columns.board_id and boards.user_id = auth.uid())
);
create policy "columns_update_own" on columns for update using (
  exists (select 1 from boards where boards.id = columns.board_id and boards.user_id = auth.uid())
);
create policy "columns_delete_own" on columns for delete using (
  exists (select 1 from boards where boards.id = columns.board_id and boards.user_id = auth.uid())
);

-- tags: เข้าถึงได้ถ้า board นั้นเป็นของตัวเอง
create policy "tags_select_own" on tags for select using (
  exists (select 1 from boards where boards.id = tags.board_id and boards.user_id = auth.uid())
);
create policy "tags_insert_own" on tags for insert with check (
  exists (select 1 from boards where boards.id = tags.board_id and boards.user_id = auth.uid())
);
create policy "tags_update_own" on tags for update using (
  exists (select 1 from boards where boards.id = tags.board_id and boards.user_id = auth.uid())
);
create policy "tags_delete_own" on tags for delete using (
  exists (select 1 from boards where boards.id = tags.board_id and boards.user_id = auth.uid())
);

-- cards: เข้าถึงได้ถ้า board นั้นเป็นของตัวเอง
create policy "cards_select_own" on cards for select using (
  exists (select 1 from boards where boards.id = cards.board_id and boards.user_id = auth.uid())
);
create policy "cards_insert_own" on cards for insert with check (
  exists (select 1 from boards where boards.id = cards.board_id and boards.user_id = auth.uid())
);
create policy "cards_update_own" on cards for update using (
  exists (select 1 from boards where boards.id = cards.board_id and boards.user_id = auth.uid())
);
create policy "cards_delete_own" on cards for delete using (
  exists (select 1 from boards where boards.id = cards.board_id and boards.user_id = auth.uid())
);

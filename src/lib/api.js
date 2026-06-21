import { supabase } from './supabaseClient';

// ---------- Boards ----------
export async function fetchBoards(userId) {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createBoard(userId, name) {
  const { data, error } = await supabase
    .from('boards')
    .insert({ user_id: userId, name })
    .select()
    .single();
  if (error) throw error;

  // default columns
  const defaultCols = [
    { board_id: data.id, name: 'To do', position: 0, key: 'todo' },
    { board_id: data.id, name: 'Doing', position: 1, key: 'doing' },
    { board_id: data.id, name: 'Done', position: 2, key: 'done' },
  ];
  const { error: colErr } = await supabase.from('columns').insert(defaultCols);
  if (colErr) throw colErr;

  return data;
}

export async function deleteBoard(boardId) {
  const { error } = await supabase.from('boards').delete().eq('id', boardId);
  if (error) throw error;
}

// ---------- Columns ----------
export async function fetchColumns(boardId) {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createColumn(boardId, name, position) {
  const { data, error } = await supabase
    .from('columns')
    .insert({ board_id: boardId, name, position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function renameColumn(columnId, name) {
  const { error } = await supabase.from('columns').update({ name }).eq('id', columnId);
  if (error) throw error;
}

export async function deleteColumn(columnId) {
  const { error } = await supabase.from('columns').delete().eq('id', columnId);
  if (error) throw error;
}

// ---------- Tags ----------
export async function fetchTags(boardId) {
  const { data, error } = await supabase.from('tags').select('*').eq('board_id', boardId);
  if (error) throw error;
  return data;
}

export async function createTag(boardId, name, color) {
  const { data, error } = await supabase
    .from('tags')
    .insert({ board_id: boardId, name, color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Cards ----------
export async function fetchCards(boardId) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchAllCardsForUser(userId) {
  const { data, error } = await supabase
    .from('cards')
    .select('*, boards!inner(user_id, name)')
    .eq('boards.user_id', userId);
  if (error) throw error;
  return data;
}

export async function createCard(card) {
  const { data, error } = await supabase.from('cards').insert(card).select().single();
  if (error) throw error;
  return data;
}

export async function updateCard(cardId, updates) {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCard(cardId) {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) throw error;
}

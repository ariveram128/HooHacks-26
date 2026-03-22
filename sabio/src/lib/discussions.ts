import { supabase } from './supabase';

export type Discussion = {
  id: string;
  user_id: string;
  user_name: string;
  content_type: 'lesson' | 'phrase';
  content_id: string;
  body: string;
  upvotes: number;
  created_at: string;
  parent_id: string | null;
};

export async function fetchDiscussions(
  contentType: 'lesson' | 'phrase',
  contentId: string,
): Promise<Discussion[]> {
  const { data, error } = await supabase
    .from('discussions')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchDiscussions error:', error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    ...row,
    parent_id: row.parent_id ?? null,
  })) as Discussion[];
}

export async function postDiscussion(
  contentType: 'lesson' | 'phrase',
  contentId: string,
  body: string,
  userId: string,
  userName: string,
  parentId?: string | null,
): Promise<Discussion | null> {
  const { data, error } = await supabase
    .from('discussions')
    .insert({
      user_id: userId,
      user_name: userName,
      content_type: contentType,
      content_id: contentId,
      body,
      ...(parentId ? { parent_id: parentId } : {}),
    })
    .select()
    .single();

  if (error) {
    console.error('postDiscussion error:', error.message);
    return null;
  }
  return data;
}

export async function deleteDiscussion(id: string): Promise<boolean> {
  const { error } = await supabase.from('discussions').delete().eq('id', id);
  if (error) {
    console.error('deleteDiscussion error:', error.message);
    return false;
  }
  return true;
}

export async function upvoteDiscussion(id: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('discussions')
    .select('upvotes')
    .eq('id', id)
    .single();

  if (!existing) return false;

  const { error } = await supabase
    .from('discussions')
    .update({ upvotes: existing.upvotes + 1 })
    .eq('id', id);

  if (error) {
    console.error('upvoteDiscussion error:', error.message);
    return false;
  }
  return true;
}

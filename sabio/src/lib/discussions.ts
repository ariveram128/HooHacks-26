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

export type UpvoteResult = 'ok' | 'already' | 'fail';

/** Returns which discussion ids the current user has already upvoted. */
export async function fetchUpvotedIdsForUser(discussionIds: string[]): Promise<Set<string>> {
  if (discussionIds.length === 0) return new Set();

  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return new Set();

  const { data, error } = await supabase
    .from('discussion_upvotes')
    .select('discussion_id')
    .eq('user_id', uid)
    .in('discussion_id', discussionIds);

  if (error) {
    console.error('fetchUpvotedIdsForUser error:', error.message);
    return new Set();
  }

  return new Set((data ?? []).map((r) => r.discussion_id as string));
}

/**
 * One upvote per user per comment (enforced by discussion_upvotes table).
 * Requires migration 003_discussion_upvotes.sql. If table is missing, returns fail.
 */
export async function upvoteDiscussion(discussionId: string): Promise<UpvoteResult> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return 'fail';

  const { error: insertError } = await supabase.from('discussion_upvotes').insert({
    user_id: uid,
    discussion_id: discussionId,
  });

  if (insertError) {
    if (insertError.code === '23505') return 'already';
    console.error('upvoteDiscussion insert:', insertError.message);
    return 'fail';
  }

  const { data: row } = await supabase
    .from('discussions')
    .select('upvotes')
    .eq('id', discussionId)
    .single();

  if (!row) {
    await supabase
      .from('discussion_upvotes')
      .delete()
      .eq('user_id', uid)
      .eq('discussion_id', discussionId);
    return 'fail';
  }

  const { error: updateError } = await supabase
    .from('discussions')
    .update({ upvotes: row.upvotes + 1 })
    .eq('id', discussionId);

  if (updateError) {
    console.error('upvoteDiscussion update:', updateError.message);
    await supabase
      .from('discussion_upvotes')
      .delete()
      .eq('user_id', uid)
      .eq('discussion_id', discussionId);
    return 'fail';
  }

  return 'ok';
}

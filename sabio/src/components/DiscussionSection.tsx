import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, spacing, radii } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  Discussion,
  fetchDiscussions,
  postDiscussion,
  deleteDiscussion,
  upvoteDiscussion,
} from '../lib/discussions';
import { TrashIcon, ChevronRightIcon } from './Icons';

type Props = {
  contentType: 'lesson' | 'phrase';
  contentId: string;
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildRepliesMap(list: Discussion[]): Map<string, Discussion[]> {
  const map = new Map<string, Discussion[]>();
  for (const c of list) {
    const pid = c.parent_id;
    if (!pid) continue;
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid)!.push(c);
  }
  for (const arr of map.values()) {
    arr.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }
  return map;
}

function getRoots(list: Discussion[]): Discussion[] {
  return list
    .filter((c) => !c.parent_id)
    .sort(
      (a, b) =>
        b.upvotes - a.upvotes ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export default function DiscussionSection({ contentType, contentId }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyPosting, setReplyPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchDiscussions(contentType, contentId);
    setComments(data);
    setLoading(false);
  }, [contentType, contentId]);

  useEffect(() => {
    load();
  }, [load]);

  const repliesMap = useMemo(() => buildRepliesMap(comments), [comments]);
  const roots = useMemo(() => getRoots(comments), [comments]);

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);
    const name = user.user_metadata?.name || user.email || 'Anonymous';
    const comment = await postDiscussion(contentType, contentId, text.trim(), user.id, name);
    if (comment) {
      setComments((prev) => [comment, ...prev]);
      setText('');
    }
    setPosting(false);
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return;
    setReplyPosting(true);
    const name = user.user_metadata?.name || user.email || 'Anonymous';
    const reply = await postDiscussion(
      contentType,
      contentId,
      replyText.trim(),
      user.id,
      name,
      parentId,
    );
    if (reply) {
      setComments((prev) => [...prev, reply]);
      setReplyText('');
      setReplyingToId(null);
    }
    setReplyPosting(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteDiscussion(id);
    if (ok) await load();
  };

  const handleUpvote = async (id: string) => {
    const ok = await upvoteDiscussion(id);
    if (ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c)),
      );
    }
  };

  const renderComment = (item: Discussion, depth: number): React.ReactNode => {
    const isAuthor = user?.id === item.user_id;
    const replies = repliesMap.get(item.id) ?? [];
    const isReplying = replyingToId === item.id;

    return (
      <View key={item.id} style={[styles.threadWrap, depth > 0 && styles.threadIndent]}>
        <View style={styles.comment}>
          <View style={styles.commentHeader}>
            <View style={[styles.avatar, depth > 0 && styles.avatarSmall]}>
              <Text style={[styles.avatarText, depth > 0 && styles.avatarTextSmall]}>
                {item.user_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.commentMeta}>
              <Text style={styles.commentName}>{item.user_name}</Text>
              <Text style={styles.commentTime}>{timeAgo(item.created_at)}</Text>
            </View>
            {isAuthor && (
              <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
                <TrashIcon size={16} color={colors.warmGrayLight} />
              </Pressable>
            )}
          </View>
          <Text style={styles.commentBody}>{item.body}</Text>
          <View style={styles.commentActions}>
            <Pressable onPress={() => handleUpvote(item.id)} style={styles.upvoteBtn}>
              <Text style={styles.upvoteArrow}>▲</Text>
              <Text style={styles.upvoteCount}>{item.upvotes}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setReplyingToId(isReplying ? null : item.id);
                setReplyText('');
              }}
              style={styles.replyLink}
            >
              <Text style={styles.replyLinkText}>{isReplying ? 'Cancel' : 'Reply'}</Text>
            </Pressable>
          </View>

          {isReplying && (
            <View style={styles.replyComposer}>
              <TextInput
                style={styles.replyInput}
                placeholder={`Reply to ${item.user_name}...`}
                placeholderTextColor={colors.warmGrayLight}
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={() => handlePostReply(item.id)}
                disabled={replyPosting || !replyText.trim()}
                style={[
                  styles.replyPostBtn,
                  (!replyText.trim() || replyPosting) && { opacity: 0.5 },
                ]}
              >
                {replyPosting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.replyPostBtnText}>Post reply</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {replies.length > 0 && (
          <View style={styles.repliesColumn}>
            {replies.map((r) => renderComment(r, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Discussion</Text>

      {/* Top-level composer */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question or share a tip..."
          placeholderTextColor={colors.warmGrayLight}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handlePost}
          disabled={posting || !text.trim()}
          style={[styles.postBtn, (!text.trim() || posting) && { opacity: 0.5 }]}
        >
          {posting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <ChevronRightIcon size={18} color={colors.white} />
          )}
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.teal} style={{ marginTop: 20 }} />
      ) : roots.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            No comments yet. Be the first to start a discussion!
          </Text>
        </View>
      ) : (
        <View style={styles.threadList}>{roots.map((r) => renderComment(r, 0))}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.charcoal,
    maxHeight: 80,
  },
  postBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },

  threadList: {
    gap: 12,
  },
  threadWrap: {
    marginBottom: 4,
  },
  threadIndent: {
    marginLeft: 14,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.creamDark,
  },
  repliesColumn: {
    marginTop: 8,
    gap: 8,
  },

  comment: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  avatarText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.white,
  },
  avatarTextSmall: {
    fontSize: 11,
  },
  commentMeta: {
    flex: 1,
  },
  commentName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.charcoal,
  },
  commentTime: {
    fontFamily: fonts.light,
    fontSize: 11,
    color: colors.warmGrayLight,
  },
  commentBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoalLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.creamLight,
  },
  upvoteArrow: {
    fontSize: 12,
    color: colors.teal,
  },
  upvoteCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.teal,
  },
  replyLink: {
    paddingVertical: 4,
  },
  replyLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.terracotta,
  },

  replyComposer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
    gap: 8,
  },
  replyInput: {
    backgroundColor: colors.creamLight,
    borderWidth: 1,
    borderColor: colors.creamDark,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.charcoal,
    maxHeight: 72,
  },
  replyPostBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.teal,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  replyPostBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.white,
  },

  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.light,
    fontSize: 14,
    color: colors.warmGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export type PostCategory = 'confession' | 'tea' | 'meme' | 'poll' | 'npc_week' | 'teacher' | 'student_desc' | 'dare' | 'notice';
export type VoteType = 'up' | 'down';

export interface Profile {
  id: string;
  username: string;
  aura: number;
  posts_count: number;
  comments_count: number;
  upvotes_received: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: PostCategory;
  is_anonymous: boolean;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  user_vote?: VoteType | null;
  poll_options?: PollOption[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  user_vote?: VoteType | null;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface PollOption {
  id: string;
  post_id: string;
  option_text: string;
  vote_count: number;
  created_at: string;
  user_voted?: boolean;
}

export interface PollVote {
  id: string;
  user_id: string;
  poll_option_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  is_resolved: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  description: string;
  earned_at: string;
}

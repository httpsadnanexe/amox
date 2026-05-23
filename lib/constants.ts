export const CATEGORIES = {
  confession: { label: 'Confessions', icon: 'Heart', color: '#ef4444' },
  tea: { label: 'Tea Table', icon: 'Coffee', color: '#f59e0b' },
  meme: { label: 'Memes', icon: 'Laugh', color: '#10b981' },
  poll: { label: 'Polls', icon: 'BarChart3', color: '#3b82f6' },
  npc_week: { label: 'NPC of the Week', icon: 'User', color: '#8b5cf6' },
  teacher: { label: 'Teachers', icon: 'GraduationCap', color: '#ec4899' },
  student_desc: { label: 'Student Descriptions', icon: 'Users', color: '#06b6d4' },
} as const;

export const ACHIEVEMENTS = {
  first_post: { label: 'First Post', description: 'Made your first post' },
  ten_posts: { label: 'Chatterbox', description: 'Made 10 posts' },
  fifty_upvotes: { label: 'Popular', description: 'Received 50 upvotes' },
  first_comment: { label: 'Commenter', description: 'Made your first comment' },
  tea_spiller: { label: 'Tea Spiller', description: 'Posted 5 tea threads' },
  confessor: { label: 'Confessor', description: 'Posted 5 confessions' },
} as const;

export const ANONYMOUS_ADJECTIVES = [
  'Shadow', 'Phantom', 'Ghost', 'Mystic', 'Silent', 'Hidden', 'Secret', 'Dark',
  'Cosmic', 'Stealth', 'Crypto', 'Anon', 'Covert', 'Veiled', 'Unknown', 'Blurry',
];

export const ANONYMOUS_NOUNS = [
  'Penguin', 'Fox', 'Wolf', 'Raven', 'Owl', 'Hawk', 'Dragon', 'Phoenix',
  'Sphinx', 'Wizard', 'Knight', 'Ninja', 'Samurai', 'Viking', 'Panda', 'Cobra',
];

export function generateUsername(): string {
  const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
  const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
  const num = Math.floor(Math.random() * 999) + 1;
  return `${adj}${noun}${num}`;
}

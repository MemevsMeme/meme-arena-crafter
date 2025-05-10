
export const APP_NAME = 'MemeVsMeme';

export const MEME_TEMPLATES = [
  {
    id: 'drake',
    name: 'Drake Hotline Bling',
    url: '/templates/drake.jpg',
    textPositions: [
      { x: 50, y: 25, maxWidth: 200, fontSize: 24 },
      { x: 50, y: 75, maxWidth: 200, fontSize: 24 },
    ],
  },
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend',
    url: '/templates/distracted-boyfriend.jpg',
    textPositions: [
      { x: 25, y: 20, maxWidth: 150, fontSize: 20 },
      { x: 50, y: 20, maxWidth: 150, fontSize: 20 },
      { x: 75, y: 20, maxWidth: 150, fontSize: 20 },
    ],
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    url: '/templates/change-my-mind.jpg',
    textPositions: [
      { x: 50, y: 30, maxWidth: 250, fontSize: 28 },
    ],
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    url: '/templates/two-buttons.jpg',
    textPositions: [
      { x: 25, y: 10, maxWidth: 100, fontSize: 18 },
      { x: 75, y: 10, maxWidth: 100, fontSize: 18 },
      { x: 50, y: 80, maxWidth: 200, fontSize: 24 },
    ],
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    url: '/templates/expanding-brain.jpg',
    textPositions: [
      { x: 75, y: 20, maxWidth: 150, fontSize: 20 },
      { x: 75, y: 40, maxWidth: 150, fontSize: 20 },
      { x: 75, y: 60, maxWidth: 150, fontSize: 20 },
      { x: 75, y: 80, maxWidth: 150, fontSize: 20 },
    ],
  },
];

export const CAPTION_STYLES = [
  { id: 'funny', name: 'Funny' },
  { id: 'dark', name: 'Dark Humor' },
  { id: 'wholesome', name: 'Wholesome' },
  { id: 'sarcastic', name: 'Sarcastic' },
];

// Mock data for development
export const MOCK_PROMPTS = [
  {
    id: '1',
    text: 'When your code works on the first try',
    theme: 'tech',
    tags: ['coding', 'tech', 'funny'],
    active: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000), // 24 hours from now
  },
  {
    id: '2',
    text: 'Me explaining why I need yet another streaming service',
    theme: 'entertainment',
    tags: ['streaming', 'money', 'funny'],
    active: false,
    startDate: new Date(Date.now() - 86400000), // 24 hours ago
    endDate: new Date(),
  },
];

export const MOCK_USERS = [
  {
    id: '1',
    username: 'memequeen',
    avatarUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=memequeen',
    memeStreak: 5,
    wins: 12,
    losses: 7,
    level: 4,
    xp: 450,
    createdAt: new Date(Date.now() - 1000000000),
  },
  {
    id: '2',
    username: 'laughmaster',
    avatarUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=laughmaster',
    memeStreak: 2,
    wins: 8,
    losses: 4,
    level: 3,
    xp: 320,
    createdAt: new Date(Date.now() - 2000000000),
  },
];

export const MOCK_MEMES = [
  {
    id: '1',
    prompt: 'When your code works on the first try',
    imageUrl: '/templates/drake.jpg',
    ipfsCid: 'mockCid1',
    caption: 'Debugging for hours\nAdding console.log and it works instantly',
    creatorId: '1',
    votes: 24,
    createdAt: new Date(Date.now() - 3600000),
    tags: ['coding', 'tech'],
  },
  {
    id: '2',
    prompt: 'Me explaining why I need yet another streaming service',
    imageUrl: '/templates/distracted-boyfriend.jpg',
    ipfsCid: 'mockCid2',
    caption: 'My bank account\nMe\nNew streaming service with one show I want to watch',
    creatorId: '2',
    votes: 18,
    createdAt: new Date(Date.now() - 7200000),
    tags: ['money', 'streaming'],
  },
];

export const MOCK_BATTLES = [
  {
    id: '1',
    promptId: '1',
    memeOneId: '1',
    memeTwoId: '2',
    voteCount: 42,
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() + 3600000),
    status: 'active' as 'active' | 'completed' | 'cancelled',
  },
];

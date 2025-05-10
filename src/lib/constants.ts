
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

// Add back mock data temporarily to fix build errors
// These will be removed once components are properly updated
export const MOCK_MEMES = [
  {
    id: '1',
    imageUrl: '/templates/drake.jpg',
    caption: 'When you use AI\nWhen you write code yourself',
    prompt: 'Create a meme about programming',
    creator: { id: '1', username: 'mememaster', level: 5, avatarUrl: '' },
    votes: 42,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    imageUrl: '/templates/distracted-boyfriend.jpg',
    caption: 'Me\nNew JS Framework\nMy Current Project',
    prompt: 'Create a meme about web development',
    creator: { id: '2', username: 'webdev', level: 3, avatarUrl: '' },
    votes: 28,
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_USERS = [
  {
    id: '1',
    username: 'mememaster',
    level: 5,
    xp: 1250,
    avatarUrl: '',
    wins: 15,
    losses: 5,
    memeStreak: 7,
  },
  {
    id: '2',
    username: 'webdev',
    level: 3,
    xp: 750,
    avatarUrl: '',
    wins: 8,
    losses: 10,
    memeStreak: 3,
  },
  {
    id: '3',
    username: 'funnyperson',
    level: 4,
    xp: 900,
    avatarUrl: '',
    wins: 12,
    losses: 8,
    memeStreak: 5,
  },
];

export const MOCK_BATTLES = [
  {
    id: '1',
    memeOneId: '1',
    memeTwoId: '2',
    promptId: '1',
    status: 'active',
    voteCount: 85,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    memeOneId: '2',
    memeTwoId: '1',
    promptId: '2',
    status: 'ended',
    voteCount: 120,
    endTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_PROMPTS = [
  {
    id: '1',
    text: 'Create a meme about how AI is changing our lives',
    tags: ['ai', 'technology', 'future'],
  },
  {
    id: '2',
    text: 'Make a meme about trying to explain your job to your grandparents',
    tags: ['work', 'family', 'tech'],
  },
  {
    id: '3',
    text: 'Create a meme about workout motivation versus reality',
    tags: ['fitness', 'humor', 'relatable'],
  },
];

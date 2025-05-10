
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

// Updated mock data with complete properties matching types - converting string dates to Date objects
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
    createdAt: new Date(),
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
    createdAt: new Date(),
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
    createdAt: new Date(),
  },
];

// Updated to match Meme type with Date objects
export const MOCK_MEMES = [
  {
    id: '1',
    imageUrl: '/templates/drake.jpg',
    caption: 'When you use AI\nWhen you write code yourself',
    prompt: 'Create a meme about programming',
    creatorId: '1',
    creator: MOCK_USERS[0],
    votes: 42,
    createdAt: new Date(),
    ipfsCid: '',
    tags: ['programming', 'ai'],
  },
  {
    id: '2',
    imageUrl: '/templates/distracted-boyfriend.jpg',
    caption: 'Me\nNew JS Framework\nMy Current Project',
    prompt: 'Create a meme about web development',
    creatorId: '2',
    creator: MOCK_USERS[1],
    votes: 28,
    createdAt: new Date(),
    ipfsCid: '',
    tags: ['javascript', 'webdev'],
  },
];

// Updated to match Battle type with Date objects for startTime and endTime
export const MOCK_BATTLES = [
  {
    id: '1',
    memeOneId: '1',
    memeTwoId: '2',
    promptId: '1',
    status: 'active',
    voteCount: 85,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    id: '2',
    memeOneId: '2',
    memeTwoId: '1',
    promptId: '2',
    status: 'completed',
    voteCount: 120,
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

export const MOCK_PROMPTS = [
  {
    id: '1',
    text: 'Create a meme about how AI is changing our lives',
    tags: ['ai', 'technology', 'future'],
    theme: 'technology',
    active: true,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    text: 'Make a meme about trying to explain your job to your grandparents',
    tags: ['work', 'family', 'tech'],
    theme: 'family',
    active: false,
    startDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    text: 'Create a meme about workout motivation versus reality',
    tags: ['fitness', 'humor', 'relatable'],
    theme: 'lifestyle',
    active: false,
    startDate: new Date(Date.now() - 72 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

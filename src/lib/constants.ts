
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

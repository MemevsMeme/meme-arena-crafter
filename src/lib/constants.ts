import { Battle, Prompt, Meme, User } from './types';

// Application name
export const APP_NAME = "MemeVsMeme";

// Caption style options
export const CAPTION_STYLES = [
  { id: "funny", name: "Funny" },
  { id: "dark", name: "Dark Humor" },
  { id: "wholesome", name: "Wholesome" },
  { id: "sarcastic", name: "Sarcastic" },
  { id: "nerdy", name: "Nerdy" },
  { id: "dad-joke", name: "Dad Joke" }
];

// Meme templates
export const MEME_TEMPLATES = [
  {
    id: "drake",
    name: "Drake Hotline Bling",
    url: "/Drake-Hotline-Bling.jpg",
    textPositions: [
      {
        x: 50,
        y: 25,
        fontSize: 24,
        maxWidth: 200,
        alignment: "center"
      },
      {
        x: 50,
        y: 75,
        fontSize: 24,
        maxWidth: 200,
        alignment: "center"
      }
    ]
  },
  {
    id: "distracted-boyfriend",
    name: "Distracted Boyfriend",
    url: "/Distracted-Boyfriend.jpg",
    textPositions: [
      {
        x: 25,
        y: 15,
        fontSize: 20,
        maxWidth: 150,
        alignment: "center"
      },
      {
        x: 50,
        y: 15,
        fontSize: 20,
        maxWidth: 150,
        alignment: "center"
      },
      {
        x: 75,
        y: 15,
        fontSize: 20,
        maxWidth: 150,
        alignment: "center"
      }
    ]
  },
  {
    id: "two-buttons",
    name: "Two Buttons",
    url: "/Two-Buttons.jpg",
    textPositions: [
      {
        x: 30,
        y: 12,
        fontSize: 16,
        maxWidth: 100,
        alignment: "center"
      },
      {
        x: 70,
        y: 12,
        fontSize: 16,
        maxWidth: 100,
        alignment: "center"
      }
    ]
  },
  {
    id: "change-my-mind",
    name: "Change My Mind",
    url: "/Change-My-Mind-tilt-corrected-meme-2.jpg",
    textPositions: [
      {
        x: 50,
        y: 25,
        fontSize: 24,
        maxWidth: 300,
        alignment: "center"
      }
    ]
  },
  {
    id: "expanding-brain",
    name: "Expanding Brain",
    url: "/expanding brain.png",
    textPositions: [
      {
        x: 75,
        y: 12.5,
        fontSize: 16,
        maxWidth: 150,
        alignment: "center"
      },
      {
        x: 75,
        y: 37.5,
        fontSize: 16,
        maxWidth: 150,
        alignment: "center"
      },
      {
        x: 75,
        y: 62.5,
        fontSize: 16,
        maxWidth: 150,
        alignment: "center"
      },
      {
        x: 75,
        y: 87.5,
        fontSize: 16,
        maxWidth: 150,
        alignment: "center"
      }
    ]
  }
];

// Mock data for users
export const MOCK_USERS: User[] = [
  {
    id: "user1",
    username: "MemeLord",
    avatarUrl: "https://example.com/avatar1.jpg",
    memeStreak: 5,
    wins: 10,
    losses: 2,
    level: 7,
    xp: 750,
    createdAt: new Date()
  },
  {
    id: "user2",
    username: "LaughingLegend",
    avatarUrl: "https://example.com/avatar2.jpg",
    memeStreak: 2,
    wins: 5,
    losses: 5,
    level: 4,
    xp: 400,
    createdAt: new Date()
  },
  {
    id: "user3",
    username: "GiggleGuru",
    avatarUrl: "https://example.com/avatar3.jpg",
    memeStreak: 8,
    wins: 15,
    losses: 3,
    level: 9,
    xp: 920,
    createdAt: new Date()
  },
  {
    id: "user4",
    username: "HumorHarbor",
    avatarUrl: "https://example.com/avatar4.jpg",
    memeStreak: 3,
    wins: 7,
    losses: 4,
    level: 5,
    xp: 550,
    createdAt: new Date()
  },
  {
    id: "user5",
    username: "ChucklingChampion",
    avatarUrl: "https://example.com/avatar5.jpg",
    memeStreak: 6,
    wins: 12,
    losses: 1,
    level: 8,
    xp: 880,
    createdAt: new Date()
  }
];

// Update mock memes to use local image URLs instead of external ones
export const MOCK_MEMES: Meme[] = [
  {
    id: "meme1",
    prompt: "When you accidentally deploy to production on a Friday afternoon",
    prompt_id: "prompt1",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid1",
    caption: "Oops! Time for a weekend of hotfixes.",
    creatorId: "user1",
    votes: 42,
    createdAt: new Date(),
    tags: ["coding", "fail", "production"],
    isBattleSubmission: true,
    battleId: "battle1"
  },
  {
    id: "meme2",
    prompt: "When the junior dev says 'I'm sure it'll work'",
    prompt_id: "prompt1",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid2",
    caption: "Famous last words...",
    creatorId: "user2",
    votes: 28,
    createdAt: new Date(),
    tags: ["coding", "junior", "optimism"],
    isBattleSubmission: true,
    battleId: "battle1"
  },
  {
    id: "meme3",
    prompt: "How I feel after finally understanding promises in JavaScript",
    prompt_id: "prompt2",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid3",
    caption: "sO tHiS iS hOw YoU hAnDlE aSync cOdE",
    creatorId: "user3",
    votes: 55,
    createdAt: new Date(),
    tags: ["coding", "javascript", "promises"],
    isBattleSubmission: true,
    battleId: "battle2"
  },
  {
    id: "meme4",
    prompt: "When the code you wrote 6 months ago suddenly breaks",
    prompt_id: "prompt2",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid4",
    caption: "I don't even remember writing this!",
    creatorId: "user4",
    votes: 36,
    createdAt: new Date(),
    tags: ["coding", "debugging", "legacy"],
    isBattleSubmission: true,
    battleId: "battle2"
  },
  {
    id: "meme5",
    prompt: "When your code compiles without errors on the first try",
    prompt_id: "prompt3",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid5",
    caption: "Is this real life?",
    creatorId: "user5",
    votes: 63,
    createdAt: new Date(),
    tags: ["coding", "success", "surprise"],
    isBattleSubmission: false
  },
  {
    id: "meme6",
    prompt: "How I feel when the client asks for 'just one small change'",
    prompt_id: "prompt3",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid6",
    caption: "Here we go again...",
    creatorId: "user1",
    votes: 48,
    createdAt: new Date(),
    tags: ["coding", "clients", "requests"],
    isBattleSubmission: false
  },
  {
    id: "meme7",
    prompt: "When you spend hours debugging and the problem was a missing semicolon",
    prompt_id: "prompt4",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid7",
    caption: "I need a break...",
    creatorId: "user2",
    votes: 31,
    createdAt: new Date(),
    tags: ["coding", "debugging", "mistakes"],
    isBattleSubmission: false
  },
  {
    id: "meme8",
    prompt: "When the manager asks if the project will be done on time",
    prompt_id: "prompt4",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid8",
    caption: "Sure, boss. No problem!",
    creatorId: "user3",
    votes: 59,
    createdAt: new Date(),
    tags: ["coding", "project", "deadlines"],
    isBattleSubmission: false
  },
  {
    id: "meme9",
    prompt: "When you try to explain coding to someone who isn't a programmer",
    prompt_id: "prompt5",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid9",
    caption: "It's simple, really...",
    creatorId: "user4",
    votes: 45,
    createdAt: new Date(),
    tags: ["coding", "explanation", "non-programmers"],
    isBattleSubmission: false
  },
  {
    id: "meme10",
    prompt: "When you Google a problem and the first result is your own question from 5 years ago",
    prompt_id: "prompt5",
    imageUrl: "/placeholder.svg",
    ipfsCid: "cid10",
    caption: "I've been expecting you...",
    creatorId: "user5",
    votes: 68,
    createdAt: new Date(),
    tags: ["coding", "google", "stackoverflow"],
    isBattleSubmission: false
  }
];

// Update MOCK_PROMPTS to include description
export const MOCK_PROMPTS: Prompt[] = [
  {
    id: "prompt1",
    text: "When you accidentally deploy to production on a Friday afternoon",
    theme: "coding",
    tags: ["coding", "fail", "production"],
    active: true,
    startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000),
    description: "Share your programming victory moments!",
    is_community: false
  },
  {
    id: "prompt2",
    text: "That moment when your code works on the first try",
    theme: "coding",
    tags: ["programming", "success", "surprise"],
    active: true,
    startDate: new Date(Date.now() - 86400000 * 2),
    endDate: new Date(Date.now() + 86400000 * 3),
    description: "We all know this never happens!",
    is_community: true
  },
  {
    id: "prompt3",
    text: "How I feel when the client asks for 'just one small change'",
    theme: "clients",
    tags: ["clients", "requests", "changes"],
    active: true,
    startDate: new Date(Date.now() - 86400000 * 3),
    endDate: new Date(Date.now() + 86400000 * 4),
    description: "The change is never small.",
    is_community: false
  },
  {
    id: "prompt4",
    text: "When you spend hours debugging and the problem was a missing semicolon",
    theme: "debugging",
    tags: ["coding", "debugging", "mistakes"],
    active: true,
    startDate: new Date(Date.now() - 86400000 * 4),
    endDate: new Date(Date.now() + 86400000 * 5),
    description: "Always check the small things.",
    is_community: true
  },
  {
    id: "prompt5",
    text: "When you Google a problem and the first result is your own question from 5 years ago",
    theme: "stackoverflow",
    tags: ["coding", "google", "stackoverflow"],
    active: true,
    startDate: new Date(Date.now() - 86400000 * 5),
    endDate: new Date(Date.now() + 86400000 * 6),
    description: "The struggle is real.",
    is_community: false
  }
];

// Update MOCK_BATTLES to include is_community and creator_id
export const MOCK_BATTLES: Battle[] = [
  {
    id: "battle1",
    memeOneId: "meme1",
    memeTwoId: "meme2",
    promptId: "prompt1",
    status: "active",
    voteCount: 121,
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() + 86400000),
    is_community: false,
    creator_id: "user1"
  },
  {
    id: "battle2",
    memeOneId: "meme3",
    memeTwoId: "meme4",
    promptId: "prompt2",
    status: "active",
    voteCount: 64,
    startTime: new Date(Date.now() - 86400000 * 2),
    endTime: new Date(Date.now() + 86400000 * 2),
    is_community: true,
    creator_id: "user2"
  },
  {
    id: "battle3",
    memeOneId: "meme5",
    memeTwoId: "meme6",
    promptId: "prompt3",
    status: "completed",
    voteCount: 95,
    startTime: new Date(Date.now() - 86400000 * 3),
    endTime: new Date(Date.now() - 86400000),
    winnerId: "meme5",
    is_community: false,
    creator_id: "user3"
  },
  {
    id: "battle4",
    memeOneId: "meme7",
    memeTwoId: "meme8",
    promptId: "prompt4",
    status: "cancelled",
    voteCount: 32,
    startTime: new Date(Date.now() - 86400000 * 4),
    endTime: new Date(Date.now() - 86400000 * 2),
    is_community: true,
    creator_id: "user4"
  },
  {
    id: "battle5",
    memeOneId: "meme9",
    memeTwoId: "meme10",
    promptId: "prompt5",
    status: "active",
    voteCount: 78,
    startTime: new Date(Date.now() - 86400000 * 5),
    endTime: new Date(Date.now() + 86400000 * 3),
    is_community: false,
    creator_id: "user5"
  }
];

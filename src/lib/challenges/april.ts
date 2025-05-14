
import { Prompt } from '../types';

// April challenges
export const aprilChallenges: Prompt[] = [
  {
    id: 'apr-01',
    text: "April Fools' Pranks That Went Too Far",
    theme: "holiday",
    tags: ["aprilfools", "pranks", "jokes"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-02',
    text: "When You Realize April Fools' Is Over But The Internet Is Still Full Of Fake News",
    theme: "internet",
    tags: ["aprilfools", "fakenews", "internet"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-03',
    text: "Spring Showers Vs. What Your Outfit Planned For",
    theme: "weather",
    tags: ["rain", "spring", "fashion"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-04',
    text: "When Stores Put Out Summer Items But It's Still Cold Outside",
    theme: "shopping",
    tags: ["retail", "seasons", "weather"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-05',
    text: "Tax Deadline Approaching: The Panic Sets In",
    theme: "finance",
    tags: ["taxes", "deadline", "panic"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-15',
    text: "Last Minute Tax Filing Panic",
    theme: "seasonal",
    tags: ["taxes", "deadline", "stress"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-16',
    text: "The Day After Tax Day Relief",
    theme: "finance",
    tags: ["taxes", "relief", "deadline"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-17',
    text: "Spring Cleaning: Finding Things You Forgot You Owned",
    theme: "home",
    tags: ["cleaning", "discovery", "organization"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-18',
    text: "When Easter Candy Goes On Sale",
    theme: "shopping",
    tags: ["easter", "candy", "sales"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'apr-19',
    text: "Earth Day: Expectations vs. Reality",
    theme: "environment",
    tags: ["earthday", "environment", "sustainability"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  }
];

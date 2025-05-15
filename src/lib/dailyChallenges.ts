// Function to get the current day of the year
// Fix the arithmetic operation by ensuring numeric values
export const getCurrentDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = Number(now) - Number(start);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Function to get today's challenge
export const getTodaysChallenge = async () => {
  const dayOfYear = getCurrentDayOfYear();
  
  // Mock challenges for now
  const challenges = [
    {
      id: '1',
      text: 'Surprise!',
      theme: 'humor',
      tags: ['funny', 'meme'],
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000)
    },
    {
      id: '2',
      text: 'I am inevitable',
      theme: 'serious',
      tags: ['deep', 'meme'],
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000)
    },
    {
      id: '3',
      text: 'Reality is often disappointing',
      theme: 'mixed',
      tags: ['funny', 'meme'],
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000)
    }
  ];

  // Return a challenge based on the day of the year
  const challengeIndex = dayOfYear % challenges.length;
  return challenges[challengeIndex];
};

// Function to get a fallback challenge in case the database query fails
export const getFallbackChallenge = () => {
  return {
    id: 'fallback',
    text: 'Make a meme about your favorite thing!',
    theme: 'general',
    tags: ['general', 'meme'],
    active: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000)
  };
};


import { Prompt } from './types';
import { getDailyChallenge, getCurrentDayOfYear } from './database';

// 365 daily meme challenges that rotate throughout the year - now used as fallback
export const DAILY_CHALLENGES: Prompt[] = [
  // January
  {
    id: 'jan-01',
    text: "New Year's Resolutions Gone Wrong",
    theme: "holiday",
    tags: ["newyear", "resolutions", "humor"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'jan-02',
    text: "When You Finally Check Your Bank Account After The Holidays",
    theme: "relatable",
    tags: ["money", "postholiday", "finances"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'jan-03',
    text: "First Day Back At Work After Vacation",
    theme: "work",
    tags: ["office", "backtowork", "mondaymood"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'jan-04',
    text: "Expectation vs. Reality: New Year's Diet",
    theme: "health",
    tags: ["diet", "fitness", "expectations"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'jan-05',
    text: "When Someone Says 'Winter Is My Favorite Season'",
    theme: "seasonal",
    tags: ["winter", "cold", "seasons"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // More January prompts
  {
    id: 'jan-06',
    text: "Finding Motivation To Exercise In January",
    theme: "fitness",
    tags: ["gym", "motivation", "resolutions"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'jan-07',
    text: "Trying To Remember Your Password After The Break",
    theme: "tech",
    tags: ["password", "forgetting", "backtowork"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // February
  {
    id: 'feb-01',
    text: "Single People On Valentine's Day",
    theme: "holiday",
    tags: ["valentines", "single", "alone"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'feb-02',
    text: "When Groundhog Day Actually Matters",
    theme: "holiday",
    tags: ["groundhogday", "winter", "spring"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'feb-03',
    text: "Valentine's Day Gift Shopping For Someone You Just Started Dating",
    theme: "relationships",
    tags: ["valentines", "dating", "awkward"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // Continue with more months...
  // March
  {
    id: 'mar-01',
    text: "Spring Cleaning Expectations vs. Reality",
    theme: "seasonal",
    tags: ["spring", "cleaning", "procrastination"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'mar-17',
    text: "St. Patrick's Day: Before vs. After",
    theme: "holiday",
    tags: ["stpatricksday", "party", "green"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // April
  {
    id: 'apr-01',
    text: "April Fools' Pranks That Went Too Far",
    theme: "holiday",
    tags: ["aprilfools", "pranks", "jokes"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'apr-15',
    text: "Last Minute Tax Filing Panic",
    theme: "seasonal",
    tags: ["taxes", "deadline", "stress"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // May
  {
    id: 'may-01',
    text: "When May Arrives But Spring Weather Doesn't",
    theme: "weather",
    tags: ["spring", "weather", "waiting"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'may-04',
    text: "May The 4th Be With You: Star Wars Day",
    theme: "entertainment",
    tags: ["starwars", "maythe4th", "scifi"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // June
  {
    id: 'jun-01',
    text: "Summer Body Goals vs. Reality",
    theme: "seasonal",
    tags: ["summer", "beachbody", "fitness"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'jun-15',
    text: "Dad Jokes For Father's Day",
    theme: "holiday",
    tags: ["fathersday", "dadjokes", "family"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // July
  {
    id: 'jul-04',
    text: "Independence Day BBQ Mishaps",
    theme: "holiday",
    tags: ["4thofjuly", "bbq", "celebration"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'jul-15',
    text: "When The Air Conditioning Breaks In July",
    theme: "seasonal",
    tags: ["summer", "heat", "ac"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // August
  {
    id: 'aug-01',
    text: "Back To School Shopping: Parents vs. Kids",
    theme: "seasonal",
    tags: ["backtoschool", "shopping", "students"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'aug-15',
    text: "Summer Vacation Photos vs. Reality",
    theme: "travel",
    tags: ["vacation", "travel", "expectations"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // September
  {
    id: 'sep-01',
    text: "First Day Of School After Summer Break",
    theme: "education",
    tags: ["school", "students", "teachers"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'sep-15',
    text: "When Pumpkin Spice Everything Returns",
    theme: "seasonal",
    tags: ["fall", "pumpkinspice", "autumn"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // October
  {
    id: 'oct-01',
    text: "Halloween Costume Ideas That No One Gets",
    theme: "holiday",
    tags: ["halloween", "costume", "creative"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'oct-31',
    text: "Last Minute Halloween Costume Attempts",
    theme: "holiday",
    tags: ["halloween", "lastminute", "diy"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // November
  {
    id: 'nov-01',
    text: "Post-Halloween Candy Sale Shopping",
    theme: "holiday",
    tags: ["halloween", "candy", "sales"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'nov-15',
    text: "Thanksgiving Dinner With Relatives Who Don't Agree On Politics",
    theme: "holiday",
    tags: ["thanksgiving", "family", "awkward"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // December
  {
    id: 'dec-01',
    text: "Holiday Shopping: Online vs. In-Store",
    theme: "holiday",
    tags: ["christmas", "shopping", "presents"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'dec-24',
    text: "Christmas Eve Last Minute Gift Wrapping",
    theme: "holiday",
    tags: ["christmas", "presents", "lastminute"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'dec-31',
    text: "New Year's Eve Expectations vs. Reality",
    theme: "holiday",
    tags: ["newyearseve", "party", "expectations"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // Fill in the remaining days to complete 365...
  // This is just a sample - in a real implementation we would have all 365 days
  // For demonstration, we'll add a few more to represent the complete set
  {
    id: 'sample-01',
    text: "When Your Phone Battery Dies At The Worst Possible Moment",
    theme: "tech",
    tags: ["phone", "battery", "panic"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'sample-02',
    text: "Meeting Someone In Person After Only Talking Online",
    theme: "social",
    tags: ["online", "meeting", "awkward"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  {
    id: 'sample-03',
    text: "Autocorrect Fails That Changed The Entire Meaning",
    theme: "tech",
    tags: ["autocorrect", "texting", "fail"],
    active: false,
    startDate: new Date(),
    endDate: new Date()
  },
  // Adding more generic challenges to demonstrate the concept
  // In a full implementation, we would have a unique challenge for each day
];

// Function to get today's challenge based on day of year
export async function getTodaysChallenge(): Promise<Prompt> {
  // First try to get the challenge from the database
  try {
    const dbChallenge = await getDailyChallenge();
    if (dbChallenge) {
      console.log('Got daily challenge from database:', dbChallenge);
      return dbChallenge;
    }
  } catch (error) {
    console.error('Error getting daily challenge from database:', error);
  }
  
  // If database query fails, fall back to local challenges
  return getFallbackChallenge();
}

// Fallback function that uses local data - synchronous, not async
export function getFallbackChallenge(): Prompt {
  // Get current date
  const now = new Date();
  
  // Calculate day of year (0-364)
  const dayOfYear = getCurrentDayOfYear();
  
  // Use modulo to ensure we always have a valid index even if array is smaller than 365
  const index = dayOfYear % DAILY_CHALLENGES.length;
  
  // Create a copy of the challenge with updated dates
  const challenge = { ...DAILY_CHALLENGES[index] };
  challenge.active = true;
  challenge.startDate = new Date();  // Today
  
  // Set end date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  challenge.endDate = tomorrow;
  
  return challenge;
}

// Generate a unique ID for user created challenges
export function generateChallengeId(): string {
  return 'user-' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

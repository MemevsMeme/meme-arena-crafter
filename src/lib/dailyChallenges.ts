
import { Prompt } from './types';
import { getDailyChallenge, getCurrentDayOfYear } from './database';

// 180 daily meme challenges that rotate throughout the year
export const DAILY_CHALLENGES: Prompt[] = [
  // January
  {
    id: 'jan-01',
    text: "New Year's Resolutions Gone Wrong",
    theme: "holiday",
    tags: ["newyear", "resolutions", "humor"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-02',
    text: "When You Finally Check Your Bank Account After The Holidays",
    theme: "relatable",
    tags: ["money", "postholiday", "finances"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-03',
    text: "First Day Back At Work After Vacation",
    theme: "work",
    tags: ["office", "backtowork", "mondaymood"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-04',
    text: "Expectation vs. Reality: New Year's Diet",
    theme: "health",
    tags: ["diet", "fitness", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-05',
    text: "When Someone Says 'Winter Is My Favorite Season'",
    theme: "seasonal",
    tags: ["winter", "cold", "seasons"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // More January prompts
  {
    id: 'jan-06',
    text: "Finding Motivation To Exercise In January",
    theme: "fitness",
    tags: ["gym", "motivation", "resolutions"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-07',
    text: "Trying To Remember Your Password After The Break",
    theme: "tech",
    tags: ["password", "forgetting", "backtowork"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-08',
    text: "When You Realize How Many Days Until Summer",
    theme: "seasonal",
    tags: ["winter", "summer", "countdown"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-09',
    text: "Trying To Use Gift Cards Before They Expire",
    theme: "shopping",
    tags: ["giftcards", "shopping", "holidays"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-10',
    text: "The Face You Make When Someone Mentions Valentine's Day In January",
    theme: "holiday",
    tags: ["valentines", "tooEarly", "holidays"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-11',
    text: "Winter Fashion: Pinterest vs. Reality",
    theme: "fashion",
    tags: ["winter", "fashion", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-12',
    text: "When The Office Thermostat War Begins",
    theme: "office",
    tags: ["work", "temperature", "conflict"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-13',
    text: "Trying To Keep Plants Alive In Winter",
    theme: "home",
    tags: ["plants", "winter", "struggle"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-14',
    text: "When You Find Holiday Decorations You Forgot To Put Away",
    theme: "home",
    tags: ["holidays", "decorations", "organization"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jan-15',
    text: "Mid-January Motivation Crisis",
    theme: "motivation",
    tags: ["resolutions", "motivation", "failure"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // February
  {
    id: 'feb-01',
    text: "Single People On Valentine's Day",
    theme: "holiday",
    tags: ["valentines", "single", "alone"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-02',
    text: "When Groundhog Day Actually Matters",
    theme: "holiday",
    tags: ["groundhogday", "winter", "spring"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-03',
    text: "Valentine's Day Gift Shopping For Someone You Just Started Dating",
    theme: "relationships",
    tags: ["valentines", "dating", "awkward"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-04',
    text: "Tax Season Panic Mode",
    theme: "finance",
    tags: ["taxes", "stress", "adulting"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-05',
    text: "When Winter Won't End",
    theme: "weather",
    tags: ["winter", "endless", "cold"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-06',
    text: "Trying To Avoid Valentine's Day Marketing",
    theme: "marketing",
    tags: ["valentines", "ads", "marketing"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-07',
    text: "Midwinter TV Binge Sessions",
    theme: "entertainment",
    tags: ["tv", "binge", "winter"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-08',
    text: "When You Start Seeing Easter Candy In February",
    theme: "shopping",
    tags: ["easter", "candy", "tooEarly"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-09',
    text: "Valentine's Day: Expectations vs. Reality",
    theme: "holiday",
    tags: ["valentines", "expectations", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'feb-10',
    text: "Winter Sports Fails",
    theme: "sports",
    tags: ["winter", "sports", "fail"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // Continue with more months...
  // March
  {
    id: 'mar-01',
    text: "Spring Cleaning Expectations vs. Reality",
    theme: "seasonal",
    tags: ["spring", "cleaning", "procrastination"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-02',
    text: "When The Weather Can't Make Up Its Mind",
    theme: "weather",
    tags: ["spring", "weather", "indecisive"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-03',
    text: "Daylight Saving Time: Before vs. After",
    theme: "sleep",
    tags: ["daylightsaving", "tired", "timechange"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-04',
    text: "When March Madness Takes Over Your Office",
    theme: "sports",
    tags: ["basketball", "marchmadness", "office"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-05',
    text: "Spring Break Plans: College vs. Adult Life",
    theme: "lifestyle",
    tags: ["springbreak", "adulting", "vacation"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-06',
    text: "Tax Season Procrastination",
    theme: "finance",
    tags: ["taxes", "procrastination", "deadline"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-07',
    text: "When Plants Start Blooming And So Do Your Allergies",
    theme: "health",
    tags: ["allergies", "spring", "suffering"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-08',
    text: "International Women's Day Memes",
    theme: "holiday",
    tags: ["women", "empowerment", "equality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-09',
    text: "When You Start Planning Summer Vacations",
    theme: "travel",
    tags: ["summer", "vacation", "planning"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-10',
    text: "Spring Fashion Transition Struggles",
    theme: "fashion",
    tags: ["spring", "fashion", "weather"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'mar-17',
    text: "St. Patrick's Day: Before vs. After",
    theme: "holiday",
    tags: ["stpatricksday", "party", "green"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // April
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
  },
  // May - Complete set for all 31 days
  {
    id: 'may-01',
    text: "When May Arrives But Spring Weather Doesn't",
    theme: "weather",
    tags: ["spring", "weather", "waiting"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-02',
    text: "Cinco de Mayo: Americans vs. Actual Mexicans",
    theme: "holiday",
    tags: ["cincodemayo", "cultural", "celebration"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-03',
    text: "When Allergy Season Hits Full Force",
    theme: "health",
    tags: ["allergies", "spring", "suffering"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-04',
    text: "May The 4th Be With You: Star Wars Day",
    theme: "entertainment",
    tags: ["starwars", "maythe4th", "scifi"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-05',
    text: "Mother's Day Gift Panic",
    theme: "holiday",
    tags: ["mothersday", "gifts", "panic"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-06',
    text: "Finals Week Study Mode",
    theme: "education",
    tags: ["finals", "studying", "stress"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-07',
    text: "When You Realize Summer Is Almost Here",
    theme: "seasonal",
    tags: ["summer", "excitement", "planning"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-08',
    text: "Graduation Season: Parents vs. Students",
    theme: "education",
    tags: ["graduation", "celebration", "milestone"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-09',
    text: "Summer Body Panic Mode",
    theme: "fitness",
    tags: ["summer", "body", "gym"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-10',
    text: "Wedding Season Begins: Single People Reactions",
    theme: "relationships",
    tags: ["weddings", "single", "season"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-11',
    text: "When It Rains During Your Outdoor Plans",
    theme: "weather",
    tags: ["rain", "plans", "outdoors"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-12',
    text: "Spring Cleaning: Finding Things You Forgot You Had",
    theme: "home",
    tags: ["cleaning", "spring", "discovery"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-13',
    text: "When Your Allergies Decide To Ruin Your Life",
    theme: "health",
    tags: ["allergies", "spring", "suffering"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-14',
    text: "Last Minute Mother's Day Gift Shopping",
    theme: "holiday",
    tags: ["mothersday", "gifts", "lastminute"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-15',
    text: "When Summer Job Applications Get Rejected",
    theme: "work",
    tags: ["summer", "job", "rejection"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-16',
    text: "When The AC Unit Finally Gets Turned On",
    theme: "seasonal",
    tags: ["summer", "ac", "relief"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-17',
    text: "End of School Year Countdown",
    theme: "education",
    tags: ["school", "summer", "countdown"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-18',
    text: "When You See People Wearing Winter Clothes On A Hot Day",
    theme: "fashion",
    tags: ["weather", "clothing", "confusion"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-19',
    text: "Summer Vacation Planning Stress",
    theme: "travel",
    tags: ["vacation", "planning", "stress"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-20',
    text: "When The Weather App Says Sunny But It's Pouring Rain",
    theme: "technology",
    tags: ["weather", "app", "inaccurate"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-21',
    text: "Memorial Day Weekend Traffic Jams",
    theme: "holiday",
    tags: ["memorialday", "traffic", "travel"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-22',
    text: "When You Finally Clean Out Your Car For Summer",
    theme: "seasonal",
    tags: ["car", "cleaning", "summer"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-23',
    text: "Last Week Of School vs. First Week Of School",
    theme: "education",
    tags: ["school", "comparison", "mood"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-24',
    text: "When You Try On Last Year's Swimsuit For The First Time",
    theme: "fashion",
    tags: ["summer", "swimsuit", "seasonal"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-25',
    text: "When You See The First Mosquito Of The Season",
    theme: "seasonal",
    tags: ["mosquito", "summer", "bugs"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-26',
    text: "Summer Reading List: Expectations vs. Reality",
    theme: "education",
    tags: ["reading", "summer", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-27',
    text: "Memorial Day Weekend BBQ Fails",
    theme: "holiday",
    tags: ["memorialday", "bbq", "fail"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-28',
    text: "When The Pool Finally Opens For The Season",
    theme: "seasonal",
    tags: ["pool", "summer", "excitement"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-29',
    text: "Summer Internship First Day Anxiety",
    theme: "work",
    tags: ["internship", "summer", "anxiety"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-30',
    text: "When You Realize You Have No Summer Plans",
    theme: "seasonal",
    tags: ["summer", "plans", "panic"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'may-31',
    text: "Last Day Of School Cleaning Out Lockers",
    theme: "education",
    tags: ["school", "lockers", "endofyear"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  
  // June - Complete set for all 30 days
  {
    id: 'jun-01',
    text: "Summer Body Goals vs. Reality",
    theme: "seasonal",
    tags: ["summer", "beachbody", "fitness"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-02',
    text: "When Summer Break Finally Arrives",
    theme: "education",
    tags: ["summer", "break", "freedom"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-03',
    text: "Summer Vacation Expectation vs. Reality",
    theme: "travel",
    tags: ["vacation", "expectations", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-04',
    text: "When Your Office AC Is Set To Arctic",
    theme: "work",
    tags: ["office", "ac", "summer"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-05',
    text: "First Beach Day Of The Season",
    theme: "seasonal",
    tags: ["beach", "summer", "sunburn"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-06',
    text: "When The Ice Cream Truck Music Starts Playing",
    theme: "childhood",
    tags: ["icecream", "summer", "nostalgia"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-07',
    text: "When You Forget Sunscreen At The Beach",
    theme: "health",
    tags: ["sunburn", "beach", "regret"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-08',
    text: "Summer Camp Drop-Off: Parents vs. Kids",
    theme: "family",
    tags: ["summercamp", "parents", "kids"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-09',
    text: "When The Humidity Ruins Your Hair",
    theme: "beauty",
    tags: ["hair", "humidity", "summer"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-10',
    text: "Summer Movie Blockbuster Disappointments",
    theme: "entertainment",
    tags: ["movies", "summer", "disappointment"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-11',
    text: "When You Have To Work During Perfect Beach Weather",
    theme: "work",
    tags: ["work", "beach", "fomo"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-12',
    text: "Summer Night Insomnia When It's Too Hot To Sleep",
    theme: "health",
    tags: ["sleep", "heat", "summer"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-13',
    text: "Road Trip Car Snacks Tier List",
    theme: "travel",
    tags: ["roadtrip", "snacks", "ranking"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-14',
    text: "Finding Sand Everywhere After A Beach Day",
    theme: "beach",
    tags: ["sand", "beach", "annoying"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-15',
    text: "Dad Jokes For Father's Day",
    theme: "holiday",
    tags: ["fathersday", "dadjokes", "family"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-16',
    text: "Summer Weddings In The Heat",
    theme: "events",
    tags: ["weddings", "summer", "heat"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-17',
    text: "When You Find Out Your Vacation Destination Has No WiFi",
    theme: "travel",
    tags: ["vacation", "wifi", "disconnected"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-18',
    text: "Trying To Sleep With The Window Open In Summer",
    theme: "sleep",
    tags: ["summer", "heat", "insomnia"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-19',
    text: "When The Office Brings In Summer Interns",
    theme: "work",
    tags: ["interns", "summer", "office"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-20',
    text: "Summer Solstice: The Longest Day Of The Year",
    theme: "seasonal",
    tags: ["solstice", "summer", "daylight"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-21',
    text: "When Your Summer Vacation Photos Don't Match Reality",
    theme: "travel",
    tags: ["vacation", "photos", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-22',
    text: "Backyard BBQ Disaster Stories",
    theme: "food",
    tags: ["bbq", "cooking", "fail"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-23',
    text: "When You Realize Summer Is Already Flying By",
    theme: "seasonal",
    tags: ["summer", "time", "flying"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-24',
    text: "Summer Fashion Choices You Regret Later",
    theme: "fashion",
    tags: ["summer", "clothes", "regret"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-25',
    text: "When You See Your First Summer Utility Bill",
    theme: "home",
    tags: ["bills", "ac", "summer"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-26',
    text: "Summer Roadtrip Car Games",
    theme: "travel",
    tags: ["roadtrip", "games", "family"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-27',
    text: "Public Pool People Watching",
    theme: "summer",
    tags: ["pool", "people", "watching"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-28',
    text: "When Summer Allergies Hit Differently",
    theme: "health",
    tags: ["allergies", "summer", "suffering"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-29',
    text: "Trying To Look Cool While Sweating Profusely",
    theme: "summer",
    tags: ["heat", "sweating", "appearance"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-30',
    text: "Half Year Review: New Year's Resolutions Status",
    theme: "goals",
    tags: ["resolutions", "halfyear", "progress"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  }
];

/**
 * Gets a fallback challenge in case the database query fails
 * @returns A default Prompt object
 */
export function getFallbackChallenge(): Prompt {
  const today = new Date();
  // The getCurrentDayOfYear function doesn't take any arguments
  const dayOfYear = getCurrentDayOfYear();
  
  // Use modulo to cycle through challenges if we have fewer than 365
  const index = dayOfYear % DAILY_CHALLENGES.length;
  
  return DAILY_CHALLENGES[index];
}

/**
 * Gets today's challenge using the current date
 * @returns The challenge for today
 */
export function getTodaysChallenge(): Prompt {
  // This is a simple implementation that just returns the fallback
  // In a real app, we might query a database first
  return getFallbackChallenge();
}

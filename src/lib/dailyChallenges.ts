
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
  // May
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
  // June
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
    text: "When Shorts Weather Is Finally Here",
    theme: "fashion",
    tags: ["summer", "shorts", "fashion"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-18',
    text: "First Sunburn Of The Season",
    theme: "health",
    tags: ["sunburn", "summer", "pain"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jun-19',
    text: "Summer Road Trip Expectations vs. Reality",
    theme: "travel",
    tags: ["roadtrip", "summer", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // July
  {
    id: 'jul-01',
    text: "When July Heat Hits Different",
    theme: "weather",
    tags: ["summer", "heat", "hot"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-02',
    text: "Summer Camping Expectations vs. Reality",
    theme: "outdoors",
    tags: ["camping", "summer", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-03',
    text: "4th of July Preparation Memes",
    theme: "holiday",
    tags: ["4thofjuly", "independence", "preparation"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-04',
    text: "Independence Day BBQ Mishaps",
    theme: "holiday",
    tags: ["4thofjuly", "bbq", "celebration"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-05',
    text: "The Day After July 4th Exhaustion",
    theme: "holiday",
    tags: ["4thofjuly", "tired", "aftermath"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-15',
    text: "When The Air Conditioning Breaks In July",
    theme: "seasonal",
    tags: ["summer", "heat", "ac"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-16',
    text: "Mid-Summer Vacation FOMO",
    theme: "social",
    tags: ["vacation", "fomo", "social media"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-17',
    text: "When Someone Says 'Is It Hot Enough For You?'",
    theme: "small talk",
    tags: ["summer", "smalltalk", "annoying"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-18',
    text: "Summer Playlist On Repeat",
    theme: "music",
    tags: ["summer", "music", "playlist"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'jul-19',
    text: "When Summer Bugs Won't Leave You Alone",
    theme: "nature",
    tags: ["bugs", "summer", "annoying"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // August
  {
    id: 'aug-01',
    text: "Back To School Shopping: Parents vs. Kids",
    theme: "seasonal",
    tags: ["backtoschool", "shopping", "students"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-02',
    text: "August Heat: The Final Boss Of Summer",
    theme: "weather",
    tags: ["summer", "heat", "august"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-03',
    text: "When Stores Put Out Fall Decorations In August",
    theme: "shopping",
    tags: ["fall", "toosoon", "retail"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-04',
    text: "End Of Summer Bucket List Panic",
    theme: "seasonal",
    tags: ["summer", "bucketlist", "panic"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-05',
    text: "Teachers Preparing To Go Back To School",
    theme: "education",
    tags: ["teachers", "backtoschool", "preparation"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-15',
    text: "Summer Vacation Photos vs. Reality",
    theme: "travel",
    tags: ["vacation", "travel", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-16',
    text: "Back To School Anxiety For Students",
    theme: "education",
    tags: ["backtoschool", "anxiety", "students"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-17',
    text: "When Fall Fashion Appears But It's Still 90 Degrees",
    theme: "fashion",
    tags: ["fall", "fashion", "heat"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-18',
    text: "College Move-In Day: Parents vs. Students",
    theme: "education",
    tags: ["college", "movein", "parents"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'aug-19',
    text: "Last Beach Weekend Of Summer",
    theme: "seasonal",
    tags: ["beach", "summer", "lastchance"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // September
  {
    id: 'sep-01',
    text: "First Day Of School After Summer Break",
    theme: "education",
    tags: ["school", "students", "teachers"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-02',
    text: "Labor Day Weekend: Last Hurrah Of Summer",
    theme: "holiday",
    tags: ["laborday", "weekend", "summer"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-03',
    text: "When You Have To Wake Up Early Again After Summer",
    theme: "lifestyle",
    tags: ["routine", "morning", "struggle"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-04',
    text: "Post-Summer Body Reality Check",
    theme: "fitness",
    tags: ["body", "summer", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-05',
    text: "Fall Weather Teaser Days",
    theme: "weather",
    tags: ["fall", "weather", "teaser"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-15',
    text: "When Pumpkin Spice Everything Returns",
    theme: "seasonal",
    tags: ["fall", "pumpkinspice", "autumn"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-16',
    text: "People Who Decorate For Halloween In September",
    theme: "holiday",
    tags: ["halloween", "early", "decoration"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-17',
    text: "Football Season: Fans vs. Everyone Else",
    theme: "sports",
    tags: ["football", "fans", "season"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-18',
    text: "First Day Of Fall: Expectations vs. Reality",
    theme: "seasonal",
    tags: ["fall", "autumn", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'sep-19',
    text: "When You Finally Get To Wear Sweaters Again",
    theme: "fashion",
    tags: ["fall", "sweaters", "fashion"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // October
  {
    id: 'oct-01',
    text: "Halloween Costume Ideas That No One Gets",
    theme: "holiday",
    tags: ["halloween", "costume", "creative"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-02',
    text: "Pumpkin Picking Social Media Posts",
    theme: "seasonal",
    tags: ["pumpkin", "fall", "socialmedia"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-03',
    text: "Halloween Decorations: Pinterest vs. Your House",
    theme: "holiday",
    tags: ["halloween", "decorations", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-04',
    text: "When Stores Already Have Christmas Items In October",
    theme: "shopping",
    tags: ["christmas", "tooearly", "retail"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-05',
    text: "Midterm Season: Students Breaking Down",
    theme: "education",
    tags: ["midterms", "stress", "students"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-15',
    text: "When Someone Says They Don't Like Halloween",
    theme: "holiday",
    tags: ["halloween", "opinions", "reactions"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-16',
    text: "Fall Fashion: Instagram vs. Reality",
    theme: "fashion",
    tags: ["fall", "fashion", "instagram"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-17',
    text: "Watching Scary Movies: Expectations vs. Reality",
    theme: "entertainment",
    tags: ["halloween", "scary", "movies"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-18',
    text: "Adults Who Love Halloween More Than Kids",
    theme: "holiday",
    tags: ["halloween", "adults", "enthusiasm"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'oct-31',
    text: "Last Minute Halloween Costume Attempts",
    theme: "holiday",
    tags: ["halloween", "lastminute", "diy"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // November
  {
    id: 'nov-01',
    text: "Post-Halloween Candy Sale Shopping",
    theme: "holiday",
    tags: ["halloween", "candy", "sales"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-02',
    text: "Christmas Music In November: Too Soon?",
    theme: "holiday",
    tags: ["christmas", "music", "toosoon"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-03',
    text: "When Daylight Saving Time Ends And It's Dark At 4:30",
    theme: "seasonal",
    tags: ["daylightsaving", "dark", "winter"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-04',
    text: "No-Shave November Progression",
    theme: "trends",
    tags: ["noshavenovember", "beard", "movember"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-05',
    text: "Early Holiday Shopping vs. Last-Minute Shoppers",
    theme: "shopping",
    tags: ["holidays", "shopping", "preparation"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-15',
    text: "Thanksgiving Dinner With Relatives Who Don't Agree On Politics",
    theme: "holiday",
    tags: ["thanksgiving", "family", "awkward"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-16',
    text: "When People Skip Thanksgiving And Go Straight To Christmas",
    theme: "holiday",
    tags: ["thanksgiving", "christmas", "holidays"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-17',
    text: "Pre-Thanksgiving Diet Plans vs. Reality",
    theme: "food",
    tags: ["thanksgiving", "diet", "food"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-18',
    text: "Black Friday Shopping Strategy Planning",
    theme: "shopping",
    tags: ["blackfriday", "shopping", "planning"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'nov-19',
    text: "The Annual Thanksgiving Food Coma",
    theme: "holiday",
    tags: ["thanksgiving", "food", "sleep"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // December
  {
    id: 'dec-01',
    text: "Holiday Shopping: Online vs. In-Store",
    theme: "holiday",
    tags: ["christmas", "shopping", "presents"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-02',
    text: "Opening The First Door On Your Advent Calendar",
    theme: "holiday",
    tags: ["advent", "christmas", "calendar"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-03',
    text: "Office Holiday Party Expectations vs. Reality",
    theme: "work",
    tags: ["office", "party", "holidays"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-04',
    text: "December Finals Week Survival Mode",
    theme: "education",
    tags: ["finals", "college", "stress"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-05',
    text: "Holiday Shopping Procrastination",
    theme: "shopping",
    tags: ["gifts", "procrastination", "holidays"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-15',
    text: "Holiday Baking: Pinterest vs. Reality",
    theme: "food",
    tags: ["baking", "holidays", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-16',
    text: "When Someone Asks If You're Ready For The Holidays",
    theme: "stress",
    tags: ["holidays", "preparation", "stress"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-17',
    text: "Trying To Find A Parking Spot At The Mall In December",
    theme: "shopping",
    tags: ["mall", "parking", "holidays"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-18',
    text: "Holiday Travel Nightmares",
    theme: "travel",
    tags: ["travel", "holidays", "stress"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-19',
    text: "When Someone Asks What You Want For Christmas",
    theme: "holiday",
    tags: ["gifts", "christmas", "indecisive"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-24',
    text: "Christmas Eve Last Minute Gift Wrapping",
    theme: "holiday",
    tags: ["christmas", "presents", "lastminute"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-25',
    text: "Christmas Morning: Kids vs. Adults",
    theme: "holiday",
    tags: ["christmas", "morning", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-26',
    text: "Post-Christmas Sales Shoppers",
    theme: "shopping",
    tags: ["sales", "christmas", "shopping"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'dec-31',
    text: "New Year's Eve Expectations vs. Reality",
    theme: "holiday",
    tags: ["newyearseve", "party", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  // Additional generic challenges to reach 180 total
  {
    id: 'generic-01',
    text: "When Your Phone Dies At The Most Important Moment",
    theme: "technology",
    tags: ["phone", "battery", "fail"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-02',
    text: "That Moment When You Realize You've Been Pronouncing A Word Wrong Your Entire Life",
    theme: "humor",
    tags: ["awkward", "language", "realization"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-03',
    text: "Starting A Diet vs. One Week Into The Diet",
    theme: "health",
    tags: ["diet", "motivation", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-04',
    text: "When You Try To Take A Nice Photo But Someone Blinks",
    theme: "photography",
    tags: ["photo", "fail", "family"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-05',
    text: "Me Explaining My Job To My Parents vs. What I Actually Do",
    theme: "work",
    tags: ["career", "parents", "explanation"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-06',
    text: "Online Shopping Cart vs. What Actually Arrives",
    theme: "shopping",
    tags: ["online", "expectations", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-07',
    text: "Social Media Posts vs. Actual Life",
    theme: "social",
    tags: ["socialmedia", "reality", "fake"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-08',
    text: "When You Finally Clean Your Room And Find Things You Thought Were Lost Forever",
    theme: "home",
    tags: ["cleaning", "discovery", "mess"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-09',
    text: "Group Project: Who Does All The Work",
    theme: "education",
    tags: ["groupproject", "work", "fairness"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-10',
    text: "Pizza Delivery: Expectation vs. Reality",
    theme: "food",
    tags: ["pizza", "delivery", "expectations"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-11',
    text: "When You Let Your Friend Choose The Restaurant",
    theme: "friendship",
    tags: ["food", "friends", "choices"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-12',
    text: "Trying To Find The End Of The Tape Roll",
    theme: "frustration",
    tags: ["tape", "annoying", "struggle"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-13',
    text: "Weekend Plans vs. What Actually Happens",
    theme: "lifestyle",
    tags: ["weekend", "plans", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-14',
    text: "When People Don't Use Their Turn Signals",
    theme: "driving",
    tags: ["traffic", "driving", "annoying"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-15',
    text: "Trying To Wake Up Without Coffee",
    theme: "morning",
    tags: ["coffee", "morning", "struggle"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-16',
    text: "When Someone Asks 'Are You OK?' And You're Clearly Not",
    theme: "emotions",
    tags: ["feelings", "questions", "obvious"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-17',
    text: "When Your Headphones Get Caught On Everything",
    theme: "tech",
    tags: ["headphones", "annoying", "tangled"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-18',
    text: "Grocery Shopping While Hungry",
    theme: "shopping",
    tags: ["food", "grocery", "hungry"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-19',
    text: "Working From Home: Expectations vs. Reality",
    theme: "work",
    tags: ["wfh", "remote", "productivity"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  },
  {
    id: 'generic-20',
    text: "When Your Food Looks Nothing Like The Menu Picture",
    theme: "food",
    tags: ["restaurant", "expectations", "reality"],
    active: true,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000)
  }
];

// Function to get today's challenge based on day of year - improved error handling and fallback mechanism
export async function getTodaysChallenge(): Promise<Prompt> {
  console.log('Getting today\'s challenge...');
  
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
  console.log('Using fallback challenge');
  return getFallbackChallenge();
}

// Improved fallback function that uses local data - synchronous, not async
export function getFallbackChallenge(): Prompt {
  // Get current date
  const now = new Date();
  
  // Calculate day of year (0-364)
  const dayOfYear = getCurrentDayOfYear();
  
  console.log(`Current day of year: ${dayOfYear}`);
  
  // Use modulo to ensure we always have a valid index even if array is smaller than 365
  const index = dayOfYear % DAILY_CHALLENGES.length;
  
  console.log(`Using challenge index: ${index} out of ${DAILY_CHALLENGES.length} available challenges`);
  
  // Create a copy of the challenge with updated dates
  const challenge = { ...DAILY_CHALLENGES[index] };
  challenge.active = true;
  challenge.startDate = new Date();  // Today
  
  // Set end date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  challenge.endDate = tomorrow;
  
  console.log('Returning fallback challenge:', challenge);
  return challenge;
}

// Generate a unique ID for user created challenges
export function generateChallengeId(): string {
  return 'user-' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

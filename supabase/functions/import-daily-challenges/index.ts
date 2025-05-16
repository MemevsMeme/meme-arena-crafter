
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

// Import corsHeaders from relative path
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface Challenge {
  day_of_year: number;
  text: string;
  theme: string;
  tags: string[];
}

// Generate 365 daily meme challenges
function generateDailyChallenges(): Challenge[] {
  const challenges: Challenge[] = [];
  
  // Themes to use for challenges
  const themes = [
    'tech', 'funny', 'pets', 'movies', 'sports', 
    'gaming', 'food', 'work', 'school', 'science', 
    'history', 'music', 'art', 'politics', 'travel'
  ];
  
  // Tag sets for each theme
  const themeTags: Record<string, string[]> = {
    'tech': ['coding', 'programming', 'computers', 'ai', 'internet', 'tech'],
    'funny': ['humor', 'jokes', 'comedy', 'funny', 'lol', 'laughing'],
    'pets': ['animals', 'dogs', 'cats', 'cute', 'pets', 'wildlife'],
    'movies': ['film', 'cinema', 'hollywood', 'actors', 'directors', 'tv'],
    'sports': ['athletics', 'games', 'competition', 'fitness', 'teams', 'players'],
    'gaming': ['videogames', 'games', 'esports', 'rpg', 'fps', 'moba'],
    'food': ['cooking', 'cuisine', 'recipes', 'restaurants', 'chefs', 'meals'],
    'work': ['office', 'business', 'career', 'jobs', 'meetings', 'colleagues'],
    'school': ['education', 'college', 'students', 'teachers', 'learning', 'exams'],
    'science': ['research', 'technology', 'experiments', 'physics', 'biology', 'chemistry'],
    'history': ['past', 'ancient', 'medieval', 'modern', 'events', 'people'],
    'music': ['songs', 'bands', 'artists', 'concerts', 'albums', 'instruments'],
    'art': ['creativity', 'design', 'painting', 'sculpture', 'artists', 'museums'],
    'politics': ['government', 'elections', 'politicians', 'policies', 'debates', 'news'],
    'travel': ['vacation', 'tourism', 'countries', 'adventure', 'culture', 'sightseeing']
  };
  
  // Tech prompts
  const techPrompts = [
    "Create a meme about debugging code at 3 AM",
    "When the code works but you don't know why",
    "Explain version control to non-programmers with a meme",
    "Your reaction when you find a typo after hours of debugging",
    "When someone asks you to fix their printer because you 'know computers'",
    "Create a meme about your relationship with Stack Overflow",
    "When the client says 'just one small change'",
    "Programmers explaining their code vs how they feel inside",
    "When your code passes all the tests but fails in production",
    "Create a meme about JavaScript's quirky behavior",
    "When you inherit legacy code with no documentation",
    "Create a meme about CSS positioning struggles",
    "When you accidentally delete your entire project without backup",
    "Create a meme about AI replacing programmers",
    "When autocomplete saves your day",
    "Create a meme about frontend vs backend developers",
    "When the code works on your machine but fails everywhere else",
    "Create a meme about the software development lifecycle",
    "When you find that perfect library for your project",
    "Create a meme about coding interviews",
    "When you finally understand how recursion works",
    "Create a meme about tabs vs spaces debate",
    "When your 10-line solution performs better than someone's 100-line algorithm",
    "Create a meme about programmers' sleep schedule"
  ];
  
  // Funny prompts
  const funnyPrompts = [
    "When someone asks why you're still single",
    "Create a meme about your Monday morning mood",
    "When adults try to use slang",
    "Create a meme about introverts at parties",
    "When you try to eat healthy but see your favorite snack",
    "Create a meme about Netflix's 'Are you still watching?' prompt",
    "When someone asks what your plans are for the weekend",
    "Create a meme about expectation vs reality",
    "When you try to take a nice photo but it's ruined",
    "Create a meme about procrastination",
    "When you finally meet your online friend in person",
    "Create a meme about your relationship with coffee",
    "When someone spoils a movie/show for you",
    "Create a meme about people who talk during movies",
    "When you're the only one in the group who doesn't get the joke",
    "Create a meme about autocorrect fails",
    "When you make a joke but have to explain it",
    "Create a meme about trying to adult",
    "When your favorite character dies in a show",
    "Create a meme about your cooking attempts",
    "When you find food you forgot in the fridge",
    "Create a meme about shopping on an empty stomach",
    "When you're in a meeting that could've been an email",
    "Create a meme about your workout motivation"
  ];
  
  // Generate the rest of the prompts for other themes
  const allPrompts: Record<string, string[]> = {
    'tech': techPrompts,
    'funny': funnyPrompts,
    'pets': [
      "When your pet pretends they don't know what they did wrong",
      "Create a meme about cats knocking things off tables",
      "When your dog hears the word 'walk'",
      "Create a meme about pets waiting for their humans to come home",
      "When animals think they're human",
      "Create a meme about trying to take a photo of your pet",
      "When your pet steals your spot on the couch",
      "Create a meme about dogs vs vacuum cleaners",
      "When your cat brings you a 'gift'",
      "Create a meme about pet zoomies",
      "When you're trying to work but your pet wants attention",
      "Create a meme about people who talk to their pets",
      "When your pet gives you the guilty look",
      "Create a meme about cats and cardboard boxes",
      "When your pet finally uses the expensive bed you bought them",
      "Create a meme about dogs meeting other dogs",
      "When your pet refuses to eat their food but begs for yours",
      "Create a meme about pet owners who look like their pets",
      "When your pet learns a new trick",
      "Create a meme about being a pet parent",
      "When your pet makes friends with another species",
      "Create a meme about the weird sleeping positions of pets",
      "When your pet judges your life choices",
      "Create a meme about animals with attitude"
    ],
    // I'll add 20+ prompts for each theme to ensure we have plenty of variety
    'movies': [
      "When the movie adaptation is nothing like the book",
      "Create a meme about horror movie characters making bad decisions",
      "When you watch a movie with someone who asks too many questions",
      "Create a meme about movie plot holes",
      "When you recognize an actor but can't remember from where",
      "Create a meme about movie theater etiquette",
      "When the sequel is better than the original",
      "Create a meme about movie reboots/remakes",
      "When you watch a movie everyone said was amazing but you hate it",
      "Create a meme about binge-watching a series",
      "When you finish a great movie and don't know what to do with your life",
      "Create a meme about movie trailers that spoil everything",
      "When the villain is more relatable than the hero",
      "Create a meme comparing book vs. movie versions",
      "When you miss important dialogue because you're eating loudly",
      "Create a meme about superheroes in the real world",
      "When someone talks during the climax of a movie",
      "Create a meme about post-credit scenes",
      "When you rewatch childhood movies and catch adult jokes",
      "Create a meme about actors who always play the same character",
      "When the side character is more interesting than the protagonist",
      "Create a meme about predictable movie endings",
      "When a movie makes you rethink your entire existence",
      "Create a meme about movie universes colliding"
    ],
    'sports': [
      "When your team is winning vs. when they start losing",
      "Create a meme about sports fans explaining rules to non-fans",
      "When your favorite player gets traded",
      "Create a meme about fantasy sports addiction",
      "When the referee makes a bad call against your team",
      "Create a meme about sports superstitions",
      "When you try to play a sport after years of inactivity",
      "Create a meme about bandwagon fans",
      "When your team loses to a rival",
      "Create a meme about sports commentators",
      "When you're the last one picked for a team",
      "Create a meme about championship celebrations gone wrong",
      "When your underdog team makes it to the finals",
      "Create a meme about sports fans' emotional rollercoaster",
      "When you're pretending to understand the sport everyone's watching",
      "Create a meme about athletes' social media presence",
      "When your team blows a huge lead",
      "Create a meme about sports rivalries",
      "When your team hasn't won a championship in decades",
      "Create a meme about armchair coaches/managers",
      "When the season gets canceled",
      "Create a meme about sports and weather conditions",
      "When someone spoils the game score before you watch it",
      "Create a meme about sports injuries"
    ]
  };
  
  // Generate for all 365 days
  for (let day = 1; day <= 365; day++) {
    // Choose a theme based on the day (evenly distribute themes)
    const themeIndex = day % themes.length;
    const theme = themes[themeIndex];
    
    // Choose prompt from the theme-specific list, wrapping around if needed
    let promptIndex = Math.floor(day / themes.length) % (allPrompts[theme]?.length || 20);
    
    // If we don't have enough pre-defined prompts, create a generic one
    let promptText: string;
    
    if (allPrompts[theme] && allPrompts[theme][promptIndex]) {
      promptText = allPrompts[theme][promptIndex];
    } else {
      const themeCapitalized = theme.charAt(0).toUpperCase() + theme.slice(1);
      promptText = `Create a meme about ${themeCapitalized} - Day ${day} Challenge`;
    }
    
    // Get appropriate tags for the theme
    const tags = themeTags[theme] || [theme, 'meme', 'challenge', 'daily'];
    
    // Add the challenge
    challenges.push({
      day_of_year: day,
      text: promptText,
      theme: theme,
      tags: tags
    });
  }
  
  return challenges;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    // Get auth header from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || authHeader.split(' ')[1];
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the challenges
    const challenges = generateDailyChallenges();
    
    // Process request body
    let body = {};
    let mode = 'all';
    let dayNum: number | null = null;
    
    if (req.method === 'POST') {
      try {
        body = await req.json();
        mode = body.mode || 'all';
        dayNum = body.day || null;
      } catch (e) {
        console.error('Error parsing request body:', e);
      }
    } else {
      // Process mode (insert all or specific day) from URL params
      const url = new URL(req.url);
      const day = url.searchParams.get('day');
      mode = url.searchParams.get('mode') || 'all';
      dayNum = day ? parseInt(day, 10) : null;
    }
    
    let result;
    
    if (mode === 'day' && dayNum) {
      // Find the specific day's challenge
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 365) {
        return new Response(JSON.stringify({ error: 'Invalid day parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const challenge = challenges.find(c => c.day_of_year === dayNum);
      if (!challenge) {
        return new Response(JSON.stringify({ error: 'Challenge not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Upsert the specific challenge
      const { data, error } = await supabase
        .from('daily_challenges')
        .upsert([challenge], { onConflict: 'day_of_year' });
      
      result = { mode: 'day', day: dayNum, inserted: !error ? 1 : 0, error: error?.message };
    } else {
      // Bulk insert all challenges
      const { data, error } = await supabase
        .from('daily_challenges')
        .upsert(challenges, { onConflict: 'day_of_year' });
      
      result = { mode: 'all', inserted: !error ? challenges.length : 0, error: error?.message };
    }

    // Return the result with CORS headers
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

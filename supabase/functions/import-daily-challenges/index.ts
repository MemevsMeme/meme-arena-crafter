
// Import daily challenges from local data to Supabase database
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// This function will run when the edge function is invoked
serve(async (req) => {
  try {
    // Parse the request body to get the daily challenges data
    const { challenges } = await req.json();
    
    if (!Array.isArray(challenges) || challenges.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid challenges data. Expected non-empty array." 
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Received ${challenges.length} challenges to import`);
    
    // Get Supabase connection details from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing Supabase configuration" 
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First check if we already have challenges in the database
    const { data: existingChallenges, error: checkError } = await supabase
      .from('daily_challenges')
      .select('day_of_year')
      .order('day_of_year', { ascending: true });
      
    if (checkError) {
      console.error("Error checking existing challenges:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Database error when checking existing challenges: ${checkError.message}` 
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Create a set of existing day_of_year values for quick lookup
    const existingDays = new Set(existingChallenges?.map(c => c.day_of_year) || []);
    
    console.log(`Found ${existingDays.size} existing challenges in database`);
    
    // Filter out challenges that already exist in the database
    const newChallenges = challenges.filter(challenge => {
      // Check if this day_of_year already exists
      return !existingDays.has(challenge.day_of_year);
    });
    
    console.log(`Adding ${newChallenges.length} new challenges to database`);
    
    if (newChallenges.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "All challenges already exist in database",
          added: 0,
          total: challenges.length
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Insert the new challenges
    const { data, error } = await supabase
      .from('daily_challenges')
      .insert(newChallenges);
    
    if (error) {
      console.error("Error inserting challenges:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Database error: ${error.message}` 
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported daily challenges`, 
        added: newChallenges.length,
        total: challenges.length
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${error.message}` 
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

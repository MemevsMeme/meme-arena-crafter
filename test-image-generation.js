// Simple test script for our two-step image generation
require('dotenv').config();
const { generateOptimizedPrompt, generateMemeImage } = require('./server/ai');

async function testTwoStepImageGeneration() {
  // Test prompt
  const testPrompt = "A cat trying to use a computer but failing miserably";
  
  console.log("Step 1: Generating optimized prompt...");
  const optimizedPrompt = await generateOptimizedPrompt(testPrompt, "cartoon");
  
  console.log("\nOriginal prompt:", testPrompt);
  console.log("Optimized prompt:", optimizedPrompt);
  
  console.log("\nStep 2: Generating image with optimized prompt...");
  const result = await generateMemeImage(testPrompt + " in cartoon style");
  
  if (result.success) {
    console.log("\nImage generation successful!");
    console.log("Image URL:", result.imageUrl);
  } else {
    console.log("\nImage generation failed:", result.error);
  }
}

testTwoStepImageGeneration().catch(console.error);

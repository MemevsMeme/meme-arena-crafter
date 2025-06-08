// Script to generate sound files and save them to the public directory
// This is meant to be run once to create all the sound files

import { generateAllSounds } from '../utils/soundEffects';

// Generate and save all sound effects
(async () => {
  console.log('Generating sound effects...');
  await generateAllSounds();
  console.log('Sound effects generated successfully!');
})();
const { execSync } = require('child_process');

// Set environment variable to auto-answer migration prompts
process.env.DRIZZLE_MIGRATION_ANSWERS = 'create';

// Run the migration command
try {
  console.log('Running database migration...');
  execSync('npx drizzle-kit push --verbose', { 
    stdio: 'inherit',
    env: { ...process.env, DRIZZLE_MIGRATION_ANSWERS: 'create' }
  });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
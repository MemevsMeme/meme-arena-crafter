const { execSync } = require('child_process');
const fs = require('fs');

// Create a drizzle migration file
const content = `
// Automatically answer "create column" to any migration prompts
process.env.DRIZZLE_MIGRATION_ANSWERS = 'create';

// Run the migration command
try {
  const { execSync } = require('child_process');
  execSync('drizzle-kit push --verbose', { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
`;

fs.writeFileSync('migrate-db.js', content);

// Run the migration
try {
  execSync('node migrate-db.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to run migration:', error);
  process.exit(1);
}

console.log('Database migration completed!');
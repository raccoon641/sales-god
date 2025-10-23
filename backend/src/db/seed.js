const pool = require('./connection');

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    
    // Create sample team
    const teamResult = await pool.query(`
      INSERT INTO teams (name) 
      VALUES ('Sales Team Alpha')
      RETURNING id
    `);
    const teamId = teamResult.rows[0].id;
    
    // Create sample users
    const users = [
      { user_id: 'john.doe@company.com', email: 'john.doe@company.com', name: 'John Doe', role: 'rep', team_id: teamId },
      { user_id: 'jane.smith@company.com', email: 'jane.smith@company.com', name: 'Jane Smith', role: 'rep', team_id: teamId },
      { user_id: 'manager@company.com', email: 'manager@company.com', name: 'Sales Manager', role: 'admin', team_id: teamId }
    ];
    
    for (const user of users) {
      await pool.query(`
        INSERT INTO users (user_id, email, name, role, team_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO NOTHING
      `, [user.user_id, user.email, user.name, user.role, user.team_id]);
    }
    
    console.log('✅ Database seeded successfully');
    console.log('📧 Sample users created:');
    console.log('   - john.doe@company.com (rep)');
    console.log('   - jane.smith@company.com (rep)');
    console.log('   - manager@company.com (admin)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();


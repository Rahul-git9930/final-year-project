const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://rahul1321:R%40hul1321@cluster0.ibrug.mongodb.net/library_db';
    await mongoose.connect(uri);
    
    const users = await User.find({}).select('email name role isActive password');
    console.log('Users in database:');
    users.forEach(u => {
      console.log(`  Email: ${u.email}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Active: ${u.isActive}`);
      console.log(`  Has Password: ${!!u.password}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

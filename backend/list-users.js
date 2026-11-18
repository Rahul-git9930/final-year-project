// Check Users with Details
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

async function checkUsers() {
  try {
    const users = await User.find({}).select('name email role');
    
    console.log(`\n📊 Total Users: ${users.length}\n`);
    
    const byRole = {
      admin: users.filter(u => u.role === 'admin'),
      librarian: users.filter(u => u.role === 'librarian'),
      student: users.filter(u => u.role === 'student'),
      member: users.filter(u => u.role === 'member')
    };
    
    console.log('👥 Users by Role:');
    console.log(`   Admins: ${byRole.admin.length}`);
    console.log(`   Librarians: ${byRole.librarian.length}`);
    console.log(`   Students: ${byRole.student.length}`);
    console.log(`   Members: ${byRole.member.length}\n`);
    
    console.log('👤 Admin Users:');
    byRole.admin.forEach(u => console.log(`   - ${u.name} (${u.email})`));
    
    console.log('\n👤 Student Users:');
    if (byRole.student.length > 0) {
      byRole.student.forEach(u => console.log(`   - ${u.name} (${u.email})`));
    } else {
      console.log('   ⚠️  No student users found!');
      console.log('   💡 Create one at: http://localhost:5000/signup.html');
    }
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setTimeout(checkUsers, 1000);

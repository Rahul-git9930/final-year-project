// Create Test Student Account
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

async function createTestStudent() {
  try {
    // Check if test student already exists
    const existingStudent = await User.findOne({ email: 'test.student@library.com' });
    
    if (existingStudent) {
      console.log('⚠️  Test student already exists!');
      console.log(`   Email: test.student@library.com`);
      console.log(`   Name: ${existingStudent.name}`);
      console.log(`   Role: ${existingStudent.role}\n`);
      console.log('💡 You can use these credentials:');
      console.log('   Email: test.student@library.com');
      console.log('   Password: Student@123\n');
      process.exit(0);
      return;
    }

    // Create new test student
    const hashedPassword = await bcrypt.hash('Student@123', 10);
    
    const testStudent = new User({
      name: 'Test Student',
      email: 'test.student@library.com',
      password: hashedPassword,
      role: 'student',
      phone: '1234567890'
    });

    await testStudent.save();
    
    console.log('✅ Test student created successfully!\n');
    console.log('📋 Student Details:');
    console.log(`   Name: ${testStudent.name}`);
    console.log(`   Email: ${testStudent.email}`);
    console.log(`   Password: Student@123`);
    console.log(`   Role: ${testStudent.role}\n`);
    
    console.log('🎯 You can now:');
    console.log('   1. Login at: http://localhost:5000');
    console.log('   2. Use email: test.student@library.com');
    console.log('   3. Use password: Student@123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setTimeout(createTestStudent, 1000);

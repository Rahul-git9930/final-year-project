const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const BookRequest = require('./models/BookRequest');
const Book = require('./models/Book');

async function createTestData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/library', {
      useNewUrlParser: true
    });

    console.log('📌 Creating test data...\n');

    // Create admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@library.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin'
    };

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    let admin = await User.findOne({ email: adminData.email });
    
    if (!admin) {
      admin = new User({
        ...adminData,
        password: hashedPassword
      });
      await admin.save();
      console.log('✅ Created admin user: admin@library.com (password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create student user
    const studentData = {
      name: 'Test Student',
      email: 'student@library.com',
      password: 'student123',
      phone: '8888888888',
      role: 'student'
    };

    const studentHashedPassword = await bcrypt.hash(studentData.password, 10);
    let student = await User.findOne({ email: studentData.email });
    
    if (!student) {
      student = new User({
        ...studentData,
        password: studentHashedPassword
      });
      await student.save();
      console.log('✅ Created student user: student@library.com (password: student123)');
    } else {
      console.log('ℹ️  Student user already exists');
    }

    // Get first few books
    const books = await Book.find().limit(3);
    console.log(`\n📚 Found ${books.length} books for creating test requests`);

    if (books.length > 0) {
      // Create book requests from student
      let requestCount = 0;
      for (const book of books) {
        const existingRequest = await BookRequest.findOne({
          book: book._id,
          user: student._id,
          status: 'pending'
        });

        if (!existingRequest) {
          const request = new BookRequest({
            book: book._id,
            user: student._id,
            requestType: 'issue',
            status: 'pending'
          });
          await request.save();
          console.log(`✅ Created book request for: "${book.title}"`);
          requestCount++;
        } else {
          console.log(`ℹ️  Request already exists for: "${book.title}"`);
        }
      }

      if (requestCount > 0) {
        console.log(`\n📊 Created ${requestCount} new book requests`);
      }
    }

    // Display summary
    const totalUsers = await User.countDocuments();
    const totalRequests = await BookRequest.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const studentCount = await User.countDocuments({ role: 'student' });

    console.log('\n📊 Database Summary:');
    console.log(`   Total Users: ${totalUsers} (Admin: ${adminCount}, Student: ${studentCount})`);
    console.log(`   Total Book Requests: ${totalRequests}`);
    console.log(`   Total Books: ${await Book.countDocuments()}`);

    console.log('\n✅ Test data creation completed!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:   admin@library.com / admin123');
    console.log('   Student: student@library.com / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    process.exit(1);
  }
}

createTestData();

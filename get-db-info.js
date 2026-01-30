// MongoDB Database Info Script
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import all models
const User = require('./models/User');
const Book = require('./models/Book');
const Transaction = require('./models/Transaction');
const Fine = require('./models/Fine');
const BookRequest = require('./models/BookRequest');
const Wishlist = require('./models/Wishlist');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

async function getDatabaseInfo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB\n');
    console.log('=' .repeat(60));
    console.log('📊 DATABASE INFORMATION');
    console.log('=' .repeat(60));
    
    // Get counts for each collection
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const fineCount = await Fine.countDocuments();
    const requestCount = await BookRequest.countDocuments();
    const wishlistCount = await Wishlist.countDocuments();
    const reviewCount = await Review.countDocuments();
    const notificationCount = await Notification.countDocuments();
    
    console.log('\n📈 COLLECTION COUNTS:');
    console.log('-'.repeat(60));
    console.log(`Users:         ${userCount}`);
    console.log(`Books:         ${bookCount}`);
    console.log(`Transactions:  ${transactionCount}`);
    console.log(`Fines:         ${fineCount}`);
    console.log(`Requests:      ${requestCount}`);
    console.log(`Wishlists:     ${wishlistCount}`);
    console.log(`Reviews:       ${reviewCount}`);
    console.log(`Notifications: ${notificationCount}`);
    
    // Get user breakdown by role
    console.log('\n👥 USERS BY ROLE:');
    console.log('-'.repeat(60));
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    usersByRole.forEach(role => {
      console.log(`${role._id.padEnd(15)}: ${role.count}`);
    });
    
    // Sample users
    if (userCount > 0) {
      console.log('\n📝 SAMPLE USERS:');
      console.log('-'.repeat(60));
      const sampleUsers = await User.find().limit(5).select('name email role isActive');
      sampleUsers.forEach(user => {
        console.log(`${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
      });
    }
    
    // Get book statistics
    if (bookCount > 0) {
      console.log('\n📚 BOOKS STATISTICS:');
      console.log('-'.repeat(60));
      
      const booksByCategory = await Book.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      
      console.log('Top 5 Categories:');
      booksByCategory.forEach(cat => {
        console.log(`  ${cat._id}: ${cat.count} books`);
      });
      
      const totalCopies = await Book.aggregate([
        { $group: { _id: null, total: { $sum: '$quantity' }, available: { $sum: '$available' } } }
      ]);
      
      if (totalCopies.length > 0) {
        console.log(`\nTotal Book Copies: ${totalCopies[0].total}`);
        console.log(`Available Copies:  ${totalCopies[0].available}`);
        console.log(`Issued Copies:     ${totalCopies[0].total - totalCopies[0].available}`);
      }
      
      // Sample books
      console.log('\n📖 SAMPLE BOOKS:');
      console.log('-'.repeat(60));
      const sampleBooks = await Book.find().limit(5).select('title author category available quantity');
      sampleBooks.forEach(book => {
        console.log(`"${book.title}" by ${book.author} [${book.category}] - ${book.available}/${book.quantity} available`);
      });
    }
    
    // Transaction statistics
    if (transactionCount > 0) {
      console.log('\n📊 TRANSACTION STATISTICS:');
      console.log('-'.repeat(60));
      
      const transactionsByStatus = await Transaction.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      transactionsByStatus.forEach(status => {
        console.log(`${status._id.padEnd(15)}: ${status.count}`);
      });
      
      // Recent transactions
      console.log('\n🕒 RECENT TRANSACTIONS:');
      console.log('-'.repeat(60));
      const recentTransactions = await Transaction.find()
        .populate('user', 'name email')
        .populate('book', 'title author')
        .sort({ issueDate: -1 })
        .limit(5);
      
      recentTransactions.forEach(trans => {
        const issueDate = new Date(trans.issueDate).toLocaleDateString();
        console.log(`${trans.user.name} borrowed "${trans.book.title}" on ${issueDate} - Status: ${trans.status}`);
      });
    }
    
    // Fine statistics
    if (fineCount > 0) {
      console.log('\n💰 FINE STATISTICS:');
      console.log('-'.repeat(60));
      
      const fineStats = await Fine.aggregate([
        {
          $group: {
            _id: null,
            totalFines: { $sum: '$amount' },
            paidFines: { $sum: { $cond: ['$isPaid', '$amount', 0] } },
            unpaidFines: { $sum: { $cond: ['$isPaid', 0, '$amount'] } }
          }
        }
      ]);
      
      if (fineStats.length > 0) {
        console.log(`Total Fines:   ₹${fineStats[0].totalFines.toFixed(2)}`);
        console.log(`Paid Fines:    ₹${fineStats[0].paidFines.toFixed(2)}`);
        console.log(`Unpaid Fines:  ₹${fineStats[0].unpaidFines.toFixed(2)}`);
      }
    }
    
    // Request statistics
    if (requestCount > 0) {
      console.log('\n📋 REQUEST STATISTICS:');
      console.log('-'.repeat(60));
      
      const requestsByStatus = await BookRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      requestsByStatus.forEach(status => {
        console.log(`${status._id.padEnd(15)}: ${status.count}`);
      });
    }
    
    // Database size info
    console.log('\n💾 DATABASE INFO:');
    console.log('-'.repeat(60));
    const dbStats = await mongoose.connection.db.stats();
    console.log(`Database Name:  ${mongoose.connection.db.databaseName}`);
    console.log(`Collections:    ${dbStats.collections}`);
    console.log(`Data Size:      ${(dbStats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`Storage Size:   ${(dbStats.storageSize / 1024).toFixed(2)} KB`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database information retrieved successfully!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

getDatabaseInfo();

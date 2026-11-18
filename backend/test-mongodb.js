const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 URI:', process.env.MONGO_URI?.substring(0, 30) + '...');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  // Test collections
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  console.log('\n📦 Collections in database:');
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`   - ${col.name}: ${count} documents`);
  }
  
  // Test User model
  const User = require('./models/User');
  const users = await User.countDocuments();
  console.log('\n👥 Total Users:', users);
  
  // Test Book model
  const Book = require('./models/Book');
  const books = await Book.countDocuments();
  console.log('📚 Total Books:', books);
  
  // Test Transaction model
  const Transaction = require('./models/Transaction');
  const transactions = await Transaction.countDocuments();
  console.log('📝 Total Transactions:', transactions);
  
  // Test BookRequest model
  const BookRequest = require('./models/BookRequest');
  const requests = await BookRequest.countDocuments();
  console.log('📬 Total Book Requests:', requests);
  
  console.log('\n✅ All models working correctly!');
  
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

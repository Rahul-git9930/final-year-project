const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');

dotenv.config();

const listBookIds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully');

    const books = await Book.find({}, 'title _id');

    if (books.length === 0) {
      console.log('No books found in the database.');
      return;
    }

    console.log('\n--- List of Books and their Unique IDs ---');
    books.forEach(book => {
      console.log(`Title: "${book.title}"`);
      console.log(`  ID: ${book._id}\n`);
    });
    console.log('------------------------------------------');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

listBookIds();

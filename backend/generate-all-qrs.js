const mongoose = require('mongoose');
const dotenv = require('dotenv');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Book = require('./models/Book');

// Load environment variables
const backendEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: fs.existsSync(backendEnvPath) ? backendEnvPath : rootEnvPath });

async function generateAllQRs() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in your .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    const books = await Book.find({});
    console.log(`Found ${books.length} books in the database.`);

    let updatedCount = 0;

    for (const book of books) {
      const qrData = JSON.stringify({
        bookId: book._id,
        title: book.title,
        author: book.author,
        isbn: book.isbn || 'N/A'
      });
      
      const qrCodeBase64 = await QRCode.toDataURL(qrData);
      book.qrCode = qrCodeBase64;
      await book.save();
      updatedCount++;
      console.log(`Generated QR for: "${book.title}"`);
    }

    console.log(`\n🎉 Successfully generated and saved QR codes for ${updatedCount} books.`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating QR codes:', error);
    process.exit(1);
  }
}

generateAllQRs();
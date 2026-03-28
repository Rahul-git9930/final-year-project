const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Payment = require('./models/Payment');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/library_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test data for different payment scenarios
const testPayments = [
  {
    userId: new mongoose.Types.ObjectId(), // Replace with actual user ID
    amount: 100,
    purpose: 'fine',
    status: 'success',
    description: 'Late fine - Book returned after 5 days',
    paymentMethod: 'online',
    razorpay_order_id: 'order_test_001',
    razorpay_payment_id: 'pay_test_001',
    razorpay_signature: 'signature_test_001',
    transactionDate: new Date(),
    verifiedAt: new Date()
  },
  {
    userId: new mongoose.Types.ObjectId(), // Replace with actual user ID
    amount: 500,
    purpose: 'membership',
    status: 'success',
    description: 'Annual membership renewal',
    paymentMethod: 'online',
    razorpay_order_id: 'order_test_002',
    razorpay_payment_id: 'pay_test_002',
    razorpay_signature: 'signature_test_002',
    transactionDate: new Date(),
    verifiedAt: new Date()
  },
  {
    userId: new mongoose.Types.ObjectId(), // Replace with actual user ID
    amount: 200,
    purpose: 'penalty',
    status: 'success',
    description: 'Book damaged - Database Fundamentals',
    paymentMethod: 'cash',
    transactionDate: new Date(),
    verifiedAt: new Date()
  }
];

async function createTestPayments() {
  try {
    await Payment.deleteMany({}); // Clear existing test data
    const result = await Payment.insertMany(testPayments);
    console.log('✅ Test payments created successfully');
    console.log(`Created ${result.length} test payment records`);
    
    // Display created payments
    console.log('\n📋 Created Payments:');
    result.forEach((payment, index) => {
      console.log(`\n${index + 1}. ${payment.purpose.toUpperCase()}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Method: ${payment.paymentMethod}`);
      console.log(`   ID: ${payment._id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test payments:', error);
    process.exit(1);
  }
}

async function viewAllPayments() {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('\n📊 All Payments in Database:');
    console.log('═'.repeat(80));
    
    payments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
      console.log(`   User: ${payment.userId?.name || 'Unknown'} (${payment.userId?._id})`);
      console.log(`   Purpose: ${payment.purpose}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Method: ${payment.paymentMethod}`);
      console.log(`   Date: ${new Date(payment.createdAt).toLocaleString()}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log(`Total Payments: ${payments.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing payments:', error);
    process.exit(1);
  }
}

async function getPaymentStats() {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const byPurpose = await Payment.aggregate([
      {
        $group: {
          _id: '$purpose',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const byMethod = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    console.log('\n📊 PAYMENT STATISTICS');
    console.log('═'.repeat(80));
    
    console.log('\n💰 By Status:');
    stats.forEach(s => {
      console.log(`   ${s._id}: ${s.count} payments = ₹${s.total}`);
    });
    
    console.log('\n📌 By Purpose:');
    byPurpose.forEach(p => {
      console.log(`   ${p._id}: ${p.count} payments = ₹${p.total}`);
    });
    
    console.log('\n🔄 By Method:');
    byMethod.forEach(m => {
      console.log(`   ${m._id}: ${m.count} payments = ₹${m.total}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    process.exit(1);
  }
}

// Run based on command line argument
const command = process.argv[2];

if (command === 'create') {
  console.log('🔄 Creating test payments...');
  createTestPayments();
} else if (command === 'view') {
  console.log('📖 Viewing all payments...');
  viewAllPayments();
} else if (command === 'stats') {
  console.log('📈 Calculating payment statistics...');
  getPaymentStats();
} else {
  console.log(`
  ❓ Usage: node test-payments.js [command]
  
  Commands:
    create   - Create test payment records
    view     - View all payments in database
    stats    - Show payment statistics
  
  Examples:
    node test-payments.js create
    node test-payments.js view
    node test-payments.js stats
  `);
  process.exit(1);
}

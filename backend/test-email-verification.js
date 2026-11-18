/**
 * Test Email Verification System
 * This script tests the email verification functionality
 */

const emailVerificationService = require('./services/emailVerification');

// Test emails
const testEmails = [
  { email: 'test@gmail.com', expected: 'valid' },
  { email: 'user@yahoo.com', expected: 'valid' },
  { email: 'fake@tempmail.com', expected: 'invalid - disposable' },
  { email: 'invalid-email', expected: 'invalid - format' },
  { email: 'test@nonexistentdomain12345.com', expected: 'invalid - domain' },
];

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification System\n');
  console.log('Provider:', process.env.EMAIL_VERIFICATION_PROVIDER || 'basic');
  console.log('Enabled:', process.env.EMAIL_VERIFICATION_ENABLED || 'false');
  console.log('Min Score:', process.env.EMAIL_MIN_SCORE || '50');
  console.log('\n' + '='.repeat(80) + '\n');

  for (const test of testEmails) {
    try {
      console.log(`📧 Testing: ${test.email}`);
      console.log(`   Expected: ${test.expected}`);
      
      const result = await emailVerificationService.verifyEmail(test.email);
      
      console.log(`   Result: ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
      console.log(`   Score: ${result.score}/100`);
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('='.repeat(80));
  console.log('✨ Test completed!\n');
  
  // Test the isValidEmail helper
  console.log('\n🔍 Testing isValidEmail helper (min score: 50):\n');
  
  for (const test of testEmails) {
    try {
      const isValid = await emailVerificationService.isValidEmail(test.email, 50);
      console.log(`${test.email}: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    } catch (error) {
      console.log(`${test.email}: ❌ ERROR - ${error.message}`);
    }
  }
}

// Run tests
testEmailVerification()
  .then(() => {
    console.log('\n✅ All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

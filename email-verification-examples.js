/**
 * Email Verification Integration Example
 * Shows how to use the email verification service in your code
 */

// Import the service
const emailVerificationService = require('./services/emailVerification');

// Example 1: Basic email verification
async function example1_basicVerification() {
  console.log('Example 1: Basic Email Verification\n');
  
  const email = 'test@gmail.com';
  const result = await emailVerificationService.verifyEmail(email);
  
  console.log('Email:', email);
  console.log('Valid:', result.valid);
  console.log('Score:', result.score);
  console.log('Details:', result.details);
  console.log('');
}

// Example 2: Check if email meets minimum score
async function example2_minimumScore() {
  console.log('Example 2: Check Minimum Score\n');
  
  const email = 'user@yahoo.com';
  const minScore = 60;
  
  const isValid = await emailVerificationService.isValidEmail(email, minScore);
  
  console.log('Email:', email);
  console.log('Minimum Score Required:', minScore);
  console.log('Passes:', isValid ? 'YES ✅' : 'NO ❌');
  console.log('');
}

// Example 3: Validate multiple emails
async function example3_bulkValidation() {
  console.log('Example 3: Bulk Email Validation\n');
  
  const emails = [
    'valid@gmail.com',
    'test@tempmail.com',
    'invalid-email',
    'user@example.com'
  ];
  
  for (const email of emails) {
    try {
      const result = await emailVerificationService.verifyEmail(email);
      console.log(`${email}: ${result.valid ? '✅' : '❌'} (Score: ${result.score})`);
    } catch (error) {
      console.log(`${email}: ❌ Error - ${error.message}`);
    }
  }
  console.log('');
}

// Example 4: Custom validation logic
async function example4_customLogic() {
  console.log('Example 4: Custom Validation Logic\n');
  
  const email = 'admin@company.com';
  const result = await emailVerificationService.verifyEmail(email);
  
  // Custom business logic
  if (!result.valid) {
    console.log('❌ Email rejected: Invalid format or undeliverable');
  } else if (result.details.disposable) {
    console.log('❌ Email rejected: Disposable email detected');
  } else if (result.score < 50) {
    console.log('⚠️ Email warning: Low quality score');
  } else if (result.details.role) {
    console.log('ℹ️ Email info: Role-based email (admin@, info@, etc.)');
  } else {
    console.log('✅ Email accepted: Valid and deliverable');
  }
  
  console.log('Details:', result.details);
  console.log('');
}

// Example 5: Error handling
async function example5_errorHandling() {
  console.log('Example 5: Error Handling\n');
  
  const email = 'test@example.com';
  
  try {
    const result = await emailVerificationService.verifyEmail(email);
    console.log('Verification successful:', result.valid);
  } catch (error) {
    console.error('Verification failed:', error.message);
    
    // Fallback: Allow registration but flag for manual review
    console.log('Fallback: Allowing registration with manual review flag');
  }
  console.log('');
}

// Example 6: Integration with user registration
async function example6_registrationIntegration() {
  console.log('Example 6: Registration Integration\n');
  
  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepass123'
  };
  
  try {
    // Verify email first
    console.log('Verifying email...');
    const verification = await emailVerificationService.verifyEmail(userData.email);
    
    if (!verification.valid) {
      throw new Error(`Invalid email: ${verification.details.reason}`);
    }
    
    if (verification.score < 50) {
      throw new Error(`Email quality too low: Score ${verification.score}/100`);
    }
    
    console.log('✅ Email verified successfully');
    console.log('   Score:', verification.score);
    console.log('   Proceeding with registration...');
    
    // Now create user with verification data
    const user = {
      ...userData,
      emailVerified: verification.valid,
      emailVerificationScore: verification.score,
      emailVerificationDetails: verification.details
    };
    
    console.log('User created:', user.name, '(' + user.email + ')');
    console.log('');
    
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    console.log('');
  }
}

// Run all examples
async function runAllExamples() {
  console.log('='.repeat(80));
  console.log('EMAIL VERIFICATION SERVICE - INTEGRATION EXAMPLES');
  console.log('='.repeat(80));
  console.log('');
  
  try {
    await example1_basicVerification();
    await example2_minimumScore();
    await example3_bulkValidation();
    await example4_customLogic();
    await example5_errorHandling();
    await example6_registrationIntegration();
    
    console.log('='.repeat(80));
    console.log('All examples completed!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run examples
// runAllExamples();

// Export functions for use in other files
module.exports = {
  example1_basicVerification,
  example2_minimumScore,
  example3_bulkValidation,
  example4_customLogic,
  example5_errorHandling,
  example6_registrationIntegration,
  runAllExamples
};

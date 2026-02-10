// QR Scanner Feature Test Script
// Run this with: node test-qr-scanner.js

const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Test credentials
const testUser = {
  email: 'student@library.com',
  password: 'password123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Test 1: Login
async function testLogin() {
  log('\n🔐 Test 1: User Login', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      authToken = data.token;
      log('✅ Login successful', 'green');
      log(`   Token: ${authToken.substring(0, 20)}...`, 'green');
      return true;
    } else {
      log('❌ Login failed: ' + (data.message || 'Unknown error'), 'red');
      return false;
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
    return false;
  }
}

// Test 2: Get all books
async function testGetBooks() {
  log('\n📚 Test 2: Get All Books', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/books`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const books = await response.json();
    
    if (response.ok && Array.isArray(books)) {
      log(`✅ Found ${books.length} books`, 'green');
      if (books.length > 0) {
        log(`   First book: ${books[0].title} (ID: ${books[0]._id})`, 'green');
        return books[0]; // Return first book for next tests
      }
      return null;
    } else {
      log('❌ Failed to get books', 'red');
      return null;
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
    return null;
  }
}

// Test 3: Scan book by ID
async function testScanByID(bookId) {
  log('\n📱 Test 3: Scan Book by ID', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/books/scan/${bookId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Book scanned successfully', 'green');
      log(`   Title: ${data.book.title}`, 'green');
      log(`   Author: ${data.book.author}`, 'green');
      log(`   Available: ${data.book.availableCopies}`, 'green');
      return data.book;
    } else {
      log('❌ Scan failed: ' + (data.message || 'Unknown error'), 'red');
      return null;
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
    return null;
  }
}

// Test 4: Scan book by ISBN
async function testScanByISBN(isbn) {
  log('\n📱 Test 4: Scan Book by ISBN', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/books/scan/${isbn}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Book scanned by ISBN successfully', 'green');
      log(`   Title: ${data.book.title}`, 'green');
      return data.book;
    } else {
      log('⚠️  ISBN scan result: ' + (data.message || 'Not found'), 'yellow');
      return null;
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
    return null;
  }
}

// Test 5: Issue book via scan
async function testIssueByScan(bookId) {
  log('\n📖 Test 5: Issue Book via Scan', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/issue-scan`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookId })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Book issued successfully', 'green');
      log(`   Transaction ID: ${data.transaction._id}`, 'green');
      log(`   Due Date: ${new Date(data.dueDate).toLocaleDateString()}`, 'green');
      return data.transaction;
    } else {
      log('⚠️  Issue result: ' + (data.message || 'Unknown error'), 'yellow');
      log('   (This is normal if book already issued or unavailable)', 'yellow');
      return null;
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
    return null;
  }
}

// Test 6: Try to issue same book again (should fail)
async function testDuplicateIssue(bookId) {
  log('\n🚫 Test 6: Duplicate Issue Prevention', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/issue-scan`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookId })
    });

    const data = await response.json();
    
    if (!response.ok && data.message) {
      log('✅ Duplicate prevented correctly', 'green');
      log(`   Error message: "${data.message}"`, 'green');
      return true;
    } else {
      log('⚠️  Duplicate was not prevented (unexpected)', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
    return false;
  }
}

// Test 7: Invalid book ID
async function testInvalidBookID() {
  log('\n❓ Test 7: Invalid Book ID Handling', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/api/books/scan/invalidid123`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      log('✅ Invalid ID handled correctly', 'green');
      log(`   Error message: "${data.message}"`, 'green');
      return true;
    } else {
      log('⚠️  Invalid ID not rejected (unexpected)', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Error: ' + error.message, 'red');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('🚀 Starting QR Scanner Feature Tests...', 'blue');
  log('==========================================\n', 'blue');

  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log('\n❌ Cannot continue without login. Exiting.', 'red');
    return;
  }

  // Test 2: Get books
  const testBook = await testGetBooks();
  if (!testBook) {
    log('\n❌ No books available for testing. Add books first.', 'red');
    return;
  }

  // Test 3: Scan by ID
  const scannedBook = await testScanByID(testBook._id);

  // Test 4: Scan by ISBN (if available)
  if (testBook.isbn) {
    await testScanByISBN(testBook.isbn);
  } else {
    log('\n⚠️  Test 4 skipped: Book has no ISBN', 'yellow');
  }

  // Test 5: Issue book
  const transaction = await testIssueByScan(testBook._id);

  // Test 6: Try duplicate issue
  if (transaction) {
    await testDuplicateIssue(testBook._id);
  } else {
    log('\n⚠️  Test 6 skipped: Book was not issued in Test 5', 'yellow');
  }

  // Test 7: Invalid ID
  await testInvalidBookID();

  // Summary
  log('\n==========================================', 'blue');
  log('✅ All QR Scanner Tests Completed!', 'green');
  log('==========================================\n', 'blue');
}

// Run tests
runAllTests().catch(error => {
  log('\n💥 Test suite crashed: ' + error.message, 'red');
  console.error(error);
});

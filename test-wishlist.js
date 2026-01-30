const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Test credentials
const testUser = {
  email: 'rahulwaditake1@gmail.com',
  password: 'password123'
};

let token = '';
let bookId = '';

async function login() {
  console.log('\n📝 Testing Login...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      const data = await response.json();
      token = data.token;
      console.log('✅ Login successful');
      console.log('Token:', token.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ Login failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function getBooks() {
  console.log('\n📚 Getting Books...');
  try {
    const response = await fetch(`${BASE_URL}/api/books`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const books = await response.json();
      console.log(`✅ Found ${books.length} books`);
      if (books.length > 0) {
        bookId = books[0]._id;
        console.log(`Using book: ${books[0].title} (ID: ${bookId})`);
        console.log(`Available: ${books[0].available}, Quantity: ${books[0].quantity}`);
        return true;
      }
    } else {
      console.log('❌ Failed to get books:', response.status);
    }
  } catch (error) {
    console.error('❌ Error getting books:', error.message);
  }
  return false;
}

async function addToWishlist() {
  console.log('\n💖 Adding Book to Wishlist...');
  try {
    const response = await fetch(`${BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ bookId })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Added to wishlist');
      console.log('Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('⚠️ Response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error.message);
    return false;
  }
}

async function getWishlist() {
  console.log('\n📋 Getting Wishlist...');
  try {
    const response = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const wishlist = await response.json();
      console.log(`✅ Wishlist has ${wishlist.length} items`);
      if (wishlist.length > 0) {
        console.log('Items:');
        wishlist.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.book.title}`);
          console.log(`     Author: ${item.book.author}`);
          console.log(`     Available: ${item.book.available}`);
          console.log(`     Added: ${new Date(item.addedAt).toLocaleDateString()}`);
        });
      }
      return true;
    } else {
      console.log('❌ Failed to get wishlist:', response.status);
      const error = await response.json();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('❌ Error getting wishlist:', error.message);
  }
  return false;
}

async function removeFromWishlist() {
  console.log('\n🗑️ Removing from Wishlist...');
  try {
    const response = await fetch(`${BASE_URL}/api/wishlist/${bookId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Removed from wishlist');
      console.log('Response:', data);
      return true;
    } else {
      console.log('❌ Failed to remove:', response.status);
      const error = await response.json();
      console.log('Error:', error);
    }
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error.message);
  }
  return false;
}

async function runTests() {
  console.log('🧪 Starting Wishlist API Tests...\n');
  console.log('=====================================================');
  
  if (!await login()) return;
  if (!await getBooks()) return;
  if (!await addToWishlist()) return;
  if (!await getWishlist()) return;
  if (!await removeFromWishlist()) return;
  if (!await getWishlist()) return;
  
  console.log('\n=====================================================');
  console.log('✅ All tests completed!');
}

runTests().catch(console.error);

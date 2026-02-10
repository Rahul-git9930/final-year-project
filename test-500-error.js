// Quick test to identify 500 error source
const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  const token = 'your-token-here'; // Will fail but shows us which endpoint
  
  const endpoints = [
    { name: 'Books', url: '/api/books' },
    { name: 'Wishlist', url: '/api/wishlist', needsAuth: true },
    { name: 'Transactions My', url: '/api/transactions/my', needsAuth: true },
    { name: 'Fines My', url: '/api/fines/my', needsAuth: true },
    { name: 'Notifications', url: '/api/notifications', needsAuth: true }
  ];
  
  console.log('Testing endpoints for 500 errors...\n');
  
  for (const endpoint of endpoints) {
    try {
      const headers = endpoint.needsAuth ? 
        { 'Authorization': 'Bearer ' + token } : 
        {};
        
      const response = await fetch(BASE_URL + endpoint.url, { headers });
      
      if (response.status === 500) {
        console.log(`❌ 500 ERROR: ${endpoint.name} (${endpoint.url})`);
        const text = await response.text();
        console.log('   Response:', text.substring(0, 100));
      } else if (response.status === 401) {
        console.log(`🔐 ${endpoint.name}: Needs authentication (expected)`);
      } else {
        console.log(`✅ ${endpoint.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

testEndpoints();

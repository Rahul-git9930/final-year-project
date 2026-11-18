// Test script to verify Book Requests functionality
// This script will:
// 1. Create a test admin user
// 2. Create a test student user  
// 3. Get some books
// 4. Create book requests from the student
// 5. Login as admin and fetch the requests

const http = require('http');

function makeRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Book Requests Functionality...\n');

  try {
    // Step 1: Register admin
    console.log('1️⃣  Registering admin user...');
    let adminRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Admin User',
      email: 'admin@library.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin'
    });
    
    if (adminRes.status === 201 || adminRes.status === 400) {
      console.log(`   ✅ Admin registration response: ${adminRes.status}`);
    } else {
      console.log(`   ❌ Admin registration failed: ${adminRes.status}`);
    }

    // Step 2: Register student
    console.log('\n2️⃣  Registering student user...');
    let studentRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Student',
      email: 'student@library.com',
      password: 'student123',
      phone: '8888888888',
      role: 'student'
    });

    if (studentRes.status === 201 || studentRes.status === 400) {
      console.log(`   ✅ Student registration response: ${studentRes.status}`);
    } else {
      console.log(`   ❌ Student registration failed: ${studentRes.status}`);
    }

    // Step 3: Login student
    console.log('\n3️⃣  Logging in student...');
    let studentLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'student@library.com',
      password: 'student123'
    });

    if (studentLoginRes.status !== 200) {
      console.log(`   ❌ Student login failed: ${studentLoginRes.status}`);
      console.log('   Response:', studentLoginRes.body);
      return;
    }

    const studentToken = studentLoginRes.body.token;
    console.log(`   ✅ Student login successful. Token: ${studentToken.substring(0, 20)}...`);

    // Step 4: Get books
    console.log('\n4️⃣  Fetching available books...');
    let booksRes = await makeRequest('GET', '/api/books', null, {
      'Authorization': `Bearer ${studentToken}`
    });

    if (booksRes.status !== 200) {
      console.log(`   ❌ Failed to get books: ${booksRes.status}`);
      return;
    }

    const books = booksRes.body;
    console.log(`   ✅ Got ${books.length} books`);

    // Step 5: Student makes book requests
    console.log('\n5️⃣  Creating book requests as student...');
    let requestCount = 0;
    for (let i = 0; i < Math.min(3, books.length); i++) {
      const bookId = books[i]._id;
      const bookTitle = books[i].title;
      
      let issueRes = await makeRequest('POST', '/api/requests/issue', {
        bookId: bookId
      }, {
        'Authorization': `Bearer ${studentToken}`
      });

      if (issueRes.status === 200) {
        console.log(`   ✅ Request created for: "${bookTitle}"`);
        requestCount++;
      } else {
        console.log(`   ℹ️  ${issueRes.body?.message || 'Could not create request for: ' + bookTitle}`);
      }
    }

    console.log(`   📊 Total requests created: ${requestCount}`);

    // Step 6: Login admin
    console.log('\n6️⃣  Logging in as admin...');
    let adminLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@library.com',
      password: 'admin123'
    });

    if (adminLoginRes.status !== 200) {
      console.log(`   ❌ Admin login failed: ${adminLoginRes.status}`);
      console.log('   Response:', adminLoginRes.body);
      return;
    }

    const adminToken = adminLoginRes.body.token;
    console.log(`   ✅ Admin login successful. Token: ${adminToken.substring(0, 20)}...`);

    // Step 7: Fetch book requests as admin
    console.log('\n7️⃣  Fetching book requests as admin...');
    let requestsRes = await makeRequest('GET', '/api/requests', null, {
      'Authorization': `Bearer ${adminToken}`
    });

    if (requestsRes.status !== 200) {
      console.log(`   ❌ Failed to fetch requests: ${requestsRes.status}`);
      console.log('   Response:', requestsRes.body);
      return;
    }

    const requests = requestsRes.body;
    console.log(`   ✅ Got ${requests.length} book requests`);

    if (requests.length > 0) {
      console.log('\n📋 Book Requests Details:');
      requests.slice(0, 3).forEach((req, i) => {
        console.log(`   ${i + 1}. Book: ${req.book?.title || 'Unknown'}`);
        console.log(`      Student: ${req.user?.name || 'Unknown'}`);
        console.log(`      Status: ${req.status}`);
      });
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n🎯 Summary:');
    console.log(`   - Admin created: admin@library.com`);
    console.log(`   - Student created: student@library.com`);
    console.log(`   - Book requests created: ${requestCount}`);
    console.log(`   - Requests visible to admin: ${requests.length}`);

    if (requests.length > 0) {
      console.log('\n✅ Book Requests feature is WORKING!');
      console.log('   The admin can see student book requests.');
    } else if (requestCount > 0) {
      console.log('\n⚠️  Requests were created but not showing in admin view.');
      console.log('   This might be a data persistence issue.');
    } else {
      console.log('\n⚠️  No requests were created.');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }

  process.exit(0);
}

// Give server time to start if needed
setTimeout(runTests, 1000);

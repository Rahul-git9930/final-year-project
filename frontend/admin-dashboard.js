// ============================================
// ADMIN DASHBOARD - LIBRARY MANAGEMENT SYSTEM
// ============================================

console.log('✅ admin-dashboard.js loaded successfully!');

// ================== REMOVE USER (GLOBAL SCOPE) ==================
async function removeUser(userId) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (userId === user.id) {
    alert("❌ You cannot remove yourself.");
    return;
  }

  if (!confirm('Are you sure you want to remove this member? This action cannot be undone.')) {
    return;
  }

  console.log(`🗑️ Attempting to remove user ${userId}...`);

  try {
    const response = await fetchWithTimeout(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    console.log(`✅ User ${userId} removed successfully.`);
    alert('✅ Member removed successfully.');
    loadUsers(); // Refresh the user list
  } catch (error) {
    console.error('❌ Error removing user:', error);
    alert(`❌ Error: ${error.message}`);
  }
}

// ================== FETCH PENDING REQUESTS COUNT ==================
async function updateRequestBadge() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetchWithTimeout('/api/requests', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) return;

    const requests = await response.json();
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    
    // Update badge in sidebar
    const badge = document.getElementById('requestBadge');
    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = 'inline-flex';
        console.log('✅ Badge updated:', pendingCount, 'pending requests');
      } else {
        badge.style.display = 'none';
        console.log('✅ No pending requests');
      }
    }
  } catch (error) {
    console.error('Error fetching request count:', error);
  }
}

// ================== FETCH WITH TIMEOUT ==================
function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timer)).catch(err => {
    if (err.name === 'AbortError') {
      throw new Error('Request timeout - server may be slow');
    }
    throw err;
  });
}

// ================== LOAD DASHBOARD ==================
async function loadDashboard() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  console.log('📊 Loading dashboard for:', user.email, 'Role:', user.role);
  
  if (!token) {
    content.innerHTML = '<h1>Dashboard</h1><p>❌ Please log in again.</p>';
    return;
  }
  
  try {
    console.log('🔄 Fetching /api/dashboard/stats...');
    const response = await fetchWithTimeout('/api/dashboard/stats', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    console.log('✅ Response status:', response.status);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const stats = await response.json();
    console.log('📈 Stats received:', stats);
    
    const pendingFines = Number(stats.pendingFines || 0);
    const recentTransactions = Array.isArray(stats.recentTransactions) ? stats.recentTransactions : [];
    
    content.innerHTML = `
      <h1>📊 Dashboard</h1>
      <p>Welcome back, <strong>${user.name || user.email}</strong>!</p>

      <div class="cards">
        <div class="card">Total Books<br><b>${stats.totalBooks || 0}</b></div>
        <div class="card">Total Members<br><b>${stats.totalMembers || 0}</b></div>
        <div class="card">Books Issued<br><b>${stats.booksIssued || 0}</b></div>
        <div class="card">Pending Fines<br><b>$${pendingFines.toFixed(2)}</b></div>
      </div>

      <div class="cards" style="margin-top: 20px;">
        <div class="card">Overdue Books<br><b>${stats.overdueBooks || 0}</b></div>
        <div class="card">Active Members<br><b>${stats.activeMembers || 0}</b></div>
        <div class="card">Available Books<br><b>${stats.availableBooks || 0}</b></div>
      </div>

      <h2>Quick Actions</h2>
      <div class="actions" style="display: flex; gap: 10px; margin: 20px 0;">
        <button onclick="handleAction('Add Book')" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Add Book</button>
        <button onclick="handleAction('Issue Book')" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Issue Book</button>
        <button onclick="handleAction('Add Member')" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Add Member</button>
        <button onclick="handleAction('View Reports')" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">View Reports</button>
      </div>

      <h2 style="margin-top: 30px;">📋 Recent Transactions</h2>
      <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 10px;">
        ${recentTransactions.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left;">Book</th>
                <th style="padding: 10px; text-align: left;">User</th>
                <th style="padding: 10px; text-align: left;">Issue Date</th>
                <th style="padding: 10px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${recentTransactions.map(t => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${t.book?.title || 'Unknown'}</td>
                  <td style="padding: 10px;">${t.user?.name || 'Unknown'}</td>
                  <td style="padding: 10px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                  <td style="padding: 10px;">${t.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>✅ No recent transactions</p>'}
      </div>
    `;
    
    console.log('✅ Dashboard loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading dashboard:', error);
    content.innerHTML = `
      <h1>📊 Dashboard</h1>
      <p>❌ Error loading dashboard</p>
      <p>${error.message}</p>
      <button onclick="loadDashboard()" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
    `;
  }
}

// ================== LOAD BOOKS ==================
async function loadBooks() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  console.log('📚 Loading books...');

  try {
    const response = await fetchWithTimeout('/api/books', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const books = await response.json();
    
    content.innerHTML = `
      <h1>📚 Books Management</h1>
      ${(user.role === 'admin' || user.role === 'librarian') ? `
        <button onclick="showAddBookForm()" style="margin-bottom: 20px; padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">+ Add New Book</button>
      ` : ''}
      
      <div style="margin-bottom: 20px;">
        <input type="text" id="searchBooks" placeholder="Search books..." style="padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 5px;">
        <button onclick="searchBooks()" style="padding: 10px 20px; margin-left: 10px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">🔍 Search</button>
      </div>

      <div class="books-list">
        ${books.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">Title</th>
                <th style="padding: 15px; text-align: left;">Author</th>
                <th style="padding: 15px; text-align: left;">Category</th>
                <th style="padding: 15px; text-align: center;">Available/Total</th>
                ${(user.role === 'admin' || user.role === 'librarian') ? '<th style="padding: 15px; text-align: center;">Actions</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${books.map(book => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${book.title}</td>
                  <td style="padding: 15px;">${book.author}</td>
                  <td style="padding: 15px;">${book.category}</td>
                  <td style="padding: 15px; text-align: center;">
                    <span style="color: ${book.available > 0 ? 'green' : 'red'}; font-weight: bold;">
                      ${book.available}/${book.quantity}
                    </span>
                  </td>
                  ${(user.role === 'admin' || user.role === 'librarian') ? `
                    <td style="padding: 15px; text-align: center;">
                      <button onclick="editBook('${book._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
                      ${user.role === 'admin' ? `<button onclick="deleteBook('${book._id}')" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px;">Delete</button>` : ''}
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>📭 No books found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('❌ Error loading books:', error);
    content.innerHTML = `<h1>Books Management</h1><p>❌ Error: ${error.message}</p>`;
  }
}

// ================== LOAD USERS ==================
async function loadUsers() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');
  
  console.log('👥 Loading users...');

  try {
    const response = await fetchWithTimeout('/api/users', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const users = await response.json();
    
    content.innerHTML = `
      <h1>👥 Users Management</h1>
      
      <div class="users-list">
        ${users.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">Name</th>
                <th style="padding: 15px; text-align: left;">Email</th>
                <th style="padding: 15px; text-align: left;">Role</th>
                <th style="padding: 15px; text-align: left;">Status</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${u.name}</td>
                  <td style="padding: 15px;">${u.email}</td>
                  <td style="padding: 15px;">${u.role}</td>
                  <td style="padding: 15px;"><span style="color: ${u.isActive ? 'green' : 'red'};">${u.isActive ? '✅ Active' : '❌ Inactive'}</span></td>
                  <td style="padding: 15px; text-align: center;">
                    <button onclick="viewUserDetails('${u._id}')" style="padding: 5px 10px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer;">View</button>
                    <button data-user-id="${u._id}" class="remove-user-btn" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px;">Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>📭 No users found.</p>'}
      </div>
    `;

    // Add event listeners for the remove buttons
    document.querySelectorAll('.remove-user-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const userId = event.target.getAttribute('data-user-id');
        removeUser(userId);
      });
    });
  } catch (error) {
    console.error('❌ Error loading users:', error);
    content.innerHTML = `<h1>Users Management</h1><p>❌ Error: ${error.message}</p>`;
  }
}

// ================== LOAD TRANSACTIONS ==================
async function loadTransactions() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');
  
  console.log('📝 Loading transactions...');

  try {
    const response = await fetchWithTimeout('/api/transactions', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const transactions = await response.json();
    
    content.innerHTML = `
      <h1>📝 Transactions</h1>
      
      <div class="transactions-list">
        ${transactions.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">Book</th>
                <th style="padding: 15px; text-align: left;">User</th>
                <th style="padding: 15px; text-align: left;">Issue Date</th>
                <th style="padding: 15px; text-align: left;">Status</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${t.book?.title || 'Unknown'}</td>
                  <td style="padding: 15px;">${t.user?.name || 'Unknown'}</td>
                  <td style="padding: 15px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                  <td style="padding: 15px;">${t.status}</td>
                  <td style="padding: 15px; text-align: center;">
                    ${t.status === 'issued' || t.status === 'overdue' ? `
                      <button onclick="returnBook('${t._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Return</button>
                    ` : '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>📭 No transactions found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('❌ Error loading transactions:', error);
    content.innerHTML = `<h1>Transactions</h1><p>❌ Error: ${error.message}</p>`;
  }
}

// ================== LOAD FINES ==================
async function loadFines() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');
  
  console.log('💰 Loading fines...');

  try {
    const response = await fetchWithTimeout('/api/fines', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const fines = await response.json();
    
    content.innerHTML = `
      <h1>💰 Fines Management</h1>
      
      <div class="fines-list">
        ${fines.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">User</th>
                <th style="padding: 15px; text-align: left;">Amount</th>
                <th style="padding: 15px; text-align: left;">Reason</th>
                <th style="padding: 15px; text-align: left;">Status</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${fines.map(f => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${f.userId?.name || 'Unknown'}</td>
                  <td style="padding: 15px;">$${f.amount.toFixed(2)}</td>
                  <td style="padding: 15px;">${f.reason || 'Overdue'}</td>
                  <td style="padding: 15px;"><span style="color: ${f.isPaid ? 'green' : 'red'};">${f.isPaid ? '✅ Paid' : '❌ Pending'}</span></td>
                  <td style="padding: 15px; text-align: center;">
                    ${!f.isPaid ? `
                      <button onclick="markFinePaid('${f._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Mark Paid</button>
                    ` : '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>✅ No fines found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('❌ Error loading fines:', error);
    content.innerHTML = `<h1>Fines Management</h1><p>❌ Error: ${error.message}</p>`;
  }
}

// ================== LOAD BOOK REQUESTS ==================
async function loadRequests() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');
  
  console.log('📬 Loading book requests...');

  try {
    const response = await fetchWithTimeout('/api/requests', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const requests = await response.json();
    
    content.innerHTML = `
      <h1>📬 Book Requests</h1>
      
      <div style="margin-bottom: 20px;">
        <button onclick="loadRequests()" style="padding: 8px 15px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">🔄 Refresh</button>
        <button onclick="filterRequests('pending')" style="padding: 8px 15px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">⏳ Pending</button>
        <button onclick="filterRequests('issued')" style="padding: 8px 15px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">✅ Approved</button>
        <button onclick="filterRequests('rejected')" style="padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">❌ Rejected</button>
      </div>
      
      <div class="requests-list">
        ${requests.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">Book</th>
                <th style="padding: 15px; text-align: left;">User</th>
                <th style="padding: 15px; text-align: left;">Type</th>
                <th style="padding: 15px; text-align: left;">Date</th>
                <th style="padding: 15px; text-align: left;">Status</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${requests.map(r => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${r.book?.title || 'Unknown'}</td>
                  <td style="padding: 15px;">${r.user?.name || 'Unknown'}</td>
                  <td style="padding: 15px;"><span style="padding: 4px 8px; background: #e3f2fd; border-radius: 4px; font-size: 12px;">${r.requestType || 'issue'}</span></td>
                  <td style="padding: 15px;">${new Date(r.requestDate).toLocaleDateString()}</td>
                  <td style="padding: 15px;">
                    <span style="padding: 4px 10px; background: ${r.status === 'pending' ? '#fff3cd' : (r.status === 'issued' || r.status === 'approved' ? '#d4edda' : '#f8d7da')}; color: ${r.status === 'pending' ? '#856404' : (r.status === 'issued' || r.status === 'approved' ? '#155724' : '#721c24')}; border-radius: 5px; font-weight: bold;">
                      ${r.status.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 15px; text-align: center;">
                    ${r.status === 'pending' ? `
                      <button onclick="approveRequest('${r._id}')" style="padding: 6px 12px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">✅ Allow</button>
                      <button onclick="rejectRequest('${r._id}')" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">❌ Reject</button>
                    ` : `<span style="color: #666;">-</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>✅ No requests found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('❌ Error loading requests:', error);
    content.innerHTML = `<h1>Book Requests</h1><p>❌ Error: ${error.message}</p>`;
  }
}

// ================== LOAD REPORTS ==================
function loadReports() {
  const content = document.querySelector('.content');
  
  content.innerHTML = `
    <h1>📊 Reports</h1>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
      <div onclick="generateIssuedBooksReport()" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; border: 2px solid #0f5132; transition: all 0.3s;">
        <h3>📕 Issued Books</h3>
        <p>Report of all issued books</p>
      </div>
      <div onclick="generateOverdueBooksReport()" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; border: 2px solid #dc3545; transition: all 0.3s;">
        <h3>⏰ Overdue Books</h3>
        <p>Report of overdue books</p>
      </div>
      <div onclick="generateFineCollectionReport()" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; border: 2px solid #ffc107; transition: all 0.3s;">
        <h3>💰 Fine Collection</h3>
        <p>Report of collected fines</p>
      </div>
    </div>
  `;
}

// ================== LOAD SETTINGS ==================
function loadSettings() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  content.innerHTML = `
    <h1>⚙️ Settings</h1>
    
    <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
      <h3>👤 Profile</h3>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Role:</strong> ${user.role.toUpperCase()}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 10px;">
      <h3>🔐 Security</h3>
      <button onclick="changePassword()" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Change Password</button>
      <button onclick="logout()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; margin-left: 10px;">Logout</button>
    </div>
  `;
}

// ================== NAVIGATION ==================
function handleNavigation(page) {
  const sidebarItems = document.querySelectorAll('.sidebar-menu li');
  sidebarItems.forEach(item => {
    item.classList.remove('active');
    if (item.textContent.trim() === page) {
      item.classList.add('active');
    }
  });
  
  switch(page) {
    case 'Dashboard':
      loadDashboard();
      break;
    case 'Books':
      loadBooks();
      break;
    case 'Users':
      loadUsers();
      break;
    case 'Transactions':
      loadTransactions();
      break;
    case 'Fines':
      loadFines();
      break;
    case 'Payments':
      loadPayments();
      break;
    case 'Generate QR Codes':
      window.location.href = '/barcode-generator.html';
      break;
    case 'Book Requests':
      loadRequests();
      break;
    case 'Reports':
      loadReports();
      break;
    case 'Settings':
      loadSettings();
      break;
  }
}

// ================== ACTION HANDLER ==================
function handleAction(action) {
  switch(action) {
    case 'Add Book':
      showAddBookForm();
      break;
    case 'Issue Book':
      showIssueBookForm();
      break;
    case 'Add Member':
      showAddMemberForm();
      break;
    case 'View Reports':
      loadReports();
      break;
    default:
      alert('Action: ' + action);
  }
}

// ================== ADD BOOK FORM ==================
function showAddBookForm() {
  const content = document.querySelector('.content');
  
  content.innerHTML = `
    <h1>📕 Add New Book</h1>
    
    <form id="addBookForm" style="background: white; padding: 30px; border-radius: 10px; max-width: 600px;">
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Title:</label>
        <input type="text" id="bookTitle" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Author:</label>
        <input type="text" id="bookAuthor" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category:</label>
        <select id="bookCategory" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
          <option value="Fiction">Fiction</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Science">Science</option>
          <option value="Technology">Technology</option>
          <option value="History">History</option>
          <option value="Biography">Biography</option>
          <option value="Educational">Educational</option>
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">ISBN:</label>
        <input type="text" id="bookISBN" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Quantity:</label>
        <input type="number" id="bookQuantity" required min="1" value="1" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      
      <div style="margin-top: 20px;">
        <button type="submit" style="padding: 10px 30px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">✅ Add Book</button>
        <button type="button" onclick="loadBooks()" style="padding: 10px 30px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
      </div>
    </form>
  `;
  
  document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const bookData = {
      title: document.getElementById('bookTitle').value,
      author: document.getElementById('bookAuthor').value,
      category: document.getElementById('bookCategory').value,
      isbn: document.getElementById('bookISBN').value,
      quantity: parseInt(document.getElementById('bookQuantity').value),
      available: parseInt(document.getElementById('bookQuantity').value)
    };
    
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(bookData)
      });
      
      if (response.ok) {
        alert('✅ Book added successfully!');
        loadBooks();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + (error.message || 'Failed to add book'));
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  });
}

// ================== ISSUE BOOK FORM ==================
function showIssueBookForm() {
  alert('Issue Book: Please use Book Requests section to approve student requests');
}

// ================== ADD MEMBER FORM ==================
function showAddMemberForm() {
  const content = document.querySelector('.content');
  
  content.innerHTML = `
    <h1>👤 Add New Member</h1>
    
    <form id="addMemberForm" style="background: white; padding: 30px; border-radius: 10px; max-width: 600px;">
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name:</label>
        <input type="text" id="memberName" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email:</label>
        <input type="email" id="memberEmail" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Password:</label>
        <input type="password" id="memberPassword" required minlength="6" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Role:</label>
        <select id="memberRole" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
          <option value="student">Student</option>
          <option value="librarian">Librarian</option>
        </select>
      </div>
      
      <div style="margin-top: 20px;">
        <button type="submit" style="padding: 10px 30px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">✅ Add Member</button>
        <button type="button" onclick="loadUsers()" style="padding: 10px 30px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
      </div>
    </form>
  `;
  
  document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const memberData = {
      name: document.getElementById('memberName').value,
      email: document.getElementById('memberEmail').value,
      password: document.getElementById('memberPassword').value,
      role: document.getElementById('memberRole').value
    };
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });
      
      if (response.ok) {
        alert('✅ Member added successfully!');
        loadUsers();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + (error.message || 'Failed to add member'));
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  });
}

// ================== EDIT BOOK ==================
async function editBook(bookId) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/books/${bookId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) {
      alert('❌ Failed to load book details');
      return;
    }
    
    const book = await response.json();
    const content = document.querySelector('.content');
    
    content.innerHTML = `
      <h1>📝 Edit Book</h1>
      
      <form id="editBookForm" style="background: white; padding: 30px; border-radius: 10px; max-width: 600px;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Title:</label>
          <input type="text" id="bookTitle" value="${book.title}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Author:</label>
          <input type="text" id="bookAuthor" value="${book.author}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category:</label>
          <input type="text" id="bookCategory" value="${book.category}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Quantity:</label>
          <input type="number" id="bookQuantity" value="${book.quantity}" required min="0" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>
        
        <div style="margin-top: 20px;">
          <button type="submit" style="padding: 10px 30px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">✅ Save Changes</button>
          <button type="button" onclick="loadBooks()" style="padding: 10px 30px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
        </div>
      </form>
    `;
    
    document.getElementById('editBookForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const updatedBook = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        category: document.getElementById('bookCategory').value,
        quantity: parseInt(document.getElementById('bookQuantity').value)
      };
      
      try {
        const updateResponse = await fetch(`/api/books/${bookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(updatedBook)
        });
        
        if (updateResponse.ok) {
          alert('✅ Book updated successfully!');
          loadBooks();
        } else {
          const error = await updateResponse.json();
          alert('❌ Error: ' + (error.message || 'Failed to update book'));
        }
      } catch (error) {
        alert('❌ Error: ' + error.message);
      }
    });
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== DELETE BOOK ==================
async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      alert('✅ Book deleted successfully!');
      loadBooks();
    } else {
      const error = await response.json();
      alert('❌ Error: ' + (error.message || 'Failed to delete book'));
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== SEARCH BOOKS ==================
async function searchBooks() {
  const searchTerm = document.getElementById('searchBooks')?.value || '';
  const token = localStorage.getItem('token');
  
  if (!searchTerm) {
    loadBooks();
    return;
  }
  
  try {
    const response = await fetchWithTimeout(`/api/books?search=${encodeURIComponent(searchTerm)}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) {
      alert('❌ Search failed');
      return;
    }
    
    const books = await response.json();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const booksList = document.querySelector('.books-list');
    if (booksList) {
      booksList.innerHTML = books.length > 0 ? `
        <p style="margin-bottom: 15px;">Found ${books.length} result(s)</p>
        <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
          <thead>
            <tr style="background: #0f5132; color: white;">
              <th style="padding: 15px; text-align: left;">Title</th>
              <th style="padding: 15px; text-align: left;">Author</th>
              <th style="padding: 15px; text-align: left;">Category</th>
              <th style="padding: 15px; text-align: center;">Available/Total</th>
              ${(user.role === 'admin' || user.role === 'librarian') ? '<th style="padding: 15px; text-align: center;">Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${books.map(book => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">${book.title}</td>
                <td style="padding: 15px;">${book.author}</td>
                <td style="padding: 15px;">${book.category}</td>
                <td style="padding: 15px; text-align: center;">
                  <span style="color: ${book.available > 0 ? 'green' : 'red'}; font-weight: bold;">
                    ${book.available}/${book.quantity}
                  </span>
                </td>
                ${(user.role === 'admin' || user.role === 'librarian') ? `
                  <td style="padding: 15px; text-align: center;">
                    <button onclick="editBook('${book._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
                    ${user.role === 'admin' ? `<button onclick="deleteBook('${book._id}')" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px;">Delete</button>` : ''}
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No books found matching your search.</p>';
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== VIEW USER DETAILS ==================
async function viewUserDetails(userId) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/users/${userId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) {
      alert('❌ Failed to load user details');
      return;
    }
    
    const user = await response.json();
    
    alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.isActive ? 'Active' : 'Inactive'}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}`);
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== RETURN BOOK ==================
async function returnBook(transactionId) {
  if (!confirm('Mark this book as returned?')) {
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/transactions/${transactionId}/return`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      alert('✅ Book returned successfully!');
      loadTransactions();
    } else {
      const error = await response.json();
      alert('❌ Error: ' + (error.message || 'Failed to return book'));
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== MARK FINE PAID ==================
async function markFinePaid(fineId) {
  if (!confirm('Mark this fine as paid?')) {
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/fines/${fineId}/pay`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      alert('✅ Fine marked as paid!');
      loadFines();
    } else {
      const error = await response.json();
      alert('❌ Error: ' + (error.message || 'Failed to update fine'));
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== GENERATE REPORTS ==================
async function generateIssuedBooksReport() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetchWithTimeout('/api/transactions?status=issued', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) {
      alert('❌ Failed to generate report');
      return;
    }
    
    const transactions = await response.json();
    const content = document.querySelector('.content');
    
    content.innerHTML = `
      <h1>📕 Issued Books Report</h1>
      <p>Total Issued Books: ${transactions.length}</p>
      
      <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #0f5132; color: white;">
            <th style="padding: 15px; text-align: left;">Book</th>
            <th style="padding: 15px; text-align: left;">User</th>
            <th style="padding: 15px; text-align: left;">Issue Date</th>
            <th style="padding: 15px; text-align: left;">Due Date</th>
            <th style="padding: 15px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px;">${t.book?.title || 'Unknown'}</td>
              <td style="padding: 15px;">${t.user?.name || 'Unknown'}</td>
              <td style="padding: 15px;">${new Date(t.issueDate).toLocaleDateString()}</td>
              <td style="padding: 15px;">${new Date(t.dueDate).toLocaleDateString()}</td>
              <td style="padding: 15px;">${t.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <button onclick="loadReports()" style="margin-top: 20px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">← Back to Reports</button>
    `;
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

async function generateOverdueBooksReport() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetchWithTimeout('/api/transactions?status=overdue', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) {
      alert('❌ Failed to generate report');
      return;
    }
    
    const transactions = await response.json();
    const content = document.querySelector('.content');
    
    content.innerHTML = `
      <h1>⏰ Overdue Books Report</h1>
      <p style="color: red; font-weight: bold;">Total Overdue Books: ${transactions.length}</p>
      
      <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #dc3545; color: white;">
            <th style="padding: 15px; text-align: left;">Book</th>
            <th style="padding: 15px; text-align: left;">User</th>
            <th style="padding: 15px; text-align: left;">Issue Date</th>
            <th style="padding: 15px; text-align: left;">Due Date</th>
            <th style="padding: 15px; text-align: left;">Days Overdue</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => {
            const daysOverdue = Math.floor((Date.now() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
            return `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">${t.book?.title || 'Unknown'}</td>
                <td style="padding: 15px;">${t.user?.name || 'Unknown'}</td>
                <td style="padding: 15px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                <td style="padding: 15px;">${new Date(t.dueDate).toLocaleDateString()}</td>
                <td style="padding: 15px; color: red; font-weight: bold;">${daysOverdue} days</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <button onclick="loadReports()" style="margin-top: 20px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">← Back to Reports</button>
    `;
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

async function generateFineCollectionReport() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetchWithTimeout('/api/fines', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) {
      alert('❌ Failed to generate report');
      return;
    }
    
    const fines = await response.json();
    const paidFines = fines.filter(f => f.isPaid);
    const unpaidFines = fines.filter(f => !f.isPaid);
    const totalCollected = paidFines.reduce((sum, f) => sum + f.amount, 0);
    const totalPending = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    
    const content = document.querySelector('.content');
    
    content.innerHTML = `
      <h1>💰 Fine Collection Report</h1>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
        <div style="background: #d4edda; padding: 20px; border-radius: 10px;">
          <h3>Total Collected</h3>
          <p style="font-size: 24px; font-weight: bold; color: #155724;">$${totalCollected.toFixed(2)}</p>
        </div>
        <div style="background: #fff3cd; padding: 20px; border-radius: 10px;">
          <h3>Pending Collection</h3>
          <p style="font-size: 24px; font-weight: bold; color: #856404;">$${totalPending.toFixed(2)}</p>
        </div>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px;">
          <h3>Total Fines</h3>
          <p style="font-size: 24px; font-weight: bold; color: #0d6efd;">${fines.length}</p>
        </div>
      </div>
      
      <h3>Paid Fines (${paidFines.length})</h3>
      <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #198754; color: white;">
            <th style="padding: 15px; text-align: left;">User</th>
            <th style="padding: 15px; text-align: left;">Amount</th>
            <th style="padding: 15px; text-align: left;">Reason</th>
            <th style="padding: 15px; text-align: left;">Paid Date</th>
          </tr>
        </thead>
        <tbody>
          ${paidFines.map(f => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px;">${f.userId?.name || 'Unknown'}</td>
              <td style="padding: 15px;">$${f.amount.toFixed(2)}</td>
              <td style="padding: 15px;">${f.reason || 'Overdue'}</td>
              <td style="padding: 15px;">${f.paidDate ? new Date(f.paidDate).toLocaleDateString() : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <button onclick="loadReports()" style="margin-top: 20px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">← Back to Reports</button>
    `;
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== CHANGE PASSWORD ==================
async function changePassword() {
  const currentPassword = prompt('Enter your current password:');
  if (!currentPassword) return;
  
  const newPassword = prompt('Enter new password (minimum 6 characters):');
  if (!newPassword || newPassword.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  const confirmPassword = prompt('Confirm new password:');
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/users/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (response.ok) {
      alert('✅ Password changed successfully! Please login again.');
      logout();
    } else {
      const error = await response.json();
      alert('❌ ' + (error.message || 'Failed to change password'));
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// ================== APPROVE REQUEST ==================
async function approveRequest(requestId) {
  if (!confirm('Are you sure you want to APPROVE this request and issue the book?')) {
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/requests/${requestId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.ok) {
      const data = await response.json();
      alert('✅ ' + data.message);
      loadRequests(); // Reload the list
      updateRequestBadge(); // Update badge count
    } else {
      const error = await response.json();
      alert('❌ Error: ' + (error.message || 'Failed to approve request'));
    }
  } catch (error) {
    console.error('Error approving request:', error);
    alert('❌ Error: ' + error.message);
  }
}

// ================== REJECT REQUEST ==================
async function rejectRequest(requestId) {
  const reason = prompt('Enter rejection reason (optional):');
  
  if (reason === null) {
    return; // User cancelled
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/requests/${requestId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ reason })
    });

    if (response.ok) {
      const data = await response.json();
      alert('✅ Request rejected');
      loadRequests(); // Reload the list
      updateRequestBadge(); // Update badge count
    } else {
      const error = await response.json();
      alert('❌ Error: ' + (error.message || 'Failed to reject request'));
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
    alert('❌ Error: ' + error.message);
  }
}

// ================== FILTER REQUESTS ==================
async function filterRequests(status) {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetchWithTimeout(`/api/requests?status=${status}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const requests = await response.json();
    
    // Update only the table, keep the filter buttons
    const listDiv = document.querySelector('.requests-list');
    if (listDiv) {
      listDiv.innerHTML = requests.length > 0 ? `
        <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
          <thead>
            <tr style="background: #0f5132; color: white;">
              <th style="padding: 15px; text-align: left;">Book</th>
              <th style="padding: 15px; text-align: left;">User</th>
              <th style="padding: 15px; text-align: left;">Type</th>
              <th style="padding: 15px; text-align: left;">Date</th>
              <th style="padding: 15px; text-align: left;">Status</th>
              <th style="padding: 15px; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">${r.book?.title || 'Unknown'}</td>
                <td style="padding: 15px;">${r.user?.name || 'Unknown'}</td>
                <td style="padding: 15px;"><span style="padding: 4px 8px; background: #e3f2fd; border-radius: 4px; font-size: 12px;">${r.requestType || 'issue'}</span></td>
                <td style="padding: 15px;">${new Date(r.requestDate).toLocaleDateString()}</td>
                <td style="padding: 15px;">
                  <span style="padding: 4px 10px; background: ${r.status === 'pending' ? '#fff3cd' : (r.status === 'issued' || r.status === 'approved' ? '#d4edda' : '#f8d7da')}; color: ${r.status === 'pending' ? '#856404' : (r.status === 'issued' || r.status === 'approved' ? '#155724' : '#721c24')}; border-radius: 5px; font-weight: bold;">
                    ${r.status.toUpperCase()}
                  </span>
                </td>
                <td style="padding: 15px; text-align: center;">
                  ${r.status === 'pending' ? `
                    <button onclick="approveRequest('${r._id}')" style="padding: 6px 12px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">✅ Allow</button>
                    <button onclick="rejectRequest('${r._id}')" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">❌ Reject</button>
                  ` : `<span style="color: #666;">-</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `<p>✅ No ${status} requests found.</p>`;
    }
  } catch (error) {
    console.error('Error filtering requests:', error);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// ================== INITIALIZATION ==================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Admin Dashboard DOMContentLoaded');
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    console.warn('❌ No token - redirecting to login');
    window.location.href = '/';
    return;
  }

  if (user.role !== 'admin' && user.role !== 'librarian') {
    console.warn('❌ Not admin/librarian');
    alert('Access denied. Admin only.');
    window.location.href = '/';
    return;
  }

  // Update sidebar
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  if (userName) userName.textContent = user.name || user.email;
  if (userRole) userRole.textContent = user.role.toUpperCase();

  // Setup sidebar menu
  const sidebarMenu = document.getElementById('sidebarMenu');
  if (sidebarMenu) {
    const items = sidebarMenu.querySelectorAll('li');
    items.forEach(item => {
      item.addEventListener('click', function() {
        // Get text without the badge
        const text = this.childNodes[0].textContent.trim();
        handleNavigation(text);
      });
    });
  }

  // Load dashboard
  loadDashboard();
  
  // Update badge count on page load
  updateRequestBadge();
  
  // Refresh badge every 30 seconds
  setInterval(updateRequestBadge, 30000);
  
  console.log('✅ Admin Dashboard initialized');
});

// ================== PAYMENT MANAGEMENT ==================
async function loadPayments() {
  const content = document.querySelector('.content');
  content.innerHTML = '<h1>💳 Payment Management</h1><p>Loading payments...</p>';
  
  const token = localStorage.getItem('token');
  
  try {
    if (typeof paymentHandler === 'undefined') {
      content.innerHTML = `
        <h1>💳 Payment Management</h1>
        <div style="padding: 20px; background: #fff3cd; border-radius: 8px; margin: 20px 0;">
          ⚠️ Payment system is loading... Please refresh the page.
        </div>
      `;
      return;
    }
    
    // Get all payments
    const result = await paymentHandler.getAllPayments(null, null, 1, 50);
    const payments = result.payments || [];
    
    // Get payment statistics
    const stats = await paymentHandler.getPaymentStats();
    
    content.innerHTML = `
      <h1>💳 Payment Management</h1>
      
      <div class="cards">
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">📊</div>
          <div><strong>Total Payments</strong></div>
          <div style="font-size: 24px; color: #0d6efd; font-weight: bold; margin-top: 10px;">${stats?.totalPayments || 0}</div>
        </div>
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">✅</div>
          <div><strong>Successful</strong></div>
          <div style="font-size: 24px; color: #198754; font-weight: bold; margin-top: 10px;">${stats?.successfulPayments || 0}</div>
        </div>
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">💰</div>
          <div><strong>Total Amount</strong></div>
          <div style="font-size: 24px; color: #198754; font-weight: bold; margin-top: 10px;">₹${stats?.totalAmount || 0}</div>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; margin: 20px 0;">
        <select id="statusFilter" style="padding: 8px; border-radius: 6px; border: 1px solid #ddd;">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select id="purposeFilter" style="padding: 8px; border-radius: 6px; border: 1px solid #ddd;">
          <option value="">All Purpose</option>
          <option value="fine">Fine</option>
          <option value="membership">Membership</option>
          <option value="penalty">Penalty</option>
        </select>
        <button onclick="filterPayments()" style="padding: 8px 16px; background: #0d6efd; color: white; border: none; border-radius: 6px; cursor: pointer;">Filter</button>
        <button onclick="showRecordCashPaymentForm()" style="padding: 8px 16px; background: #198754; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: auto;">💰 Record Cash Payment</button>
      </div>
      
      <h2 style="margin-top: 30px;">Recent Payments (${payments.length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px; overflow-x: auto;">
        ${payments.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Student</th>
                <th style="padding: 12px; text-align: left;">Amount</th>
                <th style="padding: 12px; text-align: left;">Purpose</th>
                <th style="padding: 12px; text-align: left;">Method</th>
                <th style="padding: 12px; text-align: center;">Status</th>
                <th style="padding: 12px; text-align: left;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(payment => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px;">${payment.userId?.name || 'N/A'}</td>
                  <td style="padding: 12px; font-weight: bold;">₹${payment.amount}</td>
                  <td style="padding: 12px;">${payment.purpose}</td>
                  <td style="padding: 12px;">${payment.paymentMethod || 'online'}</td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; ${
                      payment.status === 'success' ? 'background: #d1e7dd; color: #0f5132;' :
                      payment.status === 'pending' ? 'background: #fff3cd; color: #664d03;' :
                      'background: #f8d7da; color: #842029;'
                    }">
                      ${payment.status === 'success' ? '✅' : payment.status === 'pending' ? '⏳' : '❌'} ${payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 12px;">${new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No payments found.</p>'}
      </div>
      
      ${stats?.byPurpose?.length > 0 ? `
        <h2 style="margin-top: 30px;">Payment Breakdown by Purpose</h2>
        <div class="cards">
          ${stats.byPurpose.map(p => `
            <div class="card">
              <div><strong>${p._id.toUpperCase()}</strong></div>
              <div style="font-size: 20px; margin-top: 10px;">${p.count} payments</div>
              <div style="font-size: 18px; color: #198754; font-weight: bold;">₹${p.total}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  } catch (error) {
    console.error('Error loading payments:', error);
    content.innerHTML = `
      <h1>💳 Payment Management</h1>
      <div style="padding: 20px; background: #f8d7da; color: #842029; border-radius: 8px;">
        ❌ Error loading payments: ${error.message}
      </div>
    `;
  }
}

async function filterPayments() {
  const status = document.getElementById('statusFilter')?.value;
  const purpose = document.getElementById('purposeFilter')?.value;
  
  const content = document.querySelector('.content');
  content.innerHTML = '<h1>💳 Payment Management</h1><p>Filtering payments...</p>';
  
  try {
    const result = await paymentHandler.getAllPayments(status, purpose, 1, 50);
    loadPayments(); // Reload with filters
  } catch (error) {
    alert('Error filtering payments: ' + error.message);
  }
}

function showRecordCashPaymentForm() {
  const content = document.querySelector('.content');
  
  content.innerHTML = `
    <h1>💰 Record Cash Payment</h1>
    
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px;">
      <form id="cashPaymentForm">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Student ID:</label>
          <input type="text" id="studentId" placeholder="Enter Student ID" required
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Amount (₹):</label>
          <input type="number" id="amount" placeholder="100" min="1" required
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Purpose:</label>
          <select id="purpose" required
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
            <option value="fine">Fine</option>
            <option value="membership">Membership</option>
            <option value="penalty">Penalty</option>
            <option value="reservation">Reservation</option>
          </select>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Description (Optional):</label>
          <input type="text" id="description" placeholder="Payment description"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="flex: 1; padding: 12px; background: #198754; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            ✅ Record Payment
          </button>
          <button type="button" onclick="loadPayments()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('cashPaymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const purpose = document.getElementById('purpose').value;
    const description = document.getElementById('description').value;
    
    try {
      const result = await paymentHandler.recordCashPayment(studentId, amount, purpose, description);
      if (result) {
        alert('✅ Cash payment recorded successfully!');
        loadPayments();
      }
    } catch (error) {
      alert('❌ Error recording payment: ' + error.message);
    }
  });
}


console.log('✅ admin-dashboard.js fully loaded');

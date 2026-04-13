// ============================================
// ADMIN DASHBOARD - LIBRARY MANAGEMENT SYSTEM
// ============================================

console.log('✅ admin-dashboard.js loaded successfully!');

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
      <h1> Dashboard</h1>
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
        Add Book</button>
        Issue Book</button>
        Add Member</button>
        View Reports</button>
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
      Retry</button>
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
        + Add New Book</button>
      ` : ''}
      
      <div style="margin-bottom: 20px;">
        <input type="text" id="searchBooks" placeholder="Search books..." style="padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 5px;">
        🔍 Search</button>
      </div>

      <div class="books-list">
        ${books.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: black; color: white;">
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
                      Edit</button>
                      ${user.role === 'admin' ? `Delete</button>` : ''}
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
              <tr style="background: black; color: white;">
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
                    View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>📭 No users found.</p>'}
      </div>
    `;
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
              <tr style="background: black; color: white;">
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
                      Return</button>
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
              <tr style="background: black; color: white;">
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
                      Mark Paid</button>
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
      
      <div class="requests-list">
        ${requests.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: black; color: white;">
                <th style="padding: 15px; text-align: left;">Book</th>
                <th style="padding: 15px; text-align: left;">User</th>
                <th style="padding: 15px; text-align: left;">Date</th>
                <th style="padding: 15px; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${requests.map(r => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${r.bookId?.title || 'Unknown'}</td>
                  <td style="padding: 15px;">${r.userId?.name || 'Unknown'}</td>
                  <td style="padding: 15px;">${new Date(r.requestDate).toLocaleDateString()}</td>
                  <td style="padding: 15px;"><span style="color: ${r.status === 'pending' ? 'orange' : (r.status === 'approved' ? 'green' : 'red')};">${r.status}</span></td>
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
      Change Password</button>
      Logout</button>
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

// ================== PLACEHOLDER FUNCTIONS ==================
function handleAction(action) {
  alert('Feature: ' + action);
}

function showAddBookForm() {
  alert('Add Book Form - Coming Soon');
}

function editBook(bookId) {
  alert('Edit Book - Coming Soon');
}

function deleteBook(bookId) {
  if (confirm('Are you sure you want to delete this book?')) {
    alert('Book deleted - Coming Soon');
  }
}

function searchBooks() {
  const search = document.getElementById('searchBooks')?.value || '';
  alert('Searching for: ' + search);
}

function viewUserDetails(userId) {
  alert('User Details - Coming Soon');
}

function returnBook(transactionId) {
  alert('Return Book - Coming Soon');
}

function markFinePaid(fineId) {
  alert('Mark Fine Paid - Coming Soon');
}

function generateIssuedBooksReport() {
  alert('Generating Issued Books Report...');
}

function generateOverdueBooksReport() {
  alert('Generating Overdue Books Report...');
}

function generateFineCollectionReport() {
  alert('Generating Fine Collection Report...');
}

function changePassword() {
  alert('Change Password - Coming Soon');
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
        handleNavigation(this.textContent.trim());
      });
    });
  }

  // Load dashboard
  loadDashboard();
  
  console.log('✅ Admin Dashboard initialized');
});

console.log('✅ admin-dashboard.js fully loaded');

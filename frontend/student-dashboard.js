// Student Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    window.location.href = '/';
    return;
  }

  // Check if user is student/member
  if (user.role === 'admin' || user.role === 'librarian') {
    alert('Redirecting to admin dashboard.');
    window.location.href = '/admin-dashboard.html';
    return;
  }

  // Update user info in sidebar
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  if (userName) userName.textContent = user.name || user.email;
  if (userRole) userRole.textContent = user.role === 'student' ? 'Student' : 'Member';

  // Setup sidebar menu
  const sidebarMenu = document.getElementById('sidebarMenu');
  
  if (sidebarMenu) {
    // Add click handlers to sidebar items
    const sidebarItems = sidebarMenu.querySelectorAll('li');
    sidebarItems.forEach(item => {
      item.addEventListener('click', function() {
        sidebarItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        const page = this.textContent.trim();
        handleStudentNavigation(page);
      });
    });
  }

  // Load student dashboard
  loadStudentDashboard();
});

function handleNavigation(page) {
  const content = document.querySelector('.content');
  
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
    case 'Issued':
      loadRequests();
      break;
    case 'Reports':
      loadReports();
      break;
    case 'Settings':
      loadSettings();
      break;
    default:
      alert('Page: ' + page);
  }
}

function handleAction(action) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  switch(action) {
    case 'Add Book':
      if (user.role === 'admin' || user.role === 'librarian') {
        showAddBookForm();
      } else {
        alert('Only admins and librarians can add books');
      }
      break;
    case 'Issue Book':
      showIssueBookForm();
      break;
    case 'Add Member':
      if (user.role === 'admin' || user.role === 'librarian') {
        showAddMemberForm();
      } else {
        alert('Only admins and librarians can add members');
      }
      break;
    case 'View Reports':
      loadReports();
      break;
    default:
      alert('Action: ' + action);
  }
}

async function loadDashboard() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  try {
    const token = localStorage.getItem('token');
    
    // Only admin and librarian can see full dashboard
    if (user.role === 'admin' || user.role === 'librarian') {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        const stats = await response.json();
        
        content.innerHTML = `
          <h1>Dashboard</h1>
          <p>Welcome back, ${user.name}!</p>

          <div class="cards">
            <div class="card">Total Books<br><b>${stats.totalBooks}</b></div>
            <div class="card">Total Members<br><b>${stats.totalMembers}</b></div>
            <div class="card">Books Issued<br><b>${stats.booksIssued}</b></div>
            <div class="card">Pending Fines<br><b>$${stats.pendingFines.toFixed(2)}</b></div>
          </div>

          <div class="cards" style="margin-top: 20px;">
            <div class="card">Overdue Books<br><b>${stats.overdueBooks}</b></div>
            <div class="card">Active Members<br><b>${stats.activeMembers}</b></div>
            <div class="card">Available Books<br><b>${stats.availableBooks}</b></div>
          </div>

          <h2>Quick Actions</h2>
          <div class="actions">
            <button onclick="handleAction('Add Book')">Add Book</button>
            <button onclick="handleAction('Issue Book')">Issue Book</button>
            <button onclick="handleAction('Add Member')">Add Member</button>
            <button onclick="handleAction('View Reports')">View Reports</button>
          </div>

          <h2 style="margin-top: 30px;">Recent Transactions</h2>
          <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 10px;">
            ${stats.recentTransactions.length > 0 ? `
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
                  ${stats.recentTransactions.map(t => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 10px;">${t.book.title}</td>
                      <td style="padding: 10px;">${t.user.name}</td>
                      <td style="padding: 10px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                      <td style="padding: 10px;">${t.status}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No recent transactions</p>'}
          </div>
        `;
      }
    } else {
      // For members/students, show their transactions
      const transResponse = await fetch('/api/transactions/my', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      const finesResponse = await fetch('/api/fines/my', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      const transactions = transResponse.ok ? await transResponse.json() : [];
      const fines = finesResponse.ok ? await finesResponse.json() : [];
      
      const unpaidFines = fines.filter(f => !f.isPaid);
      const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

      content.innerHTML = `
        <h1>My Dashboard</h1>
        <p>Welcome back, ${user.name}!</p>

        <div class="cards">
          <div class="card">Books Issued<br><b>${transactions.filter(t => t.status === 'issued' || t.status === 'overdue').length}</b></div>
          <div class="card">Books Returned<br><b>${transactions.filter(t => t.status === 'returned').length}</b></div>
          <div class="card">Pending Fines<br><b>$${totalUnpaid.toFixed(2)}</b></div>
          <div class="card">Total Transactions<br><b>${transactions.length}</b></div>
        </div>

        <h2 style="margin-top: 30px;">My Issued Books</h2>
        <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 10px;">
          ${transactions.filter(t => t.status === 'issued' || t.status === 'overdue').length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                  <th style="padding: 10px; text-align: left;">Book</th>
                  <th style="padding: 10px; text-align: left;">Issue Date</th>
                  <th style="padding: 10px; text-align: left;">Due Date</th>
                  <th style="padding: 10px; text-align: left;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.filter(t => t.status === 'issued' || t.status === 'overdue').map(t => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${t.book.title} by ${t.book.author}</td>
                    <td style="padding: 10px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                    <td style="padding: 10px;">${new Date(t.dueDate).toLocaleDateString()}</td>
                    <td style="padding: 10px;"><span style="color: ${t.status === 'overdue' ? 'red' : 'green'}">${t.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No books currently issued</p>'}
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    content.innerHTML = `
      <h1>Dashboard</h1>
      <p>Welcome back, ${user.name}!</p>
      <div class="cards">
        <div class="card">Total Books<br><b>0</b></div>
        <div class="card">Total Members<br><b>0</b></div>
        <div class="card">Books Issued<br><b>0</b></div>
        <div class="card">Pending Fines<br><b>$0.00</b></div>
      </div>
    `;
  }
}

async function loadBooks() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/books', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const books = response.ok ? await response.json() : [];
    
    content.innerHTML = `
      <h1>Books Management</h1>
      ${(user.role === 'admin' || user.role === 'librarian') ? `
        <button onclick="showAddBookForm()" style="margin-bottom: 20px; padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Add New Book</button>
      ` : ''}
      
      <div style="margin-bottom: 20px;">
        <input type="text" id="searchBooks" placeholder="Search books by title, author, or ISBN..." style="padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 5px;">
        <button onclick="searchBooks()" style="padding: 10px 20px; margin-left: 10px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Search</button>
      </div>

      <div class="books-list">
        ${books.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">Title</th>
                <th style="padding: 15px; text-align: left;">Author</th>
                <th style="padding: 15px; text-align: left;">Category</th>
                <th style="padding: 15px; text-align: left;">ISBN</th>
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
                  <td style="padding: 15px;">${book.isbn || 'N/A'}</td>
                  <td style="padding: 15px; text-align: center;">
                    <span style="color: ${book.available > 0 ? 'green' : 'red'}; font-weight: bold;">
                      ${book.available}/${book.quantity}
                    </span>
                  </td>
                  ${(user.role === 'admin' || user.role === 'librarian') ? `
                    <td style="padding: 15px; text-align: center;">
                      <button onclick="editBook('${book._id}')" style="padding: 5px 10px; margin: 0 5px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
                      ${user.role === 'admin' ? `<button onclick="deleteBook('${book._id}')" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>` : ''}
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No books found. Add some books to get started!</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading books:', error);
    content.innerHTML = `
      <h1>Books Management</h1>
      <p>Error loading books. Please try again.</p>
    `;
  }
}

async function searchBooks() {
  const searchTerm = document.getElementById('searchBooks').value;
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/books?search=${searchTerm}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const books = response.ok ? await response.json() : [];
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const booksList = document.querySelector('.books-list');
    booksList.innerHTML = books.length > 0 ? `
      <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
        <thead>
          <tr style="background: #0f5132; color: white;">
            <th style="padding: 15px; text-align: left;">Title</th>
            <th style="padding: 15px; text-align: left;">Author</th>
            <th style="padding: 15px; text-align: left;">Category</th>
            <th style="padding: 15px; text-align: left;">ISBN</th>
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
              <td style="padding: 15px;">${book.isbn || 'N/A'}</td>
              <td style="padding: 15px; text-align: center;">
                <span style="color: ${book.available > 0 ? 'green' : 'red'}; font-weight: bold;">
                  ${book.available}/${book.quantity}
                </span>
              </td>
              ${(user.role === 'admin' || user.role === 'librarian') ? `
                <td style="padding: 15px; text-align: center;">
                  <button onclick="editBook('${book._id}')" style="padding: 5px 10px; margin: 0 5px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button>
                  ${user.role === 'admin' ? `<button onclick="deleteBook('${book._id}')" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>` : ''}
                </td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>No books found matching your search.</p>';
  } catch (error) {
    console.error('Error searching books:', error);
  }
}

async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.ok) {
      alert('Book deleted successfully!');
      loadBooks();
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('An error occurred while deleting the book');
  }
}

async function editBook(bookId) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/books/${bookId}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const book = response.ok ? await response.json() : null;
    
    if (!book) {
      alert('Book not found');
      return;
    }

    showAddBookForm(book);
  } catch (error) {
    console.error('Error loading book:', error);
    alert('An error occurred');
  }
}

async function loadUsers() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (user.role !== 'admin' && user.role !== 'librarian') {
    content.innerHTML = '<h1>Access Denied</h1><p>You do not have permission to view this page.</p>';
    return;
  }

  try {
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const users = response.ok ? await response.json() : [];
    
    content.innerHTML = `
      <h1>Users Management</h1>
      <button onclick="showAddMemberForm()" style="margin-bottom: 20px; padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Add New Member</button>
      <div class="users-list">
        ${users.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">Name</th>
                <th style="padding: 15px; text-align: left;">Email</th>
                <th style="padding: 15px; text-align: left;">Role</th>
                <th style="padding: 15px; text-align: left;">Phone</th>
                <th style="padding: 15px; text-align: center;">Status</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${u.name}</td>
                  <td style="padding: 15px;">${u.email}</td>
                  <td style="padding: 15px;">${u.role}</td>
                  <td style="padding: 15px;">${u.phone || 'N/A'}</td>
                  <td style="padding: 15px; text-align: center;">
                    <span style="color: ${u.isActive ? 'green' : 'red'}">
                      ${u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style="padding: 15px; text-align: center;">
                    ${user.role === 'admin' ? `
                      <button onclick="toggleUserStatus('${u._id}')" style="padding: 5px 10px; margin: 0 5px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer;">
                        ${u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    ` : ''}
                    <button onclick="viewUserDetails('${u._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No users found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading users:', error);
    content.innerHTML = '<h1>Users Management</h1><p>Error loading users. Please try again.</p>';
  }
}

async function toggleUserStatus(userId) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.ok) {
      alert('User status updated successfully!');
      loadUsers();
    } else {
      alert('Failed to update user status');
    }
  } catch (error) {
    console.error('Error toggling user status:', error);
    alert('An error occurred');
  }
}

async function viewUserDetails(userId) {
  const token = localStorage.getItem('token');
  
  try {
    const userRes = await fetch(`/api/users/${userId}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const finesRes = await fetch(`/api/fines/user/${userId}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const userDetails = userRes.ok ? await userRes.json() : null;
    const fines = finesRes.ok ? await finesRes.json() : [];

    if (!userDetails) {
      alert('User not found');
      return;
    }

    const unpaidFines = fines.filter(f => !f.isPaid);
    const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

    const content = document.querySelector('.content');
    content.innerHTML = `
      <h1>User Details</h1>
      <button onclick="loadUsers()" style="margin-bottom: 20px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Back to Users</button>
      
      <div style="background: white; padding: 30px; border-radius: 12px;">
        <h2>${userDetails.name}</h2>
        <p><strong>Email:</strong> ${userDetails.email}</p>
        <p><strong>Role:</strong> ${userDetails.role}</p>
        <p><strong>Phone:</strong> ${userDetails.phone || 'N/A'}</p>
        <p><strong>Address:</strong> ${userDetails.address || 'N/A'}</p>
        <p><strong>Status:</strong> <span style="color: ${userDetails.isActive ? 'green' : 'red'}">${userDetails.isActive ? 'Active' : 'Inactive'}</span></p>
        <p><strong>Member Since:</strong> ${new Date(userDetails.createdAt).toLocaleDateString()}</p>
        
        <h3 style="margin-top: 30px;">Pending Fines: $${totalUnpaid.toFixed(2)}</h3>
        
        ${fines.length > 0 ? `
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left;">Amount</th>
                <th style="padding: 10px; text-align: left;">Reason</th>
                <th style="padding: 10px; text-align: left;">Date</th>
                <th style="padding: 10px; text-align: left;">Status</th>
                <th style="padding: 10px; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${fines.map(f => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">$${f.amount.toFixed(2)}</td>
                  <td style="padding: 10px;">${f.reason}</td>
                  <td style="padding: 10px;">${new Date(f.createdAt).toLocaleDateString()}</td>
                  <td style="padding: 10px;">${f.isPaid ? 'Paid' : 'Unpaid'}</td>
                  <td style="padding: 10px; text-align: center;">
                    ${!f.isPaid ? `<button onclick="markFinePaid('${f._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Mark Paid</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="margin-top: 20px;">No fines recorded.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading user details:', error);
    alert('An error occurred');
  }
}

async function loadTransactions() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (user.role !== 'admin' && user.role !== 'librarian') {
    content.innerHTML = '<h1>Access Denied</h1><p>You do not have permission to view this page.</p>';
    return;
  }

  try {
    const response = await fetch('/api/transactions', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const transactions = response.ok ? await response.json() : [];
    
    content.innerHTML = `
      <h1>Transactions</h1>
      <button onclick="showIssueBookForm()" style="margin-bottom: 20px; padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Issue Book</button>
      <button onclick="loadTransactions()" style="margin-bottom: 20px; padding: 10px 20px; margin-left: 10px; background: #198754; color: white; border: none; border-radius: 8px; cursor: pointer;">All</button>
      <button onclick="filterTransactions('issued')" style="margin-bottom: 20px; padding: 10px 20px; margin-left: 10px; background: #ffc107; color: black; border: none; border-radius: 8px; cursor: pointer;">Issued</button>
      <button onclick="filterTransactions('overdue')" style="margin-bottom: 20px; padding: 10px 20px; margin-left: 10px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">Overdue</button>
      
      <div class="transactions-list">
        ${transactions.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">Book</th>
                <th style="padding: 15px; text-align: left;">User</th>
                <th style="padding: 15px; text-align: left;">Issue Date</th>
                <th style="padding: 15px; text-align: left;">Due Date</th>
                <th style="padding: 15px; text-align: left;">Status</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${t.book.title}</td>
                  <td style="padding: 15px;">${t.user.name}</td>
                  <td style="padding: 15px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                  <td style="padding: 15px;">${new Date(t.dueDate).toLocaleDateString()}</td>
                  <td style="padding: 15px;">
                    <span style="color: ${t.status === 'returned' ? 'green' : (t.status === 'overdue' ? 'red' : 'orange')}">
                      ${t.status}
                    </span>
                  </td>
                  <td style="padding: 15px; text-align: center;">
                    ${t.status !== 'returned' ? `
                      <button onclick="returnBook('${t._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Return</button>
                    ` : 'Completed'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No transactions found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading transactions:', error);
    content.innerHTML = '<h1>Transactions</h1><p>Error loading transactions. Please try again.</p>';
  }
}

async function filterTransactions(status) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/transactions?status=${status}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const transactions = response.ok ? await response.json() : [];
    
    const transactionsList = document.querySelector('.transactions-list');
    transactionsList.innerHTML = transactions.length > 0 ? `
      <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
        <thead>
          <tr style="background: #0f5132; color: white;">
            <th style="padding: 15px; text-align: left;">Book</th>
            <th style="padding: 15px; text-align: left;">User</th>
            <th style="padding: 15px; text-align: left;">Issue Date</th>
            <th style="padding: 15px; text-align: left;">Due Date</th>
            <th style="padding: 15px; text-align: left;">Status</th>
            <th style="padding: 15px; text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px;">${t.book.title}</td>
              <td style="padding: 15px;">${t.user.name}</td>
              <td style="padding: 15px;">${new Date(t.issueDate).toLocaleDateString()}</td>
              <td style="padding: 15px;">${new Date(t.dueDate).toLocaleDateString()}</td>
              <td style="padding: 15px;">
                <span style="color: ${t.status === 'returned' ? 'green' : (t.status === 'overdue' ? 'red' : 'orange')}">
                  ${t.status}
                </span>
              </td>
              <td style="padding: 15px; text-align: center;">
                ${t.status !== 'returned' ? `
                  <button onclick="returnBook('${t._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Return</button>
                ` : 'Completed'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>No transactions found with this status.</p>';
  } catch (error) {
    console.error('Error filtering transactions:', error);
  }
}

async function returnBook(transactionId) {
  if (!confirm('Mark this book as returned?')) return;

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/transactions/${transactionId}/return`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.ok) {
      const data = await response.json();
      alert('Book returned successfully!');
      loadTransactions();
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to return book');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    alert('An error occurred');
  }
}

async function loadFines() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (user.role !== 'admin' && user.role !== 'librarian') {
    content.innerHTML = '<h1>Access Denied</h1><p>You do not have permission to view this page.</p>';
    return;
  }

  try {
    const response = await fetch('/api/fines', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const statsResponse = await fetch('/api/fines/stats', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const fines = response.ok ? await response.json() : [];
    const stats = statsResponse.ok ? await statsResponse.json() : {};
    
    content.innerHTML = `
      <h1>Fines Management</h1>
      
      <div class="cards" style="margin-bottom: 30px;">
        <div class="card">Total Fines<br><b>${stats.totalFines || 0}</b></div>
        <div class="card">Paid Fines<br><b>${stats.paidFines || 0}</b></div>
        <div class="card">Unpaid Fines<br><b>${stats.unpaidFines || 0}</b></div>
        <div class="card">Total Amount<br><b>$${(stats.totalAmount || 0).toFixed(2)}</b></div>
      </div>

      <button onclick="loadFines()" style="margin-bottom: 20px; padding: 10px 20px; background: #198754; color: white; border: none; border-radius: 8px; cursor: pointer;">All</button>
      <button onclick="filterFines(false)" style="margin-bottom: 20px; padding: 10px 20px; margin-left: 10px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">Unpaid</button>
      <button onclick="filterFines(true)" style="margin-bottom: 20px; padding: 10px 20px; margin-left: 10px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Paid</button>
      
      <div class="fines-list">
        ${fines.length > 0 ? `
          <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
            <thead>
              <tr style="background: #0f5132; color: white;">
                <th style="padding: 15px; text-align: left;">User</th>
                <th style="padding: 15px; text-align: left;">Amount</th>
                <th style="padding: 15px; text-align: left;">Reason</th>
                <th style="padding: 15px; text-align: left;">Created Date</th>
                <th style="padding: 15px; text-align: left;">Status</th>
                <th style="padding: 15px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${fines.map(f => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px;">${f.user.name}</td>
                  <td style="padding: 15px;">$${f.amount.toFixed(2)}</td>
                  <td style="padding: 15px;">${f.reason}</td>
                  <td style="padding: 15px;">${new Date(f.createdAt).toLocaleDateString()}</td>
                  <td style="padding: 15px;">
                    <span style="color: ${f.isPaid ? 'green' : 'red'}">
                      ${f.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td style="padding: 15px; text-align: center;">
                    ${!f.isPaid ? `
                      <button onclick="markFinePaid('${f._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Mark Paid</button>
                    ` : 'Completed'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No fines found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading fines:', error);
    content.innerHTML = '<h1>Fines Management</h1><p>Error loading fines. Please try again.</p>';
  }
}

async function filterFines(isPaid) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/fines?isPaid=${isPaid}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const fines = response.ok ? await response.json() : [];
    
    const finesList = document.querySelector('.fines-list');
    finesList.innerHTML = fines.length > 0 ? `
      <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
        <thead>
          <tr style="background: #0f5132; color: white;">
            <th style="padding: 15px; text-align: left;">User</th>
            <th style="padding: 15px; text-align: left;">Amount</th>
            <th style="padding: 15px; text-align: left;">Reason</th>
            <th style="padding: 15px; text-align: left;">Created Date</th>
            <th style="padding: 15px; text-align: left;">Status</th>
            <th style="padding: 15px; text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${fines.map(f => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px;">${f.user.name}</td>
              <td style="padding: 15px;">$${f.amount.toFixed(2)}</td>
              <td style="padding: 15px;">${f.reason}</td>
              <td style="padding: 15px;">${new Date(f.createdAt).toLocaleDateString()}</td>
              <td style="padding: 15px;">
                <span style="color: ${f.isPaid ? 'green' : 'red'}">
                  ${f.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </td>
              <td style="padding: 15px; text-align: center;">
                ${!f.isPaid ? `
                  <button onclick="markFinePaid('${f._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Mark Paid</button>
                ` : 'Completed'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p>No fines found with this status.</p>';
  } catch (error) {
    console.error('Error filtering fines:', error);
  }
}

async function markFinePaid(fineId) {
  if (!confirm('Mark this fine as paid?')) return;

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/fines/${fineId}/pay`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.ok) {
      alert('Fine marked as paid successfully!');
      loadFines();
    } else {
      alert('Failed to update fine');
    }
  } catch (error) {
    console.error('Error marking fine as paid:', error);
    alert('An error occurred');
  }
}

function loadReports() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <h1>Reports 📊</h1>
    <div class="reports-section">
      <h3>Available Reports</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 10px 0;"><button onclick="generateIssuedBooksReport()" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; width: 250px;">📚 Issued Books Report</button></li>
        <li style="margin: 10px 0;"><button onclick="generateOverdueBooksReport()" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; width: 250px;">⚠️ Overdue Books Report</button></li>
        <li style="margin: 10px 0;"><button onclick="generateFineCollectionReport()" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; width: 250px;">💰 Fine Collection Report</button></li>
        <li style="margin: 10px 0;"><button onclick="generateMemberActivityReport()" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; width: 250px;">👥 Member Activity Report</button></li>
      </ul>
    </div>
    <div id="reportContent" style="margin-top: 30px;"></div>
  `;
}

async function generateIssuedBooksReport() {
  const token = localStorage.getItem('token');
  const reportDiv = document.getElementById('reportContent');
  
  try {
    const response = await fetch('/api/transactions?status=issued', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    const transactions = response.ok ? await response.json() : [];
    
    reportDiv.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 12px;">
        <h2>📚 Issued Books Report</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Issued:</strong> ${transactions.length}</p>
        ${transactions.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8f9fa; border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left;">Book</th>
                <th style="padding: 10px; text-align: left;">Member</th>
                <th style="padding: 10px; text-align: left;">Issue Date</th>
                <th style="padding: 10px; text-align: left;">Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${t.book?.title || 'N/A'}</td>
                  <td style="padding: 10px;">${t.user?.name || 'N/A'}</td>
                  <td style="padding: 10px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                  <td style="padding: 10px;">${new Date(t.dueDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No issued books currently.</p>'}
      </div>
    `;
  } catch (error) {
    reportDiv.innerHTML = '<p style="color: red;">Error generating report</p>';
  }
}

async function generateOverdueBooksReport() {
  const token = localStorage.getItem('token');
  const reportDiv = document.getElementById('reportContent');
  
  try {
    const response = await fetch('/api/transactions?status=overdue', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    const transactions = response.ok ? await response.json() : [];
    
    reportDiv.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #dc3545;">
        <h2>⚠️ Overdue Books Report</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Overdue:</strong> ${transactions.length}</p>
        ${transactions.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f8d7da; border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left;">Book</th>
                <th style="padding: 10px; text-align: left;">Member</th>
                <th style="padding: 10px; text-align: left;">Due Date</th>
                <th style="padding: 10px; text-align: left;">Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => {
                const daysOverdue = Math.floor((Date.now() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${t.book?.title || 'N/A'}</td>
                    <td style="padding: 10px;">${t.user?.name || 'N/A'}</td>
                    <td style="padding: 10px;">${new Date(t.dueDate).toLocaleDateString()}</td>
                    <td style="padding: 10px; color: red; font-weight: bold;">${daysOverdue} days</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<p>No overdue books. Excellent!</p>'}
      </div>
    `;
  } catch (error) {
    reportDiv.innerHTML = '<p style="color: red;">Error generating report</p>';
  }
}

async function generateFineCollectionReport() {
  const token = localStorage.getItem('token');
  const reportDiv = document.getElementById('reportContent');
  
  try {
    const response = await fetch('/api/fines', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    const fines = response.ok ? await response.json() : [];
    const totalFines = fines.reduce((sum, f) => sum + f.amount, 0);
    const paidFines = fines.filter(f => f.isPaid);
    const unpaidFines = fines.filter(f => !f.isPaid);
    const totalCollected = paidFines.reduce((sum, f) => sum + f.amount, 0);
    const totalPending = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    
    reportDiv.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #ffc107;">
        <h2>💰 Fine Collection Report</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
          <div style="padding: 15px; background: #d4edda; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #155724;">$${totalCollected.toFixed(2)}</div>
            <div>Collected</div>
          </div>
          <div style="padding: 15px; background: #fff3cd; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #856404;">$${totalPending.toFixed(2)}</div>
            <div>Pending</div>
          </div>
          <div style="padding: 15px; background: #e7f3ff; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #004085;">$${totalFines.toFixed(2)}</div>
            <div>Total Fines</div>
          </div>
        </div>
        
        ${fines.length > 0 ? `
          <h3>Recent Fines</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #fff3cd; border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left;">Member</th>
                <th style="padding: 10px; text-align: left;">Amount</th>
                <th style="padding: 10px; text-align: left;">Status</th>
                <th style="padding: 10px; text-align: left;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${fines.slice(0, 10).map(f => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${f.user?.name || 'N/A'}</td>
                  <td style="padding: 10px; font-weight: bold;">$${f.amount.toFixed(2)}</td>
                  <td style="padding: 10px;">
                    <span style="padding: 4px 8px; background: ${f.isPaid ? '#d4edda' : '#f8d7da'}; color: ${f.isPaid ? '#155724' : '#721c24'}; border-radius: 5px;">
                      ${f.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td style="padding: 10px;">${new Date(f.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No fines recorded.</p>'}
      </div>
    `;
  } catch (error) {
    reportDiv.innerHTML = '<p style="color: red;">Error generating report</p>';
  }
}

async function generateMemberActivityReport() {
  const token = localStorage.getItem('token');
  const reportDiv = document.getElementById('reportContent');
  
  try {
    const usersRes = await fetch('/api/users', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const transRes = await fetch('/api/transactions', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    const users = usersRes.ok ? await usersRes.json() : [];
    const transactions = transRes.ok ? await transRes.json() : [];
    
    const activeMembers = users.filter(u => u.isActive);
    const inactiveMembers = users.filter(u => !u.isActive);
    
    reportDiv.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 12px; border-left: 5px solid #0d6efd;">
        <h2>👥 Member Activity Report</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
          <div style="padding: 15px; background: #d4edda; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #155724;">${activeMembers.length}</div>
            <div>Active Members</div>
          </div>
          <div style="padding: 15px; background: #f8d7da; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #721c24;">${inactiveMembers.length}</div>
            <div>Inactive Members</div>
          </div>
          <div style="padding: 15px; background: #e7f3ff; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #004085;">${transactions.length}</div>
            <div>Total Transactions</div>
          </div>
        </div>
        
        <h3>Top Active Members</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #e7f3ff; border-bottom: 2px solid #ddd;">
              <th style="padding: 10px; text-align: left;">Member Name</th>
              <th style="padding: 10px; text-align: left;">Email</th>
              <th style="padding: 10px; text-align: left;">Role</th>
              <th style="padding: 10px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${activeMembers.slice(0, 10).map(u => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${u.name}</td>
                <td style="padding: 10px;">${u.email}</td>
                <td style="padding: 10px;">${u.role}</td>
                <td style="padding: 10px;">
                  <span style="padding: 4px 8px; background: #d4edda; color: #155724; border-radius: 5px;">Active</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    reportDiv.innerHTML = '<p style="color: red;">Error generating report</p>';
  }
}

function loadSettings() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <h1>System Settings</h1>
    <div class="settings-section">
      <h3>Library Configuration</h3>
      <form style="max-width: 500px;">
        <label style="display: block; margin: 15px 0;">
          Library Name:
          <input type="text" value="LibraryMS" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
        </label>
        <label style="display: block; margin: 15px 0;">
          Fine Per Day ($):
          <input type="number" value="5" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
        </label>
        <label style="display: block; margin: 15px 0;">
          Default Due Days:
          <input type="number" value="14" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
        </label>
        <label style="display: block; margin: 15px 0;">
          Max Books Per Member:
          <input type="number" value="3" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
        </label>
        <button type="button" onclick="alert('Settings saved!')" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">Save Settings</button>
      </form>
    </div>
  `;
}

function showAddBookForm(book = null) {
  const content = document.querySelector('.content');
  const isEdit = book !== null;
  
  content.innerHTML = `
    <h1>${isEdit ? 'Edit' : 'Add New'} Book</h1>
    <form id="addBookForm" style="max-width: 600px;">
      <input type="hidden" name="bookId" value="${isEdit ? book._id : ''}">
      <label style="display: block; margin: 15px 0;">
        Title:
        <input type="text" name="title" value="${isEdit ? book.title : ''}" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        ISBN:
        <input type="text" name="isbn" value="${isEdit ? (book.isbn || '') : ''}" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Author:
        <input type="text" name="author" value="${isEdit ? book.author : ''}" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Publisher:
        <input type="text" name="publisher" value="${isEdit ? (book.publisher || '') : ''}" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Category:
        <input type="text" name="category" value="${isEdit ? book.category : ''}" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Quantity:
        <input type="number" name="quantity" value="${isEdit ? book.quantity : 1}" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Published Year:
        <input type="number" name="publishedYear" value="${isEdit ? (book.publishedYear || '') : ''}" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Description:
        <textarea name="description" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px; min-height: 100px;">${isEdit ? (book.description || '') : ''}</textarea>
      </label>
      <button type="submit" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">${isEdit ? 'Update' : 'Add'} Book</button>
      <button type="button" onclick="loadBooks()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px; margin-left: 10px;">Cancel</button>
    </form>
  `;

  document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookData = Object.fromEntries(formData);
    const bookId = bookData.bookId;
    delete bookData.bookId;
    
    // Convert quantity and publishedYear to numbers
    bookData.quantity = parseInt(bookData.quantity);
    if (bookData.publishedYear) {
      bookData.publishedYear = parseInt(bookData.publishedYear);
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `/api/books/${bookId}` : '/api/books';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(bookData)
      });

      if (response.ok) {
        alert(`Book ${isEdit ? 'updated' : 'added'} successfully!`);
        loadBooks();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${isEdit ? 'update' : 'add'} book`);
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('An error occurred');
    }
  });
}

function showAddMemberForm() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <h1>Add New Member</h1>
    <form id="addMemberForm" style="max-width: 600px;">
      <label style="display: block; margin: 15px 0;">
        Name:
        <input type="text" name="name" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Email:
        <input type="email" name="email" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Password:
        <input type="password" name="password" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <label style="display: block; margin: 15px 0;">
        Role:
        <select name="role" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
          <option value="member">Member</option>
          <option value="student">Student</option>
        </select>
      </label>
      <label style="display: block; margin: 15px 0;">
        Phone:
        <input type="tel" name="phone" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <button type="submit" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">Add Member</button>
      <button type="button" onclick="loadUsers()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px; margin-left: 10px;">Cancel</button>
    </form>
  `;

  document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberData = Object.fromEntries(formData);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(memberData)
      });

      if (response.ok) {
        alert('Member added successfully!');
        loadUsers();
      } else {
        alert('Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('An error occurred');
    }
  });
}

async function showIssueBookForm() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');
  
  // Load books and users
  const booksRes = await fetch('/api/books?available=true', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const usersRes = await fetch('/api/users', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const books = booksRes.ok ? await booksRes.json() : [];
  const users = usersRes.ok ? await usersRes.json() : [];
  const memberUsers = users.filter(u => u.role === 'member' || u.role === 'student');
  
  // Calculate default due date (14 days from now)
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const dueDateString = defaultDueDate.toISOString().split('T')[0];
  
  content.innerHTML = `
    <h1>Issue Book</h1>
    <form id="issueBookForm" style="max-width: 600px;">
      <label style="display: block; margin: 15px 0;">
        Select Book:
        <select name="bookId" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
          <option value="">Choose a book...</option>
          ${books.map(b => `<option value="${b._id}">${b.title} by ${b.author} (Available: ${b.available})</option>`).join('')}
        </select>
      </label>
      <label style="display: block; margin: 15px 0;">
        Select Member:
        <select name="userId" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
          <option value="">Choose a member...</option>
          ${memberUsers.map(u => `<option value="${u._id}">${u.name} (${u.email})</option>`).join('')}
        </select>
      </label>
      <label style="display: block; margin: 15px 0;">
        Due Date:
        <input type="date" name="dueDate" value="${dueDateString}" required style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px;">
      </label>
      <button type="submit" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">Issue Book</button>
      <button type="button" onclick="loadTransactions()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px; margin-left: 10px;">Cancel</button>
    </form>
  `;

  document.getElementById('issueBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const issueData = Object.fromEntries(formData);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transactions/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(issueData)
      });

      if (response.ok) {
        alert('Book issued successfully!');
        loadTransactions();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to issue book');
      }
    } catch (error) {
      console.error('Error issuing book:', error);
      alert('An error occurred');
    }
  });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// ===================== STUDENT VIEWS =====================

async function loadStudentDashboard() {
  const content = document.querySelector('.content');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  try {
    // Fetch student data
    const transResponse = await fetch('/api/transactions/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const finesResponse = await fetch('/api/fines/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const notificationsResponse = await fetch('/api/notifications', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const transactions = transResponse.ok ? await transResponse.json() : [];
    const fines = finesResponse.ok ? await finesResponse.json() : [];
    const notifications = notificationsResponse.ok ? await notificationsResponse.json() : [];

    const issued = transactions.filter(t => t.status === 'issued' || t.status === 'overdue');
    const dueSoon = issued.filter(t => {
      const daysUntilDue = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue > 0;
    });
    const unpaidFines = fines.filter(f => !f.isPaid);
    const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <div>
          <h1>Welcome back, ${user.name}! 👋</h1>
          <p style="color: #666;">Here's your library activity overview</p>
        </div>
        <div style="text-align: right;">
          <div style="text-align: right;">
            <button onclick="handleStudentNavigation('Notifications')" style="padding: 10px 15px; background: none; border: none; font-size: 24px; cursor: pointer; position: relative;">
              🔔 
              ${unreadNotifications > 0 ? `<span style="position: absolute; top: 0; right: 0; background: red; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${unreadNotifications}</span>` : ''}
            </button>
          </div>
        </div>
      </div>

      <div class="cards">
        <div class="card" style="cursor: pointer; transition: 0.3s;" onclick="handleStudentNavigation('My Books')">
          <div style="font-size: 30px; margin-bottom: 10px;">📚</div>
          <div><strong>Books Issued</strong></div>
          <div style="font-size: 24px; color: #0f5132; font-weight: bold; margin-top: 10px;">${issued.length}</div>
        </div>
        
        <div class="card" style="cursor: pointer; transition: 0.3s;" onclick="handleStudentNavigation('My Books')">
          <div style="font-size: 30px; margin-bottom: 10px;">⏳</div>
          <div><strong>Due Soon</strong></div>
          <div style="font-size: 24px; color: #ffc107; font-weight: bold; margin-top: 10px;">${dueSoon.length}</div>
        </div>
        
        <div class="card" style="cursor: pointer; transition: 0.3s;" onclick="handleStudentNavigation('Fines & Payments')">
          <div style="font-size: 30px; margin-bottom: 10px;">💰</div>
          <div><strong>Pending Fines</strong></div>
          <div style="font-size: 24px; color: #dc3545; font-weight: bold; margin-top: 10px;">₹${totalUnpaid.toFixed(2)}</div>
        </div>
        
        <div class="card" style="cursor: pointer; transition: 0.3s;" onclick="handleStudentNavigation('History')">
          <div style="font-size: 30px; margin-bottom: 10px;">📖</div>
          <div><strong>Total Books Read</strong></div>
          <div style="font-size: 24px; color: #198754; font-weight: bold; margin-top: 10px;">${transactions.filter(t => t.status === 'returned').length}</div>
        </div>
      </div>

      <h2 style="margin-top: 40px;">📚 Currently Issued Books</h2>
      <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 15px;">
        ${issued.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd;">
                <th style="padding: 12px; text-align: left;">Book</th>
                <th style="padding: 12px; text-align: left;">Issue Date</th>
                <th style="padding: 12px; text-align: left;">Due Date</th>
                <th style="padding: 12px; text-align: left;">Status</th>
                <th style="padding: 12px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${issued.slice(0, 5).map(t => {
                const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px;">${t.book.title}</td>
                    <td style="padding: 12px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                    <td style="padding: 12px; color: ${daysLeft <= 3 ? 'red' : 'green'}; font-weight: bold;">
                      ${new Date(t.dueDate).toLocaleDateString()} (${daysLeft} days)
                    </td>
                    <td style="padding: 12px;">
                      <span style="color: ${t.status === 'overdue' ? 'red' : 'orange'}; font-weight: bold;">
                        ${t.status}
                      </span>
                    </td>
                    <td style="padding: 12px; text-align: center;">
                      <button onclick="renewBook('${t._id}')" style="padding: 5px 10px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">Renew</button>
                      <button onclick="requestReturn('${t._id}')" style="padding: 5px 10px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer;">Return</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          ${issued.length > 5 ? `<p style="margin-top: 10px; text-align: center;"><a href="#" onclick="handleStudentNavigation('My Books'); return false;" style="color: #0f5132; font-weight: bold;">View all books</a></p>` : ''}
        ` : '<p>No books currently issued. Start exploring! 📖</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading student dashboard:', error);
    content.innerHTML = `<h1>Dashboard</h1><p>Error loading dashboard. Please refresh.</p>`;
  }
}

function handleStudentNavigation(page) {
  switch(page) {
    case 'Dashboard':
      loadStudentDashboard();
      break;
    case 'Search Books':
      loadSearchBooks();
      break;
    case 'Issue':
      loadMyRequests();
      break;
    case 'My Books':
      loadMyBooks();
      break;
    case 'Scan QR Code':
      window.location.href = '/barcode-scanner.html';
      break;
    case 'Wishlist':
      loadWishlist();
      break;
    case 'Fines & Payments':
      loadStudentFines();
      break;
    case 'History':
      loadTransactionHistory();
      break;
    case 'Profile':
      loadStudentProfile();
      break;
    case 'Notifications':
      loadNotifications();
      break;
    default:
      alert('Page: ' + page);
  }
}

async function loadSearchBooks() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/books', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const books = response.ok ? await response.json() : [];
    const categories = [...new Set(books.map(b => b.category))];

    content.innerHTML = `
      <h1>Search & Browse Books 📚</h1>
      
      <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <input type="text" id="searchTitle" placeholder="Search by title..." 
            style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
          <input type="text" id="searchAuthor" placeholder="Search by author..." 
            style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
          <select id="filterCategory" style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
            <option value="">All Categories</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
        <button onclick="performSearch()" style="width: 100%; padding: 12px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Search</button>
      </div>

      <div style="margin-bottom: 15px; color: #666;">
        <strong>Showing ${books.length} books</strong>
      </div>

      <div id="booksGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
        ${books.length > 0 ? books.map(book => `
          <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: 0.3s;">
            <h3 style="margin: 0 0 5px 0; color: #0f5132;">${book.title}</h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>by</strong> ${book.author}</p>
            <p style="margin: 5px 0; color: #666; font-size: 13px;">Category: ${book.category}</p>
            <p style="margin: 10px 0; padding: 8px; background: ${book.available > 0 ? '#d4edda' : '#f8d7da'}; border-radius: 5px; text-align: center; font-weight: bold; color: ${book.available > 0 ? '#155724' : '#721c24'};">
              ${book.available > 0 ? `Available (${book.available})` : 'Not Available'}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
              ${book.available > 0 ? 
                `<button onclick="requestBook('${book._id}')" style="padding: 8px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Issue</button>` :
                `<button onclick="addToWishlist('${book._id}')" style="padding: 8px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">+ Wishlist</button>`
              }
              <button onclick="viewBookDetails('${book._id}')" style="padding: 8px; background: #0f5132; color: white; border: none; border-radius: 5px; cursor: pointer;">Details</button>
            </div>
          </div>
        `).join('') : '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No books found.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

async function performSearch() {
  const title = document.getElementById('searchTitle').value;
  const author = document.getElementById('searchAuthor').value;
  const category = document.getElementById('filterCategory').value;
  const token = localStorage.getItem('token');

  try {
    let url = '/api/books';
    const params = [];
    if (title) params.push(`search=${title}`);
    if (category) params.push(`category=${category}`);
    
    url += params.length > 0 ? '?' + params.join('&') : '';

    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const books = response.ok ? await response.json() : [];
    
    let filtered = books;
    if (author) {
      filtered = books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    }

    const grid = document.getElementById('booksGrid');
    grid.innerHTML = filtered.length > 0 ? 
      filtered.map(book => `
        <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 5px 0; color: #0f5132;">${book.title}</h3>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>by</strong> ${book.author}</p>
          <p style="margin: 5px 0; color: #666; font-size: 13px;">Category: ${book.category}</p>
          <p style="margin: 10px 0; padding: 8px; background: ${book.available > 0 ? '#d4edda' : '#f8d7da'}; border-radius: 5px; text-align: center; font-weight: bold; color: ${book.available > 0 ? '#155724' : '#721c24'};">
            ${book.available > 0 ? `Available (${book.available})` : 'Not Available'}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            ${book.available > 0 ? 
              `<button onclick="requestBook('${book._id}')" style="padding: 8px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Issue</button>` :
              `<button onclick="addToWishlist('${book._id}')" style="padding: 8px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">+ Wishlist</button>`
            }
            <button onclick="viewBookDetails('${book._id}')" style="padding: 8px; background: #0f5132; color: white; border: none; border-radius: 5px; cursor: pointer;">Details</button>
          </div>
        </div>
      `).join('')
      : '<p style="grid-column: 1/-1; text-align: center;">No books found matching your search.</p>';
  } catch (error) {
    console.error('Error searching books:', error);
  }
}

async function loadMyBooks() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/transactions/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const transactions = response.ok ? await response.json() : [];
    const issued = transactions.filter(t => t.status === 'issued' || t.status === 'overdue');
    const returned = transactions.filter(t => t.status === 'returned');

    content.innerHTML = `
      <h1>My Books 📚</h1>
      
      <h2 style="color: #0f5132; margin-top: 30px;">Currently Issued (${issued.length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${issued.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Book Title</th>
                <th style="padding: 12px; text-align: left;">Author</th>
                <th style="padding: 12px; text-align: left;">Issue Date</th>
                <th style="padding: 12px; text-align: left;">Due Date</th>
                <th style="padding: 12px; text-align: center;">Days Left</th>
                <th style="padding: 12px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${issued.map(t => {
                const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; font-weight: bold;">${t.book.title}</td>
                    <td style="padding: 12px;">${t.book.author}</td>
                    <td style="padding: 12px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                    <td style="padding: 12px; color: ${isOverdue ? 'red' : 'green'}; font-weight: bold;">${new Date(t.dueDate).toLocaleDateString()}</td>
                    <td style="padding: 12px; text-align: center; color: ${isOverdue ? 'red' : (daysLeft <= 3 ? 'orange' : 'green')}; font-weight: bold;">
                      ${isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                    </td>
                    <td style="padding: 12px; text-align: center;">
                      <button onclick="renewBook('${t._id}')" style="padding: 6px 12px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">Renew</button>
                      <button onclick="requestReturn('${t._id}')" style="padding: 6px 12px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer;">Return</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<p>No books currently issued.</p>'}
      </div>

      <h2 style="color: #0f5132; margin-top: 30px;">Reading History (${returned.length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${returned.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Book Title</th>
                <th style="padding: 12px; text-align: left;">Author</th>
                <th style="padding: 12px; text-align: left;">Returned Date</th>
              </tr>
            </thead>
            <tbody>
              ${returned.slice(0, 10).map(t => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold;">${t.book.title}</td>
                  <td style="padding: 12px;">${t.book.author}</td>
                  <td style="padding: 12px;">${new Date(t.returnDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No books returned yet.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading my books:', error);
  }
}

async function loadWishlist() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/wishlist', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    let wishlist = [];
    
    if (response.ok) {
      wishlist = await response.json();
    } else {
      console.warn('Wishlist API returned:', response.status);
      const errorData = await response.json();
      console.warn('Error:', errorData);
    }

    content.innerHTML = `
      <h1>My Wishlist ❤️</h1>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
        ${wishlist.length > 0 ? wishlist.map(item => {
          if (!item.book || !item.book._id) {
            console.warn('Invalid wishlist item:', item);
            return '';
          }
          return `
          <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 5px 0; color: #0f5132;">${item.book.title || 'Unknown'}</h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>by</strong> ${item.book.author || 'Unknown'}</p>
            <p style="margin: 5px 0; color: #666; font-size: 13px;">Category: ${item.book.category || 'Unknown'}</p>
            <p style="margin: 10px 0; padding: 8px; background: ${(item.book.available || 0) > 0 ? '#d4edda' : '#f8d7da'}; border-radius: 5px; text-align: center; font-weight: bold; color: ${(item.book.available || 0) > 0 ? '#155724' : '#721c24'};">
              ${(item.book.available || 0) > 0 ? `Available Now! (${item.book.available})` : 'Not Available'}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
              ${(item.book.available || 0) > 0 ? `<button onclick="requestBook('${item.book._id}')" style="padding: 8px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Request</button>` : ''}
              <button onclick="removeFromWishlist('${item.book._id}')" style="padding: 8px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Remove</button>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">Added: ${new Date(item.addedAt).toLocaleDateString()}</p>
          </div>
        `;
        }).join('') : `
          <div style="grid-column: 1/-1; text-align: center;">
            <p style="font-size: 16px; color: #666;">Your wishlist is empty</p>
            <button onclick="handleStudentNavigation('Search Books')" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 10px;">Explore Books</button>
          </div>
        `}
      </div>
    `;
  } catch (error) {
    console.error('Error loading wishlist:', error);
    const content = document.querySelector('.content');
    content.innerHTML = `
      <h1>My Wishlist ❤️</h1>
      <div style="background: #f8d7da; padding: 20px; border-radius: 8px; color: #721c24;">
        <p>❌ Error loading wishlist: ${error.message}</p>
      </div>
    `;
  }
}

async function loadStudentFines() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/fines/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const fines = response.ok ? await response.json() : [];
    const unpaid = fines.filter(f => !f.isPaid);
    const paid = fines.filter(f => f.isPaid);
    const totalUnpaid = unpaid.reduce((sum, f) => sum + f.amount, 0);

    content.innerHTML = `
      <h1>Fines & Payments 💸</h1>
      
      <div class="cards">
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">💰</div>
          <div><strong>Total Fines</strong></div>
          <div style="font-size: 24px; color: #dc3545; font-weight: bold; margin-top: 10px;">₹${fines.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}</div>
        </div>
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">⏳</div>
          <div><strong>Unpaid</strong></div>
          <div style="font-size: 24px; color: #ffc107; font-weight: bold; margin-top: 10px;">₹${totalUnpaid.toFixed(2)}</div>
        </div>
      </div>

      <h2 style="margin-top: 30px;">Unpaid Fines (${unpaid.length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${unpaid.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Reason</th>
                <th style="padding: 12px; text-align: left;">Amount</th>
                <th style="padding: 12px; text-align: left;">Date</th>
                <th style="padding: 12px; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${unpaid.map(f => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px;">${f.reason}</td>
                  <td style="padding: 12px; color: #dc3545; font-weight: bold;">₹${f.amount.toFixed(2)}</td>
                  <td style="padding: 12px;">${new Date(f.createdAt).toLocaleDateString()}</td>
                  <td style="padding: 12px; text-align: center;">
                    <button onclick="payFine('${f._id}')" style="padding: 6px 12px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Pay Now</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No unpaid fines. Great job! 🎉</p>'}
      </div>

      <h2 style="margin-top: 30px;">Paid Fines (${paid.length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${paid.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Reason</th>
                <th style="padding: 12px; text-align: left;">Amount</th>
                <th style="padding: 12px; text-align: left;">Paid Date</th>
              </tr>
            </thead>
            <tbody>
              ${paid.map(f => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px;">${f.reason}</td>
                  <td style="padding: 12px; color: #198754; font-weight: bold;">₹${f.amount.toFixed(2)}</td>
                  <td style="padding: 12px;">${new Date(f.paidDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No paid fines yet.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading fines:', error);
  }
}

async function payFine(fineId) {
  const token = localStorage.getItem('token');
  
  try {
    // First get the fine details
    const fineResponse = await fetch(`/api/fines/my`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    
    if (!fineResponse.ok) {
      alert('❌ Failed to fetch fine details');
      return;
    }
    
    const finesData = await fineResponse.json();
    const fine = finesData.find(f => f._id === fineId);
    
    if (!fine) {
      alert('❌ Fine not found');
      return;
    }
    
    // Use payment handler to process payment
    if (typeof paymentHandler !== 'undefined') {
      try {
        await paymentHandler.payFine(fine.amount, `Fine Payment - ${fine.reason}`);
        loadStudentFines(); // Reload after payment
      } catch (error) {
        console.error('Payment error:', error);
        alert('❌ Payment failed: ' + error.message);
      }
    } else {
      // Fallback to old method if payment handler not loaded
      if (!confirm('Payment gateway not available. Mark fine for counter payment?')) {
        return;
      }
      
      const response = await fetch(`/api/fines/${fineId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (response.ok) {
        alert('✅ Fine marked for payment! Please complete the payment at the library counter.');
        loadStudentFines();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + (error.message || 'Failed to process fine payment'));
      }
    }
  } catch (error) {
    console.error('Error paying fine:', error);
    alert('❌ Error processing payment');
  }
}

async function loadTransactionHistory() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/transactions/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const transactions = response.ok ? await response.json() : [];

    content.innerHTML = `
      <h1>Transaction History 📜</h1>
      
      <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 20px;">
        ${transactions.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Book</th>
                <th style="padding: 12px; text-align: left;">Issued</th>
                <th style="padding: 12px; text-align: left;">Due</th>
                <th style="padding: 12px; text-align: left;">Returned</th>
                <th style="padding: 12px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold;">${t.book.title}</td>
                  <td style="padding: 12px;">${new Date(t.issueDate).toLocaleDateString()}</td>
                  <td style="padding: 12px;">${new Date(t.dueDate).toLocaleDateString()}</td>
                  <td style="padding: 12px;">${t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '-'}</td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="padding: 4px 8px; background: ${t.status === 'returned' ? '#d4edda' : (t.status === 'overdue' ? '#f8d7da' : '#fff3cd')}; border-radius: 5px; font-weight: bold;">
                      ${t.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No transactions yet.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading transaction history:', error);
  }
}

async function loadStudentProfile() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  try {
    const response = await fetch('/api/users/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const userDetails = response.ok ? await response.json() : user;

    content.innerHTML = `
      <h1>My Profile 👤</h1>
      
      <div style="max-width: 600px; background: white; padding: 30px; border-radius: 12px; margin-top: 20px;">
        <form id="profileForm">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
            <input type="text" value="${userDetails.name}" disabled style="width: 100%; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; color: #999;">
            <small style="color: #999;">Read-only</small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email</label>
            <input type="email" value="${userDetails.email}" disabled style="width: 100%; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; color: #999;">
            <small style="color: #999;">Read-only</small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Phone</label>
            <input type="tel" name="phone" value="${userDetails.phone || ''}" placeholder="Add your phone number" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Address</label>
            <textarea name="address" placeholder="Add your address" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; min-height: 80px;">${userDetails.address || ''}</textarea>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Role</label>
            <input type="text" value="${userDetails.role}" disabled style="width: 100%; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; color: #999;">
            <small style="color: #999;">Read-only</small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Membership Status</label>
            <input type="text" value="${userDetails.isActive ? 'Active ✓' : 'Inactive'}" disabled style="width: 100%; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; color: ${userDetails.isActive ? '#198754' : '#dc3545'}; font-weight: bold;">
          </div>

          <button type="submit" style="width: 100%; padding: 12px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 10px;">Update Profile</button>
          <button type="button" onclick="changePassword()" style="width: 100%; padding: 12px; background: #198754; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Change Password</button>
        </form>
      </div>
    `;

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = document.querySelector('input[name="phone"]').value;
      const address = document.querySelector('textarea[name="address"]').value;

      try {
        const response = await fetch(`/api/users/${userDetails._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ phone, address })
        });

        if (response.ok) {
          alert('Profile updated successfully!');
          loadStudentProfile();
        }
      } catch (error) {
        alert('Error updating profile');
      }
    });
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

async function loadNotifications() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/notifications', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const notifications = response.ok ? await response.json() : [];

    content.innerHTML = `
      <h1>Notifications 🔔</h1>
      
      ${notifications.length > 0 ? `
        <button onclick="markAllRead()" style="margin-bottom: 20px; padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer;">Mark All as Read</button>
        <div style="display: flex; flex-direction: column; gap: 15px;">
          ${notifications.map(n => `
            <div style="background: ${n.isRead ? '#f8f9fa' : '#e7f3ff'}; padding: 20px; border-radius: 12px; border-left: 4px solid ${n.isRead ? '#ddd' : '#0f5132'};">
              <h3 style="margin: 0 0 10px 0; color: #0f5132;">${n.title}</h3>
              <p style="margin: 0 0 10px 0; color: #666;">${n.message}</p>
              <small style="color: #999;">${new Date(n.createdAt).toLocaleDateString()} ${new Date(n.createdAt).toLocaleTimeString()}</small>
              ${!n.isRead ? `<button onclick="markNotificationRead('${n._id}')" style="margin-top: 10px; padding: 6px 12px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer;">Mark as Read</button>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="text-align: center; padding: 40px;">
          <p style="font-size: 18px; color: #666;">No notifications yet</p>
        </div>
      `}
    `;
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

async function markNotificationRead(notificationId) {
  const token = localStorage.getItem('token');
  
  try {
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    loadNotifications();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

async function markAllRead() {
  const token = localStorage.getItem('token');
  
  try {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    loadNotifications();
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

async function requestBook(bookId) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/requests/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ bookId })
    });

    if (response.ok) {
      alert('Book request submitted successfully! The librarian will process it soon.');
      loadSearchBooks();
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to submit request');
    }
  } catch (error) {
    console.error('Error requesting book:', error);
    alert('Error submitting request');
  }
}

async function addToWishlist(bookId) {
  const token = localStorage.getItem('token');
  
  try {
    console.log('Adding book to wishlist:', bookId);
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ bookId })
    });

    if (response.ok) {
      console.log('Book added to wishlist successfully');
      alert('✅ Book added to your wishlist! We\'ll notify you when it becomes available.');
      loadSearchBooks();
    } else {
      const error = await response.json();
      console.warn('Failed to add to wishlist:', error);
      alert('⚠️ ' + (error.message || 'Already in wishlist'));
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    alert('❌ Error adding to wishlist: ' + error.message);
  }
}

async function viewBookDetails(bookId) {
  const token = localStorage.getItem('token');
  const content = document.querySelector('.content');
  
  try {
    const bookRes = await fetch(`/api/books/${bookId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const reviewsRes = await fetch(`/api/reviews/book/${bookId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const book = bookRes.ok ? await bookRes.json() : null;
    const reviews = reviewsRes.ok ? await reviewsRes.json() : [];

    if (!book) return;

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'No ratings yet';

    content.innerHTML = `
      <button onclick="handleStudentNavigation('Search Books')" style="margin-bottom: 20px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">← Back</button>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; background: white; padding: 30px; border-radius: 12px;">
        <div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; text-align: center;">
            <h1 style="font-size: 48px; margin: 0;">📖</h1>
          </div>
        </div>
        
        <div>
          <h1 style="margin: 0 0 10px 0; color: #0f5132;">${book.title}</h1>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 16px;">by <strong>${book.author}</strong></p>
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Published by ${book.publisher || 'Unknown'}</p>
          
          <div style="margin: 15px 0;">
            <span style="background: ${book.available > 0 ? '#d4edda' : '#f8d7da'}; padding: 8px 15px; border-radius: 5px; font-weight: bold; color: ${book.available > 0 ? '#155724' : '#721c24'};">
              ${book.available > 0 ? `Available (${book.available}/${book.quantity})` : 'Not Available'}
            </span>
          </div>

          <h3 style="margin-top: 20px;">Average Rating: ${avgRating} ⭐</h3>
          
          ${book.description ? `
            <h3>Description</h3>
            <p>${book.description}</p>
          ` : ''}

          ${book.available > 0 ? 
            `<button onclick="requestBook('${book._id}')" style="margin-top: 20px; padding: 12px 30px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%;">Request This Book</button>` :
            `<button onclick="addToWishlist('${book._id}')" style="margin-top: 20px; padding: 12px 30px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%;">Add to Wishlist</button>`
          }
        </div>
      </div>

      <h2 style="margin-top: 40px;">Reviews (${reviews.length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${reviews.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 15px;">
            ${reviews.map(r => `
              <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong>${r.user.name}</strong>
                  <span style="color: #ffc107;">${'⭐'.repeat(r.rating)}</span>
                </div>
                <p style="margin: 10px 0 0 0; color: #666;">${r.comment}</p>
                <small style="color: #999;">${new Date(r.createdAt).toLocaleDateString()}</small>
              </div>
            `).join('')}
          </div>
        ` : '<p>No reviews yet. Be the first to review!</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading book details:', error);
  }
}

async function renewBook(transactionId) {
  const token = localStorage.getItem('token');
  
  if (!confirm('Are you sure you want to renew this book?')) {
    return;
  }
  
  try {
    const response = await fetch('/api/requests/renew', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ transactionId })
    });

    if (response.ok) {
      alert('✅ Renewal request submitted successfully! The librarian will process it soon.');
      loadMyBooks();
    } else {
      const error = await response.json();
      alert('❌ ' + (error.message || 'Failed to submit renewal request'));
    }
  } catch (error) {
    console.error('Error submitting renewal:', error);
    alert('❌ Error submitting renewal request');
  }
}

async function requestReturn(transactionId) {
  const token = localStorage.getItem('token');
  
  if (!confirm('Are you sure you want to request book return? Please bring the book to the library.')) {
    return;
  }
  
  try {
    const response = await fetch('/api/requests/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ transactionId })
    });

    if (response.ok) {
      alert('✅ Return request submitted successfully! Please bring the book to the library.');
      loadMyBooks();
    } else {
      const error = await response.json();
      alert('❌ ' + (error.message || 'Failed to submit return request'));
    }
  } catch (error) {
    console.error('Error submitting return:', error);
    alert('❌ Error submitting return request');
  }
}

async function removeFromWishlist(bookId) {
  const token = localStorage.getItem('token');
  
  if (!confirm('Are you sure you want to remove this book from your wishlist?')) {
    return;
  }
  
  try {
    console.log('Removing book from wishlist:', bookId);
    const response = await fetch(`/api/wishlist/${bookId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (response.ok) {
      console.log('Book removed from wishlist successfully');
      alert('✅ Removed from wishlist');
      loadWishlist();
    } else {
      const error = await response.json();
      console.warn('Failed to remove from wishlist:', error);
      alert('❌ Error: ' + (error.message || 'Failed to remove from wishlist'));
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    alert('❌ Error removing from wishlist: ' + error.message);
  }
}

// ===================== ADMIN REQUEST MANAGEMENT =====================

async function loadRequests() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/requests', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const requests = response.ok ? await response.json() : [];
    const pending = requests.filter(r => r.status === 'pending');
    const processed = requests.filter(r => r.status !== 'pending');

    content.innerHTML = `
      <h1>Student Requests 📝</h1>
      
      <div class="cards">
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">⏳</div>
          <div><strong>Pending Requests</strong></div>
          <div style="font-size: 24px; color: #ffc107; font-weight: bold; margin-top: 10px;">${pending.length}</div>
        </div>
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">✅</div>
          <div><strong>Processed Today</strong></div>
          <div style="font-size: 24px; color: #198754; font-weight: bold; margin-top: 10px;">${processed.filter(r => {
            const today = new Date();
            const procDate = new Date(r.processedDate);
            return procDate.toDateString() === today.toDateString();
          }).length}</div>
        </div>
      </div>

      <h2 style="margin-top: 30px;">Pending Requests (${pending.length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${pending.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Student</th>
                <th style="padding: 12px; text-align: left;">Book</th>
                <th style="padding: 12px; text-align: left;">Type</th>
                <th style="padding: 12px; text-align: left;">Request Date</th>
                <th style="padding: 12px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pending.map(r => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px;">
                    <strong>${r.user.name}</strong><br>
                    <small>${r.user.email}</small><br>
                    <small>${r.user.phone || 'No phone'}</small>
                  </td>
                  <td style="padding: 12px; font-weight: bold;">${r.book.title}</td>
                  <td style="padding: 12px;">
                    <span style="padding: 4px 8px; background: ${r.requestType === 'issue' ? '#e7f3ff' : (r.requestType === 'renew' ? '#fff3cd' : '#f8d7da')}; border-radius: 5px; font-weight: bold;">
                      ${r.requestType.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 12px;">${new Date(r.requestDate).toLocaleString()}</td>
                  <td style="padding: 12px; text-align: center;">
                    <button onclick="approveRequest('${r._id}')" style="padding: 6px 12px; background: #198754; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">Approve</button>
                    <button onclick="rejectRequest('${r._id}')" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Reject</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No pending requests. Great job!</p>'}
      </div>

      <h2 style="margin-top: 30px;">Recently Processed (${processed.slice(0, 20).length})</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${processed.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Student</th>
                <th style="padding: 12px; text-align: left;">Book</th>
                <th style="padding: 12px; text-align: left;">Type</th>
                <th style="padding: 12px; text-align: left;">Status</th>
                <th style="padding: 12px; text-align: left;">Processed Date</th>
              </tr>
            </thead>
            <tbody>
              ${processed.slice(0, 20).map(r => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px;">${r.user.name}</td>
                  <td style="padding: 12px;">${r.book.title}</td>
                  <td style="padding: 12px;">${r.requestType}</td>
                  <td style="padding: 12px;">
                    <span style="color: ${r.status === 'approved' || r.status === 'issued' ? 'green' : 'red'}; font-weight: bold;">
                      ${r.status}
                    </span>
                  </td>
                  <td style="padding: 12px;">${new Date(r.processedDate).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No processed requests yet.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading requests:', error);
  }
}

async function approveRequest(requestId) {
  const token = localStorage.getItem('token');
  
  if (!confirm('Are you sure you want to approve this request?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/requests/${requestId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.ok) {
      alert('Request approved successfully!');
      loadRequests();
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to approve request');
    }
  } catch (error) {
    console.error('Error approving request:', error);
    alert('Error approving request');
  }
}

async function rejectRequest(requestId) {
  const token = localStorage.getItem('token');
  const reason = prompt('Enter reason for rejection (optional):');
  
  if (!confirm('Are you sure you want to reject this request?')) {
    return;
  }
  
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
      alert('Request rejected successfully!');
      loadRequests();
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to reject request');
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
    alert('Error rejecting request');
  }
}

// ===================== STUDENT MY REQUESTS PAGE =====================

async function loadMyRequests() {
  const content = document.querySelector('.content');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/requests/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const requests = response.ok ? await response.json() : [];
    const pending = requests.filter(r => r.status === 'pending');
    const approved = requests.filter(r => r.status === 'approved' || r.status === 'issued');
    const rejected = requests.filter(r => r.status === 'rejected');

    content.innerHTML = `
      <h1>My Requests 📝</h1>
      
      <div class="cards">
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">⏳</div>
          <div><strong>Pending</strong></div>
          <div style="font-size: 24px; color: #ffc107; font-weight: bold; margin-top: 10px;">${pending.length}</div>
        </div>
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">✅</div>
          <div><strong>Approved</strong></div>
          <div style="font-size: 24px; color: #198754; font-weight: bold; margin-top: 10px;">${approved.length}</div>
        </div>
        <div class="card">
          <div style="font-size: 30px; margin-bottom: 10px;">❌</div>
          <div><strong>Rejected</strong></div>
          <div style="font-size: 24px; color: #dc3545; font-weight: bold; margin-top: 10px;">${rejected.length}</div>
        </div>
      </div>

      <h2 style="margin-top: 30px;">All My Requests</h2>
      <div style="background: white; padding: 20px; border-radius: 12px;">
        ${requests.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                <th style="padding: 12px; text-align: left;">Book</th>
                <th style="padding: 12px; text-align: left;">Type</th>
                <th style="padding: 12px; text-align: left;">Request Date</th>
                <th style="padding: 12px; text-align: left;">Status</th>
                <th style="padding: 12px; text-align: left;">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${requests.map(r => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px; font-weight: bold;">${r.book.title}</td>
                  <td style="padding: 12px;">
                    <span style="padding: 4px 8px; background: ${r.requestType === 'issue' ? '#e7f3ff' : (r.requestType === 'renew' ? '#fff3cd' : '#f8d7da')}; border-radius: 5px;">
                      ${r.requestType}
                    </span>
                  </td>
                  <td style="padding: 12px;">${new Date(r.requestDate).toLocaleDateString()}</td>
                  <td style="padding: 12px;">
                    <span style="padding: 4px 8px; background: ${r.status === 'pending' ? '#fff3cd' : (r.status === 'approved' || r.status === 'issued' ? '#d4edda' : '#f8d7da')}; border-radius: 5px; font-weight: bold; color: ${r.status === 'pending' ? '#856404' : (r.status === 'approved' || r.status === 'issued' ? '#155724' : '#721c24')}">
                      ${r.status}
                    </span>
                  </td>
                  <td style="padding: 12px; font-size: 13px; color: #666;">
                    ${r.status === 'approved' || r.status === 'issued' ? 
                      `Processed on ${new Date(r.processedDate).toLocaleDateString()}` : 
                      (r.status === 'rejected' ? r.notes || 'Request rejected' : 'Waiting for approval')}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 40px;">
            <p style="font-size: 16px; color: #666;">You haven't made any requests yet</p>
            <button onclick="handleStudentNavigation('Search Books')" style="padding: 10px 20px; background: #0f5132; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 10px;">Browse Books</button>
          </div>
        `}
      </div>
    `;
  } catch (error) {
    console.error('Error loading requests:', error);
  }

}
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
      alert('Password changed successfully! Please login again with your new password.');
      logout();
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to change password. Please check your current password.');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Error changing password. Please try again.');
  }
}
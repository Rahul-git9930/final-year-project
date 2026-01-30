# Library Management System - Routes & Features Documentation

## 🎯 Project Overview
Complete MERN (MongoDB, Express, Vanilla JavaScript, Node.js) Library Management System with role-based access control, 12+ features, and comprehensive admin/student dashboards.

---

## 📍 Available Routes

### 🔐 Authentication Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|----------------|
| `/` | GET | Login/Signup Page | No |
| `/signup` | GET | Dedicated Signup Page | No |
| `/routes` | GET | This Documentation Page | No |

### 📊 Dashboard Routes  
| Route | Method | Purpose | Auth Required | Access |
|-------|--------|---------|----------------|--------|
| `/admin-dashboard` | GET | Admin Dashboard | Yes | Admin/Librarian Only |
| `/student-dashboard` | GET | Student Dashboard | Yes | Student/Member Only |
| `/dashboard` | GET | Legacy Dashboard | Yes | All Authenticated Users |

---

## 🔌 API Endpoints

### Authentication API
```
POST /api/auth/register
  Body: { name, email, password, phone, address, role }
  Returns: { message, userId, token }
  Auth: No

POST /api/auth/login
  Body: { email, password }
  Returns: { user, token }
  Auth: No
```

### Books API
```
GET /api/books
  Query: { search, category, author, sortBy }
  Returns: [{ title, author, isbn, category, quantity, available, coverImage }]
  Auth: Yes

POST /api/books
  Body: { title, author, isbn, category, quantity, description, coverImage }
  Returns: { message, bookId }
  Auth: Yes (Admin Only)

PUT /api/books/:id
  Body: { title, author, category, quantity, description }
  Returns: { message, book }
  Auth: Yes (Admin Only)

DELETE /api/books/:id
  Returns: { message }
  Auth: Yes (Admin Only)
```

### Transactions API
```
GET /api/transactions
  Returns: [{ book, user, issueDate, dueDate, returnDate, status, fine }]
  Auth: Yes (Admin Only)

POST /api/transactions/issue
  Body: { bookId, userId }
  Returns: { message, transactionId }
  Auth: Yes

POST /api/transactions/:id/return
  Body: { condition }
  Returns: { message, fine }
  Auth: Yes

GET /api/transactions/my
  Returns: [{ book, issueDate, dueDate, returnDate, status, daysOverdue, fine }]
  Auth: Yes

GET /api/transactions/overdue
  Returns: [{ book, user, dueDate, daysOverdue, fine }]
  Auth: Yes (Admin Only)
```

### Fines API
```
GET /api/fines
  Returns: [{ user, transaction, amount, reason, isPaid, dueDate }]
  Auth: Yes (Admin Only)

GET /api/fines/my
  Returns: [{ transaction, amount, reason, isPaid }]
  Auth: Yes

PUT /api/fines/:id/pay
  Returns: { message, fine }
  Auth: Yes

GET /api/fines/stats
  Returns: { totalFines, paidFines, pendingFines, totalCollected }
  Auth: Yes (Admin Only)
```

### Users API
```
GET /api/users
  Returns: [{ name, email, role, phone, joinDate, isActive, booksIssued }]
  Auth: Yes (Admin Only)

GET /api/users/me
  Returns: { name, email, role, phone, address, joinDate, isActive }
  Auth: Yes

PUT /api/users/:id
  Body: { name, phone, address }
  Returns: { message, user }
  Auth: Yes

POST /api/users/change-password
  Body: { currentPassword, newPassword }
  Returns: { message }
  Auth: Yes

DELETE /api/users/:id
  Returns: { message }
  Auth: Yes (Admin Only)
```

### Wishlist API
```
POST /api/wishlist
  Body: { bookId }
  Returns: { message, wishlistId }
  Auth: Yes

GET /api/wishlist
  Returns: [{ book, addedAt }]
  Auth: Yes

DELETE /api/wishlist/:bookId
  Returns: { message }
  Auth: Yes
```

### Reviews API
```
POST /api/reviews
  Body: { bookId, rating, comment }
  Returns: { message, reviewId }
  Auth: Yes

GET /api/reviews/:bookId
  Returns: [{ user, rating, comment, helpful, createdAt }]
  Auth: No

PUT /api/reviews/:id
  Body: { rating, comment }
  Returns: { message, review }
  Auth: Yes (Own Review Only)

DELETE /api/reviews/:id
  Returns: { message }
  Auth: Yes (Own Review Only)
```

### Notifications API
```
GET /api/notifications
  Returns: [{ title, message, type, relatedBook, isRead, createdAt }]
  Auth: Yes

PUT /api/notifications/:id/read
  Returns: { message, notification }
  Auth: Yes

PUT /api/notifications/read-all
  Returns: { message, updated }
  Auth: Yes
```

### Requests API
```
POST /api/requests/request-book
  Body: { bookId }
  Returns: { message, requestId }
  Auth: Yes

POST /api/requests/:id/renew
  Returns: { message, newDueDate }
  Auth: Yes

POST /api/requests/:id/return
  Returns: { message }
  Auth: Yes

GET /api/requests/pending
  Returns: [{ book, user, requestType, status, requestDate }]
  Auth: Yes (Admin Only)

GET /api/requests/my
  Returns: [{ book, status, type, requestDate, relatedTransaction }]
  Auth: Yes

PUT /api/requests/:id/approve
  Returns: { message, request }
  Auth: Yes (Admin Only)

PUT /api/requests/:id/reject
  Returns: { message }
  Auth: Yes (Admin Only)
```

### Dashboard API
```
GET /api/dashboard/stats
  Returns: { 
    totalBooks, availableBooks, issuedBooks,
    totalMembers, activeMembers,
    totalFines, pendingFines,
    overdueBooks, booksIssuedToday
  }
  Auth: Yes
```

---

## 👨‍💼 Admin Dashboard Features

### Menu Items:
1. **Dashboard** - Overview with statistics and quick actions
2. **Books** - Add, edit, delete books with search functionality
3. **Users** - Manage library members with filters
4. **Transactions** - Issue/return books, track circulation
5. **Requests** - View and approve/reject student requests
6. **Fines** - Track and manage overdue fines
7. **Reports** - Generate 4 types of reports
8. **Settings** - System configuration

### Key Functions:
- **loadDashboard()** - Display statistics and overview
- **loadBooks()** - List books with add/edit/delete options
- **loadUsers()** - Manage member accounts
- **loadTransactions()** - Issue and return books
- **loadRequests()** - Approve/reject book requests
- **loadFines()** - Track fine collections
- **loadReports()** - Generate various reports
- **loadSettings()** - Configure library settings

### Available Reports:
- 📋 Issued Books Report
- ⏰ Overdue Books Report
- 💰 Fine Collection Report
- 👥 Member Activity Report

---

## 👨‍🎓 Student Dashboard Features

### Menu Items:
1. **Dashboard** - Personal overview and quick stats
2. **Search Books** - Browse and search book catalog
3. **My Books** - View currently issued books
4. **My Requests** - Track book requests and renewals
5. **Wishlist** - Save books for future borrowing
6. **Fines & Payments** - View and pay fines
7. **Transaction History** - Complete borrowing history
8. **Profile** - Update personal info and password

### Key Functions:
- **loadStudentDashboard()** - Personal dashboard overview
- **loadSearchBooks()** - Search with filters
- **loadMyBooks()** - View issued books
- **loadWishlist()** - Manage wishlist
- **loadStudentFines()** - View personal fines
- **loadTransactionHistory()** - Borrowing records
- **loadStudentProfile()** - Update profile
- **loadMyRequests()** - Track requests

### Available Actions:
- 📚 Request Book
- 🔄 Renew Book
- 📤 Return Book
- ⭐ Add to Wishlist
- 💳 Pay Fine
- 🔐 Change Password

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (Unique),
  password: String (Hashed),
  phone: String,
  address: String,
  role: String ('admin', 'librarian', 'student', 'member'),
  joinDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model
```javascript
{
  title: String,
  author: String,
  isbn: String (Unique),
  category: String,
  description: String,
  quantity: Number,
  available: Number,
  coverImage: String,
  publishedDate: Date,
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  book: ObjectId (Reference to Book),
  user: ObjectId (Reference to User),
  issueDate: Date,
  dueDate: Date,
  returnDate: Date,
  status: String ('issued', 'returned', 'overdue'),
  condition: String,
  createdAt: Date
}
```

### Fine Model
```javascript
{
  user: ObjectId (Reference to User),
  transaction: ObjectId (Reference to Transaction),
  amount: Number,
  reason: String,
  isPaid: Boolean,
  paidDate: Date,
  createdAt: Date
}
```

### BookRequest Model
```javascript
{
  book: ObjectId (Reference to Book),
  user: ObjectId (Reference to User),
  requestType: String ('request', 'renew', 'return'),
  status: String ('pending', 'approved', 'rejected'),
  relatedTransaction: ObjectId (Reference to Transaction),
  requestDate: Date,
  responseDate: Date
}
```

### Wishlist Model
```javascript
{
  user: ObjectId (Reference to User),
  book: ObjectId (Reference to Book),
  addedAt: Date
}
```

### Review Model
```javascript
{
  book: ObjectId (Reference to Book),
  user: ObjectId (Reference to User),
  rating: Number (1-5),
  comment: String,
  helpful: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  user: ObjectId (Reference to User),
  title: String,
  message: String,
  type: String ('info', 'warning', 'success', 'error'),
  relatedBook: ObjectId (Reference to Book),
  isRead: Boolean,
  createdAt: Date
}
```

---

## 🚀 Quick Start Guide

### Admin Account Testing:
1. Navigate to: http://localhost:5000
2. Login with credentials or create admin account
3. System redirects to: http://localhost:5000/admin-dashboard
4. Access all admin features

### Student Account Testing:
1. Navigate to: http://localhost:5000/signup
2. Create account with role "Student"
3. Login with credentials
4. System redirects to: http://localhost:5000/student-dashboard
5. Access all student features

### View System Documentation:
- Navigate to: http://localhost:5000/routes
- See complete routes and features overview

---

## 🔐 Authentication & Authorization

### Authentication Method: JWT (JSON Web Tokens)
- Token stored in localStorage as `token`
- User info stored in localStorage as `user`
- Token included in Authorization header: `Bearer <token>`

### Authorization Roles:
- **Admin** - Full system access, all features
- **Librarian** - Admin features (limited user management)
- **Student** - Student features, limited access
- **Member** - Student features, limited access

### Role-Based Page Access:
- `/admin-dashboard` - Admin/Librarian only (auto-redirect)
- `/student-dashboard` - Student/Member only (auto-redirect)
- `/dashboard` - Auto-routes based on role
- `/` - Public (login/signup)

---

## 📁 File Structure

```
project/
├── server.js                      # Express server
├── public/
│   ├── index.html                 # Login/Signup
│   ├── signup.html                # Dedicated signup
│   ├── admin-dashboard.html       # Admin dashboard
│   ├── student-dashboard.html     # Student dashboard
│   ├── dashboard.html             # Legacy dashboard
│   ├── routes.html                # Routes documentation
│   ├── auth.js                    # Auth functions
│   ├── dashboard.js               # Main functions
│   ├── admin-dashboard.js         # Admin-specific code
│   ├── student-dashboard.js       # Student-specific code
│   ├── common.js                  # Shared utilities
│   ├── style.css                  # Login styling
│   └── dashboard.css              # Dashboard styling
├── routes/
│   ├── auth.js                    # Auth API routes
│   ├── books.js                   # Books API routes
│   ├── users.js                   # Users API routes
│   ├── transactions.js            # Transactions API routes
│   ├── fines.js                   # Fines API routes
│   ├── dashboard.js               # Dashboard API routes
│   ├── reviews.js                 # Reviews API routes
│   ├── wishlist.js                # Wishlist API routes
│   ├── notifications.js           # Notifications API routes
│   └── requests.js                # Requests API routes
├── models/
│   ├── User.js
│   ├── Book.js
│   ├── Transaction.js
│   ├── Fine.js
│   ├── BookRequest.js
│   ├── Wishlist.js
│   ├── Review.js
│   └── Notification.js
├── .env                           # Environment variables
└── package.json                   # Dependencies
```

---

## ✅ System Status

**Server Status:** 🟢 Running on http://localhost:5000
**Database Status:** 🟢 MongoDB Connected
**Authentication:** 🟢 JWT Active
**All Routes:** 🟢 Working
**All Features:** 🟢 Operational

---

## 🔗 Useful Links

- 🏠 Home: http://localhost:5000
- 📝 Signup: http://localhost:5000/signup
- 👨‍💼 Admin: http://localhost:5000/admin-dashboard
- 👨‍🎓 Student: http://localhost:5000/student-dashboard
- 📊 Legacy: http://localhost:5000/dashboard
- 📍 Routes Doc: http://localhost:5000/routes

---

## 📞 Support

For any issues or questions, refer to:
1. This documentation file
2. Routes page at `/routes`
3. Browser console (F12) for error messages
4. Server console for API logs


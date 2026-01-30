# Library Management System - Architecture & Flow Diagrams

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LIBRARY MANAGEMENT SYSTEM                 │
│                        (MERN Stack)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT SIDE (Frontend)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │              │  │              │  │                    │    │
│  │  Login Page  │  │  Signup Page │  │ Routes Doc Page    │    │
│  │ (index.html) │  │(signup.html) │  │(routes.html)       │    │
│  │              │  │              │  │                    │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
│         ↓                 ↓                    ↓                  │
│      Login/Signup      Signup         View Documentation         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Dashboard Pages (Role-Based)                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  ┌────────────────┐              ┌────────────────┐     │   │
│  │  │                │              │                │     │   │
│  │  │ Admin Dashboard│              │Student Dashboard     │   │
│  │  │(admin-dash.html)              │(student-dash.html)   │   │
│  │  │                │              │                │     │   │
│  │  │ 8 Sections:    │              │ 8 Sections:    │     │   │
│  │  │ - Dashboard    │              │ - Dashboard    │     │   │
│  │  │ - Books        │              │ - Search Books │     │   │
│  │  │ - Users        │              │ - My Books     │     │   │
│  │  │ - Transactions │              │ - My Requests  │     │   │
│  │  │ - Requests     │              │ - Wishlist     │     │   │
│  │  │ - Fines        │              │ - Fines        │     │   │
│  │  │ - Reports      │              │ - History      │     │   │
│  │  │ - Settings     │              │ - Profile      │     │   │
│  │  │                │              │                │     │   │
│  │  └────────────────┘              └────────────────┘     │   │
│  │                                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            JavaScript Functions & Utilities              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  auth.js          → Login/Signup handlers               │   │
│  │  dashboard.js     → All dashboard functions             │   │
│  │  admin-dash.js    → Admin-specific functions            │   │
│  │  student-dash.js  → Student-specific functions          │   │
│  │  common.js        → Shared utilities & API calls         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            CSS Files (Styling)                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  style.css        → Login page styling                  │   │
│  │  dashboard.css    → Dashboard layout & components       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
                    (HTTP/HTTPS API Calls)
                    Authorization Header
                         JWT Token
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER SIDE (Backend)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Express.js Server                        │  │
│  │              (server.js on port 5000)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │         API Routes (10 Endpoint Sets)           │    │  │
│  │  ├─────────────────────────────────────────────────┤    │  │
│  │  │  /api/auth          → 4 endpoints              │    │  │
│  │  │  /api/books         → 4 endpoints              │    │  │
│  │  │  /api/users         → 3 endpoints              │    │  │
│  │  │  /api/transactions  → 4+ endpoints             │    │  │
│  │  │  /api/fines         → 4 endpoints              │    │  │
│  │  │  /api/reviews       → 4 endpoints              │    │  │
│  │  │  /api/wishlist      → 3 endpoints              │    │  │
│  │  │  /api/notifications → 3 endpoints              │    │  │
│  │  │  /api/requests      → 6 endpoints              │    │  │
│  │  │  /api/dashboard     → 1 endpoint               │    │  │
│  │  │                                                 │    │  │
│  │  │  Total: 40+ Endpoints (All Working)            │    │  │
│  │  │                                                 │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
                    (Mongoose ODM Queries)
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MongoDB Atlas Cluster                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │  Collections (8 Total):                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ Users        │  │ Books        │  │ Transactions │   │  │
│  │  │              │  │              │  │              │   │  │
│  │  │ - id         │  │ - id         │  │ - id         │   │  │
│  │  │ - name       │  │ - title      │  │ - bookId     │   │  │
│  │  │ - email      │  │ - author     │  │ - userId     │   │  │
│  │  │ - password   │  │ - isbn       │  │ - issueDate  │   │  │
│  │  │ - role       │  │ - category   │  │ - dueDate    │   │  │
│  │  │ - phone      │  │ - quantity   │  │ - returnDate │   │  │
│  │  │ - address    │  │ - available  │  │ - status     │   │  │
│  │  │ - joinDate   │  │ - description    │ - condition  │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ Fines        │  │ BookRequests │  │ Wishlist     │   │  │
│  │  │              │  │              │  │              │   │  │
│  │  │ - id         │  │ - id         │  │ - id         │   │  │
│  │  │ - userId     │  │ - bookId     │  │ - userId     │   │  │
│  │  │ - amount     │  │ - userId     │  │ - bookId     │   │  │
│  │  │ - reason     │  │ - type       │  │ - addedAt    │   │  │
│  │  │ - isPaid     │  │ - status     │  │              │   │  │
│  │  │ - dueDate    │  │ - requestDate    │              │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐                      │  │
│  │  │ Reviews      │  │ Notifications│                      │  │
│  │  │              │  │              │                      │  │
│  │  │ - id         │  │ - id         │                      │  │
│  │  │ - bookId     │  │ - userId     │                      │  │
│  │  │ - userId     │  │ - title      │                      │  │
│  │  │ - rating     │  │ - message    │                      │  │
│  │  │ - comment    │  │ - type       │                      │  │
│  │  │ - helpful    │  │ - isRead     │                      │  │
│  │  └──────────────┘  └──────────────┘                      │  │
│  │                                                            │  │
│  │  Relationships:                                           │  │
│  │  - Transaction references User & Book                    │  │
│  │  - Fine references User & Transaction                    │  │
│  │  - BookRequest references User & Book                    │  │
│  │  - Wishlist references User & Book                       │  │
│  │  - Review references User & Book                         │  │
│  │  - Notification references User & Book                   │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

```

---

## 🔄 User Authentication & Flow

```
                    ┌──────────────────────┐
                    │   Visitor Arrives    │
                    │ at http://localhost: │
                    │      5000            │
                    └──────────┬───────────┘
                              │
                              ↓
                    ┌──────────────────────┐
                    │   Login/Signup Page  │
                    │    (index.html)      │
                    └──────────┬───────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ↓                           ↓
        ┌──────────────┐         ┌──────────────────┐
        │ Existing User?         │ New User?        │
        │ → Login Form │         │ → Signup Form    │
        │              │         │ or Signup Page   │
        └──────┬───────┘         └────────┬─────────┘
               │                          │
               ↓                          ↓
        ┌──────────────┐         ┌──────────────────┐
        │ Enter Email  │         │ Enter Details:   │
        │ Enter Passwd │         │ - Name           │
        │              │         │ - Email          │
        │ Submit       │         │ - Password       │
        └──────┬───────┘         │ - Phone          │
               │                 │ - Address        │
               │                 │ - Role           │
               │                 │ (Admin/Student)  │
               │                 │ Submit           │
               │                 └────────┬─────────┘
               │                          │
               ↓                          ↓
        ┌──────────────────────────────────────────┐
        │        API: POST /api/auth/login       │
        │        API: POST /api/auth/register    │
        │   (Validate credentials)               │
        │   (Hash password - bcrypt)             │
        │   (Generate JWT token)                 │
        └──────────┬───────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────────────────┐
        │   Store in localStorage:         │
        │   - token                        │
        │   - user (name, role, etc)       │
        └──────────┬───────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ↓                             ↓
┌──────────────┐        ┌──────────────────────┐
│ role=admin?  │        │ role=student?        │
│ or role=     │        │ or role=member?      │
│ librarian?   │        │                      │
└──────┬───────┘        └──────┬───────────────┘
       │ Yes                   │ Yes
       ↓                       ↓
┌──────────────────────┐   ┌──────────────────────┐
│ Redirect to:         │   │ Redirect to:         │
│ /admin-dashboard     │   │ /student-dashboard   │
│ (admin-dashboard.html)   │ (student-dashboard.html)
│                      │   │                      │
│ Load:                │   │ Load:                │
│ - Sidebar menu       │   │ - Sidebar menu       │
│ - Admin functions    │   │ - Student functions  │
│ - Admin sections     │   │ - Student sections   │
│ - Admin data         │   │ - Student data       │
└──────────────────────┘   └──────────────────────┘
```

---

## 📊 Admin Dashboard Workflow

```
                    ┌────────────────────────┐
                    │ Admin Dashboard Page   │
                    │ (admin-dashboard.html) │
                    └───────────┬────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ↓                     ↓
            ┌──────────────┐      ┌──────────────────┐
            │ Role Check   │      │ Load Dashboard   │
            │              │      │ Statistics:      │
            │ Is user      │      │ - Total Books    │
            │ admin or     │      │ - Total Members  │
            │ librarian?   │      │ - Issued Books   │
            └──────┬───────┘      │ - Pending Fines  │
                   │               │ - Overdue Books  │
                No │ (Redirect)    └──────────────────┘
                   │
                   ↓
    ┌──────────────────────────────────┐
    │ Redirect to Student Dashboard    │
    └──────────────────────────────────┘


                    ┌────────────────────────┐
                    │ Sidebar Menu (8 Items) │
                    └───────────┬────────────┘
         ┌──────────┬──────────┬──────────┬──────────┐
         │          │          │          │          │
         ↓          ↓          ↓          ↓          ↓
    ┌────────┐  ┌─────┐  ┌──────┐  ┌────────┐  ┌────────┐
    │Dashboard   │Books  │Users   │Transact│Requests
    └────────┘  └─────┘  └──────┘  └────────┘  └────────┘
         │          │          │          │          │
         ↓          ↓          ↓          ↓          ↓
         │          │          │          │          │
         │      ┌────────┬────────┬────────┐          │
         │      │        │        │        │          │
         │      ↓        ↓        ↓        ↓          ↓
         │   ┌─────┐  ┌──────┐  ┌────┐  ┌────────┐┌──────┐
         │   │Fines    Reports Settings              │
         │   └─────┘  └──────┘  └────┘  └────────┘└──────┘
         │      │        │        │          │          │
         │      └────────┴────────┴──────────┴──────────┘
         │
         └─────────────────────────────────────────────


                    ┌────────────────────────┐
                    │ Available Functions    │
                    ├────────────────────────┤
                    │                        │
                    │ Dashboard:             │
                    │ - View Statistics      │
                    │ - Quick Actions        │
                    │                        │
                    │ Books:                 │
                    │ - List Books           │
                    │ - Search/Filter        │
                    │ - Add Book             │
                    │ - Edit Book            │
                    │ - Delete Book          │
                    │                        │
                    │ Users:                 │
                    │ - List Members         │
                    │ - View Details         │
                    │ - Activate/Deactivate  │
                    │                        │
                    │ Transactions:          │
                    │ - Issue Book           │
                    │ - Return Book          │
                    │ - View History         │
                    │ - Track Overdue        │
                    │                        │
                    │ Requests:              │
                    │ - View Requests        │
                    │ - Approve Request      │
                    │ - Reject Request       │
                    │                        │
                    │ Fines:                 │
                    │ - View Fines           │
                    │ - Mark as Paid         │
                    │                        │
                    │ Reports:               │
                    │ - Issued Books         │
                    │ - Overdue Books        │
                    │ - Fine Collection      │
                    │ - Member Activity      │
                    │                        │
                    │ Settings:              │
                    │ - System Config        │
                    │ - Preferences          │
                    │                        │
                    └────────────────────────┘
```

---

## 👨‍🎓 Student Dashboard Workflow

```
                    ┌────────────────────────┐
                    │ Student Dashboard Page │
                    │(student-dashboard.html)│
                    └───────────┬────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ↓                     ↓
            ┌──────────────┐      ┌──────────────────┐
            │ Role Check   │      │ Load Dashboard   │
            │              │      │ Quick Info:      │
            │ Is user      │      │ - My Books Count │
            │ student or   │      │ - My Fines Count │
            │ member?      │      │ - Notifications  │
            └──────┬───────┘      └──────────────────┘
                   │
                No │ (Redirect)
                   │
                   ↓
    ┌──────────────────────────────────┐
    │ Redirect to Admin Dashboard      │
    └──────────────────────────────────┘


                    ┌────────────────────────┐
                    │ Sidebar Menu (8 Items) │
                    └───────────┬────────────┘
         ┌──────────┬──────────┬──────────┬──────────┐
         │          │          │          │          │
         ↓          ↓          ↓          ↓          ↓
    ┌────────┐  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │Dashboard│ │Search    │ │My Books│ │My      │ │Wishlist│
    │         │ │Books     │ │        │ │Requests       │
    └────────┘  └──────────┘ └────────┘ └────────┘ └────────┘
         │          │          │          │          │
         ↓          ↓          ↓          ↓          ↓
         │          │          │          │          │
         │      ┌────────┬────────┬────────┐          │
         │      │        │        │        │          │
         │      ↓        ↓        ↓        ↓          ↓
         │   ┌──────────────┐  ┌────────┐┌──────────┐
         │   │Fines &       │  │History │Profile
         │   │Payments      │  │        │
         │   └──────────────┘  └────────┘└──────────┘
         │
         └─────────────────────────────────────────────


                    ┌────────────────────────┐
                    │ Available Functions    │
                    ├────────────────────────┤
                    │                        │
                    │ Dashboard:             │
                    │ - View Statistics      │
                    │ - My Issued Books      │
                    │ - My Fines             │
                    │ - Notifications        │
                    │                        │
                    │ Search Books:          │
                    │ - Search by Title      │
                    │ - Search by Author     │
                    │ - Filter by Category   │
                    │ - Add to Wishlist      │
                    │ - Request Book         │
                    │                        │
                    │ My Books:              │
                    │ - View Issued Books    │
                    │ - See Due Dates        │
                    │ - Request Renewal      │
                    │ - Request Return       │
                    │                        │
                    │ My Requests:           │
                    │ - View Request Status  │
                    │ - Pending Requests     │
                    │ - Approved Requests    │
                    │                        │
                    │ Wishlist:              │
                    │ - View Wishlist        │
                    │ - Remove Items         │
                    │                        │
                    │ Fines & Payments:      │
                    │ - View My Fines        │
                    │ - Mark as Paid         │
                    │                        │
                    │ History:               │
                    │ - Past Transactions    │
                    │ - Return Dates         │
                    │ - Book Conditions      │
                    │                        │
                    │ Profile:               │
                    │ - View My Info         │
                    │ - Update Details       │
                    │ - Change Password      │
                    │                        │
                    └────────────────────────┘
```

---

## 💾 Data Flow Example: Issue Book

```
┌─────────────────────┐
│  Admin Dashboard    │
│  Transactions Page  │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │ Click "Issue │
    │ Book" Button │
    └──────┬───────┘
           │
           ↓
    ┌─────────────────────────┐
    │ Show Form:              │
    │ - Select Student        │
    │ - Select Book           │
    │ - Set Due Date          │
    │ - Click Submit          │
    └──────┬──────────────────┘
           │
           ↓
    ┌──────────────────────┐
    │  Frontend Validation │
    │  (Check all fields)  │
    └──────┬───────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │ API Call:                │
    │ POST /api/transactions/  │
    │ issue                    │
    │ Body: {                  │
    │  bookId: "...",          │
    │  userId: "...",          │
    │  dueDate: "2024-01-15"   │
    │ }                        │
    │ Header: {                │
    │  Authorization: Bearer   │
    │  ...token...             │
    │ }                        │
    └──────┬──────────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │  Backend API Handler     │
    │  (routes/transactions.js)│
    │ 1. Validate Request      │
    │ 2. Check Auth Token      │
    │ 3. Verify User Role      │
    │ 4. Verify Book Available │
    │ 5. Verify User Exists    │
    └──────┬──────────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │  Database Operations:    │
    │                          │
    │  1. Create Transaction   │
    │  INSERT into            │
    │  transactions:          │
    │  {                       │
    │   book: bookId,          │
    │   user: userId,          │
    │   issueDate: now,        │
    │   dueDate: setDate,      │
    │   status: "issued"       │
    │  }                       │
    │                          │
    │  2. Update Book          │
    │  UPDATE books:           │
    │  available = available-1 │
    │                          │
    │  3. Create Notification  │
    │  INSERT into             │
    │  notifications:          │
    │  {                       │
    │   user: userId,          │
    │   title: "Book Issued",  │
    │   message: "...",        │
    │   type: "success"        │
    │  }                       │
    │                          │
    └──────┬──────────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │  API Response:           │
    │  {                       │
    │   message: "Book issued",│
    │   transaction: {         │
    │    id: "...",            │
    │    status: "issued",     │
    │    dueDate: "2024-01-15" │
    │   }                      │
    │  }                       │
    │  Status: 200 OK          │
    └──────┬──────────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │  Frontend Update:        │
    │ 1. Display Success Msg   │
    │ 2. Update Transactions   │
    │    List with new entry   │
    │ 3. Close Form Modal      │
    │ 4. Refresh Book Count    │
    │                          │
    └──────┬──────────────────┘
           │
           ↓
    ┌────────────────────────────┐
    │  Student Receives:         │
    │ 1. Notification in inbox   │
    │ 2. Book appears in My Books│
    │ 3. Due date countdown      │
    │    visible                 │
    │                            │
    └────────────────────────────┘
```

---

## 🔐 JWT Authentication Flow

```
┌──────────────────┐
│   User Logs In   │
│ (Email/Password) │
└────────┬─────────┘
         │
         ↓
┌─────────────────────────┐
│ POST /api/auth/login    │
│ Body: {                 │
│  email: "user@...",     │
│  password: "pwd"        │
│ }                       │
└────────┬────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Backend Verification:    │
│ 1. Find user by email   │
│ 2. Compare passwords    │
│    (bcryptjs)           │
│ 3. If valid: continue   │
│    If invalid: error    │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Generate JWT Token:      │
│ jwt.sign({               │
│  userId: user._id,       │
│  email: user.email,      │
│  role: user.role         │
│ }, SECRET_KEY,           │
│ {expiresIn: "24h"})      │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ API Response:            │
│ {                        │
│  user: {                 │
│   id: "...",             │
│   name: "...",           │
│   role: "admin"          │
│  },                      │
│  token: "eyJhbGc..."     │
│ }                        │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Frontend Stores Token:   │
│ localStorage.setItem(    │
│  'token',                │
│  'eyJhbGc...'            │
│ );                       │
│ localStorage.setItem(    │
│  'user',                 │
│  JSON.stringify(...)     │
│ );                       │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Subsequent API Calls:    │
│ Headers: {               │
│  'Authorization':        │
│  'Bearer eyJhbGc...'     │
│ }                        │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Backend Middleware:      │
│ 1. Extract token from    │
│    Authorization header  │
│ 2. Verify signature      │
│ 3. Decode payload        │
│ 4. Check expiration      │
│ 5. Attach user to req    │
│ 6. If valid: proceed     │
│    If invalid: 401 error │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ API Endpoint Executes:   │
│ (Now req.user available) │
│                          │
└──────────────────────────┘
```

---

This provides a comprehensive visual understanding of the system architecture and data flows!


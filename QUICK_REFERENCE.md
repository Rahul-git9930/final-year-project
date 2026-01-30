# Quick Reference Guide

## 🎯 Access Points

### Public URLs
- **Login/Signup Home:** http://localhost:5000
- **Alternate Signup:** http://localhost:5000/signup
- **Routes & Features:** http://localhost:5000/routes

### Protected URLs (Login Required)
- **Admin Dashboard:** http://localhost:5000/admin-dashboard (Admin/Librarian only)
- **Student Dashboard:** http://localhost:5000/student-dashboard (Student/Member only)
- **Legacy Dashboard:** http://localhost:5000/dashboard (All authenticated users)

---

## 🔐 Testing Credentials

### Create Test Accounts:
1. Go to http://localhost:5000
2. Click "Don't have an account? Sign up"
3. Fill form with:
   - **Admin Test:** Name: "Admin", Email: "admin@test.com", Password: "Admin123!", Role: "Admin"
   - **Student Test:** Name: "John", Email: "john@test.com", Password: "Student123!", Role: "Student"

### Or Use Signup Page:
- Direct URL: http://localhost:5000/signup
- Fill form and create account

---

## 📋 Admin Features Checklist

### Dashboard
- [ ] View statistics (total books, members, fines)
- [ ] See quick action buttons
- [ ] View system status

### Books Management
- [ ] Search books by title/author
- [ ] Add new book
- [ ] Edit book details
- [ ] Delete book
- [ ] View availability

### Users Management
- [ ] List all members
- [ ] Search by name/email
- [ ] View member details
- [ ] Activate/deactivate accounts
- [ ] Filter by role

### Transactions
- [ ] Issue book to member
- [ ] Return book from member
- [ ] View transaction history
- [ ] Filter by status
- [ ] Track overdue books

### Requests
- [ ] View pending requests
- [ ] Approve book request
- [ ] Reject book request
- [ ] View request history

### Fines
- [ ] View all fines
- [ ] Mark fine as paid
- [ ] Generate fine statistics
- [ ] View collection reports

### Reports
- [ ] Generate issued books report
- [ ] Generate overdue books report
- [ ] Generate fine collection report
- [ ] Generate member activity report
- [ ] Export reports

### Settings
- [ ] View system configuration
- [ ] Update library settings
- [ ] Manage system preferences

---

## 📋 Student Features Checklist

### Dashboard
- [ ] View issued books count
- [ ] View pending fines
- [ ] Check notifications
- [ ] Quick action buttons

### Search Books
- [ ] Search by title
- [ ] Search by author
- [ ] Filter by category
- [ ] View book details
- [ ] Add to wishlist

### My Books
- [ ] View currently issued books
- [ ] See due dates
- [ ] Request book renewal
- [ ] Request book return

### My Requests
- [ ] View pending requests
- [ ] View approved requests
- [ ] View rejected requests
- [ ] Request new book
- [ ] Renew book
- [ ] Return book

### Wishlist
- [ ] View wishlist items
- [ ] Remove from wishlist
- [ ] Search wishlist

### Fines & Payments
- [ ] View pending fines
- [ ] View fine details
- [ ] Mark fine as paid
- [ ] View payment history

### Transaction History
- [ ] View all past transactions
- [ ] See issue/return dates
- [ ] Filter by status
- [ ] View book conditions

### Profile
- [ ] View personal information
- [ ] Update phone number
- [ ] Update address
- [ ] Change password
- [ ] View account details

---

## 🔌 API Testing with Examples

### Login Example:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

### Response:
```json
{
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@test.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Books (Authenticated):
```bash
curl -X GET http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Books:
```bash
curl -X GET "http://localhost:5000/api/books?search=harry&category=fiction" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Issue Book (Admin):
```bash
curl -X POST http://localhost:5000/api/transactions/issue \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"bookId":"...", "userId":"..."}'
```

---

## 🎯 Common Workflows

### Workflow 1: Admin Issues Book to Student
1. Go to Admin Dashboard → Transactions
2. Click "Issue Book"
3. Select student and book
4. Click "Issue"
5. Book status changes to "Issued"

### Workflow 2: Student Returns Book
1. Go to Student Dashboard → My Books
2. Click "Request Return"
3. Select book condition
4. Submit
5. Admin approves in Requests section

### Workflow 3: Student Pays Fine
1. Go to Student Dashboard → Fines & Payments
2. View pending fines
3. Click "Pay Fine"
4. Mark as paid
5. Fine status updates

### Workflow 4: Admin Generates Report
1. Go to Admin Dashboard → Reports
2. Select report type
3. Set date range (if applicable)
4. Click "Generate Report"
5. View/download report

### Workflow 5: Student Requests Book
1. Go to Student Dashboard → Search Books
2. Find book
3. Click "Request Book"
4. Admin views in Requests section
5. Admin approves
6. Student gets notification

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"
**Solution:** 
- Check if server is running: `npm start`
- Verify MongoDB is connected
- Check if port 5000 is available

### Issue: "Login fails with error"
**Solution:**
- Verify email and password are correct
- Check if user account exists
- Clear browser cache/cookies
- Try creating new account

### Issue: "Unauthorized access to Admin Dashboard"
**Solution:**
- Login with admin/librarian account
- Check user role in database
- Clear localStorage and login again

### Issue: "API requests return 401 Unauthorized"
**Solution:**
- Verify token is in localStorage
- Token might be expired, try logging in again
- Check Authorization header format
- Clear browser console and retry

### Issue: "Buttons not working"
**Solution:**
- Refresh the page
- Check browser console for errors
- Verify all required libraries are loaded
- Check MongoDB connection

### Issue: "CSS not loading properly"
**Solution:**
- Hard refresh (Ctrl+F5)
- Check if dashboard.css file exists
- Verify CSS file path is correct
- Check browser developer tools (F12) for 404 errors

---

## 📊 Testing Scenarios

### Scenario 1: Complete Admin Flow
1. Create admin account
2. Login as admin
3. Add books to library
4. Create student account
5. Issue book to student
6. Track transaction
7. Generate report

### Scenario 2: Complete Student Flow
1. Create student account
2. Login as student
3. Search for books
4. Request book
5. Admin approves
6. View issued books
7. Request renewal
8. Return book

### Scenario 3: Fine Management Flow
1. Issue book to student (with due date)
2. Let due date pass
3. System auto-generates fine
4. Student views fine
5. Student marks as paid
6. Admin confirms payment

### Scenario 4: Search & Wishlist Flow
1. Student searches for books
2. Add unavailable book to wishlist
3. Admin adds book later
4. System notifies student
5. Student requests book
6. Admin issues book

---

## 🔑 Important Notes

### Authentication:
- JWT tokens expire after set period
- Token stored in localStorage
- Each API request needs Authorization header
- Only one active session per user

### Database:
- MongoDB must be running
- Connection string in .env file
- Collections auto-create on first use

### Browser Console:
- Press F12 to open developer tools
- Check "Console" tab for JavaScript errors
- Check "Network" tab for API failures

### Server Console:
- Shows all API requests
- Shows database operations
- Shows error messages
- Useful for debugging

---

## 📝 Default Pagination

- Books per page: 10
- Users per page: 10
- Transactions per page: 10
- Search results: 10

---

## ⏱️ Important Timings

- Session timeout: 24 hours (configurable)
- Fine calculation: Per day
- Overdue threshold: After due date
- Notification delay: Real-time

---

## 🎓 Learning Resources

### For Frontend Development:
- Check `public/` folder for HTML/CSS/JS
- Study `dashboard.js` for business logic
- Review `auth.js` for authentication flow

### For Backend Development:
- Check `routes/` folder for API endpoints
- Review `models/` folder for data structure
- Study `server.js` for app configuration

### For Database:
- Check MongoDB Atlas dashboard
- Review model schema definitions
- Monitor collection sizes

---

## 🚀 Next Steps

1. **Test the application** using Quick Reference URLs
2. **Create test accounts** with different roles
3. **Verify all features** using Feature Checklists
4. **Test API endpoints** using API Testing examples
5. **Run common workflows** to understand system flow
6. **Check troubleshooting** if issues occur

---

## 📞 Support

- View routes: http://localhost:5000/routes
- Check documentation: ROUTES_AND_FEATURES.md
- Browser console: F12
- Server console: Terminal window

**System Status:** ✅ All systems operational and ready for testing!


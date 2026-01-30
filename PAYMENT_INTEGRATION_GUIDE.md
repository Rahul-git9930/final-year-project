# Payment Gateway Implementation - Integration Guide

## Quick Start

### 1️⃣ Install Razorpay Package
```bash
npm install razorpay
```

### 2️⃣ Set Up Environment Variables

Add these to your `.env` file:
```
RAZORPAY_KEY_ID=your_key_id_from_razorpay
RAZORPAY_KEY_SECRET=your_key_secret_from_razorpay
```

Get your keys from: https://dashboard.razorpay.com/

### 3️⃣ Add Payment Script to HTML

Include the payment handler in your dashboard HTML files:

**In `student-dashboard.html`:**
```html
<script src="/payment-handler.js"></script>
```

**In `admin-dashboard.html`:**
```html
<script src="/payment-handler.js"></script>
```

---

## Integration Examples

### Student Dashboard - Pay Fine Button

```html
<div class="payment-section">
  <h3>💳 Pending Fines</h3>
  
  <!-- Display fines -->
  <div id="fines-list">
    <!-- Dynamically populated -->
  </div>
  
  <!-- Pay Fine Button -->
  <button class="btn btn-danger" onclick="payFineAction(100, 'Late Fine Payment')">
    💳 Pay Fine (₹100)
  </button>
</div>

<script>
  function payFineAction(amount, description) {
    paymentHandler.payFine(amount, description);
  }
</script>
```

### Student Dashboard - Pay Membership Button

```html
<div class="membership-section">
  <h3>📚 Membership</h3>
  <p>Annual Membership Fee: ₹500</p>
  
  <button class="btn btn-primary" onclick="payMembershipAction(500)">
    💳 Renew Membership
  </button>
</div>

<script>
  function payMembershipAction(amount) {
    paymentHandler.payMembership(amount, 'Annual Membership Fee');
  }
</script>
```

### Student Dashboard - View Payment History

```html
<div class="payment-history-section">
  <h3>📊 Payment History</h3>
  <table id="payments-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Purpose</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody id="payments-tbody">
      <!-- Dynamically populated -->
    </tbody>
  </table>
</div>

<script>
  async function loadPaymentHistory() {
    const payments = await paymentHandler.getUserPayments();
    const tbody = document.getElementById('payments-tbody');
    
    payments.forEach(payment => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
        <td>${payment.purpose}</td>
        <td>₹${payment.amount}</td>
        <td><span class="badge badge-${payment.status}">${payment.status}</span></td>
      `;
    });
  }
  
  // Load on page load
  loadPaymentHistory();
</script>
```

---

## Admin Dashboard Integration

### View All Payments

```html
<div class="payments-management-section">
  <h3>💳 Payment Management</h3>
  
  <!-- Filters -->
  <div class="filters">
    <select id="status-filter" onchange="filterPayments()">
      <option value="">All Status</option>
      <option value="success">Success</option>
      <option value="pending">Pending</option>
      <option value="failed">Failed</option>
    </select>
    
    <select id="purpose-filter" onchange="filterPayments()">
      <option value="">All Purpose</option>
      <option value="fine">Fine</option>
      <option value="membership">Membership</option>
      <option value="penalty">Penalty</option>
    </select>
  </div>
  
  <!-- Payments Table -->
  <table id="admin-payments-table">
    <thead>
      <tr>
        <th>Student Name</th>
        <th>Amount</th>
        <th>Purpose</th>
        <th>Status</th>
        <th>Date</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-payments-tbody">
      <!-- Dynamically populated -->
    </tbody>
  </table>
</div>

<script>
  async function loadAllPayments(page = 1) {
    const status = document.getElementById('status-filter')?.value;
    const purpose = document.getElementById('purpose-filter')?.value;
    
    const result = await paymentHandler.getAllPayments(status, purpose, page);
    const tbody = document.getElementById('admin-payments-tbody');
    tbody.innerHTML = '';
    
    result.payments.forEach(payment => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${payment.userId.name}</td>
        <td>₹${payment.amount}</td>
        <td>${payment.purpose}</td>
        <td><span class="badge badge-${payment.status}">${payment.status}</span></td>
        <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewPaymentDetail('${payment._id}')">View</button>
        </td>
      `;
    });
  }
  
  function filterPayments() {
    loadAllPayments(1);
  }
  
  // Load on page load
  loadAllPayments();
</script>
```

### Record Cash Payment (Admin)

```html
<div class="manual-payment-section">
  <h3>💰 Record Manual Payment</h3>
  
  <form id="manual-payment-form">
    <div class="form-group">
      <label for="student-select">Select Student:</label>
      <select id="student-select" required>
        <option value="">-- Select Student --</option>
        <!-- Dynamically populated from students list -->
      </select>
    </div>
    
    <div class="form-group">
      <label for="amount-input">Amount (₹):</label>
      <input type="number" id="amount-input" min="1" required>
    </div>
    
    <div class="form-group">
      <label for="purpose-select">Purpose:</label>
      <select id="purpose-select" required>
        <option value="fine">Fine</option>
        <option value="membership">Membership</option>
        <option value="penalty">Penalty</option>
        <option value="reservation">Reservation</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="description-input">Description:</label>
      <input type="text" id="description-input">
    </div>
    
    <button type="button" class="btn btn-success" onclick="recordCashPayment()">
      ✅ Record Payment
    </button>
  </form>
</div>

<script>
  async function recordCashPayment() {
    const userId = document.getElementById('student-select').value;
    const amount = document.getElementById('amount-input').value;
    const purpose = document.getElementById('purpose-select').value;
    const description = document.getElementById('description-input').value;
    
    if (!userId || !amount || !purpose) {
      alert('Please fill all required fields');
      return;
    }
    
    await paymentHandler.recordCashPayment(
      userId,
      parseFloat(amount),
      purpose,
      description
    );
  }
</script>
```

### Payment Statistics

```html
<div class="payment-stats-section">
  <h3>📈 Payment Statistics</h3>
  
  <div id="stats-container">
    <div class="stat-card">
      <h4>Total Payments</h4>
      <p id="total-payments">0</p>
    </div>
    
    <div class="stat-card">
      <h4>Successful Payments</h4>
      <p id="successful-payments">0</p>
    </div>
    
    <div class="stat-card">
      <h4>Total Amount Collected</h4>
      <p id="total-amount">₹0</p>
    </div>
  </div>
  
  <div id="stats-breakdown">
    <!-- Breakdown by purpose -->
  </div>
</div>

<script>
  async function loadPaymentStats() {
    const stats = await paymentHandler.getPaymentStats();
    
    if (stats) {
      document.getElementById('total-payments').textContent = stats.totalPayments;
      document.getElementById('successful-payments').textContent = stats.successfulPayments;
      document.getElementById('total-amount').textContent = '₹' + stats.totalAmount;
    }
  }
  
  // Load on page load
  loadPaymentStats();
</script>
```

---

## Testing with Razorpay Test Mode

### Test Cards

For testing purposes, use these test cards:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

### Test UPI ID
- `success@razorpay` - For successful payment
- `failed@razorpay` - For failed payment

---

## Security Checklist

- ✅ Never expose `RAZORPAY_KEY_SECRET` in frontend code
- ✅ Always verify payment signature on backend
- ✅ Store sensitive keys in `.env` file only
- ✅ Use HTTPS in production
- ✅ Add CSRF protection for payment endpoints
- ✅ Validate user authorization before processing payments
- ✅ Log all payment transactions for audit trail

---

## Troubleshooting

### Payment script not loading
- Check if Razorpay SDK is properly loaded
- Check browser console for errors
- Verify internet connection

### Signature verification fails
- Ensure `RAZORPAY_KEY_SECRET` is correctly set in `.env`
- Check if the signature calculation is correct
- Verify request body format

### Payment not updating in database
- Check MongoDB connection
- Verify user ID is correct
- Check logs for error messages

---

## Next Steps

1. Update your Student Dashboard HTML with payment buttons
2. Update Admin Dashboard with payment management section
3. Test with Razorpay test credentials
4. Deploy to production with live Razorpay keys
5. Monitor transactions in Razorpay dashboard

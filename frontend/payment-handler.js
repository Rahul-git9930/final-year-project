// Payment Gateway Integration - Frontend Handler
// This file handles all payment operations on the client side

class PaymentHandler {
  constructor() {
    this.razorpayKey = null;
  }

  // Initialize payment handler with Razorpay key
  async init() {
    try {
      const response = await fetch('/api/payments/config', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        this.razorpayKey = data.key_id;
      }
    } catch (error) {
      console.error('Failed to initialize payment handler:', error);
    }
  }

  // Create order and open Razorpay checkout
  async payFine(amount, description = 'Fine Payment') {
    return this.createAndPayOrder(amount, 'fine', description);
  }

  // Pay membership fee
  async payMembership(amount, description = 'Membership Fee') {
    return this.createAndPayOrder(amount, 'membership', description);
  }

  // Pay penalty for lost/damaged book
  async payPenalty(amount, bookTitle, description = 'Book Damage/Loss Penalty') {
    return this.createAndPayOrder(amount, 'penalty', `${description} - ${bookTitle}`);
  }

  // Generic payment method
  async createAndPayOrder(amount, purpose, description = '') {
    try {
      // Step 1: Create order on backend
      const createOrderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          purpose: purpose,
          description: description
        })
      });

      const orderData = await createOrderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "Library Management System",
        description: description,
        prefill: {
          name: this.getUserName(),
          email: this.getUserEmail()
        },
        handler: (response) => {
          // Step 3: Verify payment on backend
          this.verifyPayment(response);
        },
        theme: {
          color: "#3399cc"
        }
      };

      // Load and open Razorpay checkout
      if (typeof Razorpay !== 'undefined') {
        const rzp = new Razorpay(options);
        rzp.open();
      } else {
        console.error('Razorpay script not loaded');
        this.showError('Payment gateway not available. Please refresh the page.');
      }

    } catch (error) {
      console.error('Error creating payment:', error);
      this.showError(error.message || 'Failed to initiate payment');
    }
  }

  // Verify payment signature on backend
  async verifyPayment(response) {
    try {
      const verifyResponse = await fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        this.showSuccess('Payment successful! ✅');
        // Reload dashboard or update UI
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        this.showError(verifyData.error || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Error verifying payment:', error);
      this.showError('Payment verification failed. Please contact support.');
    }
  }

  // Record manual/cash payment (Admin only)
  async recordCashPayment(userId, amount, purpose, description = '') {
    try {
      const response = await fetch('/api/payments/admin/record-cash-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          amount: amount,
          purpose: purpose,
          description: description
        })
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess('Cash payment recorded successfully! ✅');
        return data.payment;
      } else {
        this.showError(data.error || 'Failed to record payment');
        return null;
      }

    } catch (error) {
      console.error('Error recording cash payment:', error);
      this.showError('Failed to record payment');
      return null;
    }
  }

  // Get user payments
  async getUserPayments(status = null, purpose = null) {
    try {
      let url = '/api/payments/user-payments';
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (purpose) params.append('purpose', purpose);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.success ? data.payments : [];

    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  // Get all payments (Admin only)
  async getAllPayments(status = null, purpose = null, page = 1, limit = 10) {
    try {
      let url = `/api/payments/admin/all-payments?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (purpose) url += `&purpose=${purpose}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.success ? { payments: data.payments, pagination: data.pagination } : { payments: [], pagination: {} };

    } catch (error) {
      console.error('Error fetching all payments:', error);
      return { payments: [], pagination: {} };
    }
  }

  // Get payment statistics (Admin only)
  async getPaymentStats(startDate = null, endDate = null) {
    try {
      let url = '/api/payments/admin/statistics';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.success ? data.statistics : null;

    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }
  }

  // Helper methods
  getUserName() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.name || 'Student';
  }

  getUserEmail() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || 'student@library.com';
  }

  showSuccess(message) {
    // Use existing notification system or alert
    if (typeof showNotification === 'function') {
      showNotification(message, 'success');
    } else {
      alert(message);
    }
  }

  showError(message) {
    // Use existing notification system or alert
    if (typeof showNotification === 'function') {
      showNotification(message, 'error');
    } else {
      alert('Error: ' + message);
    }
  }
}

// Initialize payment handler
const paymentHandler = new PaymentHandler();

// Load Razorpay SDK
function loadRazorpaySDK() {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => {
    console.log('✅ Razorpay SDK loaded');
    paymentHandler.init();
  };
  script.onerror = () => {
    console.error('❌ Failed to load Razorpay SDK');
  };
  document.head.appendChild(script);
}

// Load Razorpay SDK when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadRazorpaySDK);
} else {
  loadRazorpaySDK();
}

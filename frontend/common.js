// ===================== COMMON FUNCTIONS =====================

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Get content element (works with different selectors)
function getContentElement() {
  return document.querySelector('.content') || document.getElementById('mainContent');
}

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Show error
function showError(message) {
  const content = getContentElement();
  if (content) {
    content.innerHTML = `<div style="background: #fee; color: #c33; padding: 20px; border-radius: 8px; margin: 20px 0;">${message}</div>`;
  }
}

// API call with token
async function apiCall(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

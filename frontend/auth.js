document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(loginForm);
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const password = String(formData.get('password') || '');
      const submitButton = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }

      try {
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { message: text || 'Login failed' };
        }

        if (response.ok) {
          // Store token and user info
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect based on role
          const role = data.user.role;
          if (
            role === 'super_admin' ||
            role === 'college_admin' ||
            role === 'hod' ||
            role === 'faculty' ||
            role === 'librarian' ||
            role === 'accountant' ||
            role === 'placement_officer' ||
            role === 'hostel_manager' ||
            role === 'admin'
          ) {
            window.location.href = '/admin-dashboard.html';
          } else {
            window.location.href = '/student-dashboard.html';
          }
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    });
  }
});

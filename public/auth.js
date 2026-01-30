// Handle Login Form
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Login Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and user info
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect based on role
          const role = data.user.role;
          if (role === 'admin' || role === 'librarian') {
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
      }
    });
  }

  // Signup Handler
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(signupForm);
      const userData = Object.fromEntries(formData);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
          alert('Registration successful! Please login.');
          toggle(); // Switch to login form
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
      }
    });
  }
});

function toggle() {
  document.getElementById("container").classList.toggle("active");
}
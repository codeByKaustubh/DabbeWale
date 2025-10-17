console.log("Customer auth JS file connected");

const CUSTOMER_API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'http://localhost:5000'; // Rely on main.js to set this

document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('customerRegisterForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      console.log("Customer register form submitted!");

      const formData = new FormData(registerForm);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        role: 'consumer'
      };

      console.log("Sending registration data:", { ...data, password: '[HIDDEN]' });

      try {
        const response = await fetch(`${CUSTOMER_API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Registration response:", { status: response.status, body: result });

        if (response.ok) {
          // Auto-login successful since backend now returns token on registration
          if (result.token && result.user) {
            // Store token and user info
            localStorage.setItem('token', result.token);
            localStorage.setItem('userName', result.user.name);
            localStorage.setItem('userRole', result.user.role);
            localStorage.setItem('userId', result.user.id);
            
            showSuccess("Registration successful! Redirecting...");
            setTimeout(() => {
              // Redirect based on role, defaulting to customer page
              window.location.href = 'order-placement.html';
            }, 2000);
          } else {
            showSuccess("Registration successful! Please log in manually.");
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 2000);
          }
        } else {
          const errMsg = result && (result.msg || result.message || result.error);
          showError("Registration failed: " + (errMsg || "Unknown error"));
        }
      } catch (err) {
        console.error("Error during registration:", err);
        showError("Connection error. Please check if the server is running.");
      }
    });
  }
});

// Show error message
function showError(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.background = '#f44336';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

// Show success message
function showSuccess(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.background = '#4caf50';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
}

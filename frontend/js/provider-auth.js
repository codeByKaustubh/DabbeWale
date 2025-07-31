console.log("Provider auth JS file connected");
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('providerLoginForm');
  const registerForm = document.getElementById("providerRegisterForm");

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log("Provider login form submitted");
      
      const formData = new FormData(loginForm);
      const data = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log("Login response:", result);
        
        if (response.ok) {
          alert("Login successful!");
          // Store token and redirect
          localStorage.setItem('token', result.token);
          localStorage.setItem('userName', result.user.name);
          window.location.href = 'provider-panel.html';
        } else {
          alert("Login failed: " + (result.msg || "Unknown error"));
        }
      } catch (err) {
        console.error("Error during login:", err);
        alert("Connection error. Please check if the server is running.");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log("Provider register form submitted!");

      const formData = new FormData(registerForm);

      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: 'provider'
      };

      console.log("Sending registration data:", { ...data, password: '[HIDDEN]' });

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log("Registration response:", result);
        
        if (response.ok) {
          alert("Registration successful! You can now log in.");
          window.location.href = 'provider-login.html';
        } else {
          alert("Registration failed: " + (result.msg || "Unknown error"));
        }
      } catch (err) {
        console.error("Error during registration:", err);
        alert("Connection error. Please check if the server is running at http://localhost:5000");
      }
    });
  }
});

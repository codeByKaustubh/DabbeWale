console.log("Provider auth JS file connected");
// Use a namespaced constant to avoid collision with main.js
const PROVIDER_API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'http://localhost:5000'; // Rely on main.js to set this
console.log('API_BASE_URL:', PROVIDER_API_BASE_URL);
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('providerLoginForm');
  const registerForm = document.getElementById("providerRegisterForm");

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      console.log("Provider login form submitted");

      const formData = new FormData(loginForm);
      const data = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        console.log('POST login to:', `${PROVIDER_API_BASE_URL}/api/auth/login`);
        const response = await fetch(`${PROVIDER_API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Login response:", { status: response.status, url: response.url, body: result });

        if (response.ok) {
          alert("Login successful!");
          // Store token and redirect
          localStorage.setItem('token', result.token);
          localStorage.setItem('userName', result.user.name);
          // CRITICAL FIX: Store the providerId from the login response.
          // The dashboard uses this ID to fetch the correct data.
          if (result.user.providerId) {
            localStorage.setItem('providerId', result.user.providerId);
          }
          window.location.href = 'provider-dashboard.html';
        } else {
          const errMsg = result && (result.msg || result.message || result.error);
          alert("Login failed: " + (errMsg || "Unknown error"));
        }
      } catch (err) {
        console.error("Error during login:", err);
        alert("Connection error. Please check if the server is running.");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      console.log("Provider register form submitted!");

      const formData = new FormData(registerForm);

      // Normalize menu into array of objects expected by backend schema
      const rawMenu = (formData.get('menu') || '').toString();
      const rawPrices = (formData.get('prices') || '').toString();
      const parsedUnitPrice = parseFloat(rawPrices.replace(/[^0-9.]/g, '')) || 0;
      const menuItems = rawMenu
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(name => ({ name, price: parsedUnitPrice }));

      const data = {
        name: formData.get('name'),
        providerName: formData.get('providerName'),
        menu: menuItems,
        prices: rawPrices,
        location: formData.get('location'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        role: 'provider'
      };

      console.log("Sending registration data:", { ...data, password: '[HIDDEN]' });

      try {
        // Register directly via providers route to enforce Provider collection storage
        const url = `${PROVIDER_API_BASE_URL}/api/providers/register`;
        console.log('POST register to:', url, 'with payload:', data);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Registration response:", { status: response.status, url: response.url, body: result });

        if (response.ok) {
          // Auto-login after successful registration
          try {
            const loginResponse = await fetch(`${PROVIDER_API_BASE_URL}/api/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: data.email,
                password: data.password
              })
            });

            const loginResult = await loginResponse.json();
            
            if (loginResponse.ok) {
              // Store token and user info
              localStorage.setItem('token', loginResult.token);
              localStorage.setItem('userName', loginResult.user.name);
              localStorage.setItem('userRole', loginResult.user.role);
              localStorage.setItem('userId', loginResult.user.id);
              localStorage.setItem('providerId', loginResult.user.providerId || loginResult.user.id);
              
              alert("Registration successful! Redirecting to your dashboard...");
              window.location.href = 'provider-dashboard.html';
            } else {
              alert("Registration successful! Please log in manually.");
              window.location.href = 'login.html';
            }
          } catch (loginErr) {
            console.error("Auto-login failed:", loginErr);
            alert("Registration successful! Please log in manually.");
            window.location.href = 'login.html';
          }
        } else {
          const errMsg = result && (result.msg || result.message || result.error);
          alert("Registration failed: " + (errMsg || "Unknown error"));
        }
      } catch (err) {
        console.error("Error during registration:", err);
        alert("Connection error. Please check if the server is running at https://dabbewale.onrender.com");
      }
    });
  }
});

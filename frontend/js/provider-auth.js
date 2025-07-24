console.log("JS file connected");
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('providerLoginForm');
  const registerForm = document.getElementById("providerForm");

  if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // TODO: Integrate with backend API
    alert('Provider login submitted! (Backend integration needed)');
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log("Register form submitted!");

    const formData = new FormData(registerForm);

    const data = {
      actualName: formData.get('actualName'),
      providerName: formData.get('providerName'),
      menu: formData.get('menu'),
      prices: formData.get('prices'),
      location: formData.get('location'),
      email: formData.get('email'),
      phone: formData.get('phone'),
    };

    try {
      const response = await fetch('https://<https://dabbewale-2.onrender.com>/api/provider/register',  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      // handle response here
    } catch (err) {
      // handle error here
    }
  });
}})
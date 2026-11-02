document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput
        })
      });

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', data.user ? data.user.username : usernameInput);

        window.location.href = '/';
      } else {
        showError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      showError('Unable to connect to server. Check backend status.');
    }
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
  }
});
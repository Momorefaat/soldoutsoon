async function register(username, email, password, firstName, lastName, phone, address) {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, firstName, lastName, phone, address })
    });
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    }
    const error = await response.json().catch(() => ({}));
    return { success: false, message: error.message };
  } catch (err) {
    return { success: false, message: 'Network error' };
  }
}

  async function login(username, password) {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  }
  
  function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  function logoutUser() {
    localStorage.removeItem('user');
  }
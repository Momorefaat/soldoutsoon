async function register(username, email, password, firstName, lastName, phone, address) {
  const backendUrl = 'http://localhost:3000'; // Ensure backend is running on this port
  const response = await fetch('${backendUrl}/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, firstName, lastName, phone, address })
    });
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  }
  
  async function login(username, password) {
    const backendUrl = 'http://localhost:3000'; // Ensure backend is running on this port
    console.log('Attempting login with:', { username, password });
    const response = await fetch(`${backendUrl}/api/users/login`, {
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
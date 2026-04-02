// JWT utility functions
export const TOKEN_KEY = 'access_token';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Decode JWT token (without verification - for client-side use only)
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    surname: decoded.surname,
  };
};

export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Get headers for API calls
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Logout function
export const logout = async () => {
  // Call backend logout endpoint
  try {
    await fetch('http://localhost:3000/account/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Error calling logout endpoint:', error);
  }
  
  removeToken();
  localStorage.removeItem('user'); // Also remove any legacy user data
  // Redirect to login page
  window.location.href = '/login';
};
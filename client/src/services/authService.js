// const login = async (email, password) => {
//   const response = await fetch('/api/auth/login', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password }),
//   });
//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.message || 'Login failed');
//   }
//   if (data.success && data.data) {
//     localStorage.setItem('user', JSON.stringify(data.data));
//   }
//   return data.data;
// };

// const register = async (name, email, password, role) => {
//   const response = await fetch('/api/auth/register', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ name, email, password, role }),
//   });
//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.message || 'Registration failed');
//   }
//   if (data.success && data.data) {
//     localStorage.setItem('user', JSON.stringify(data.data));
//   }
//   return data.data;
// };

// const logout = () => {
//   localStorage.removeItem('user');
// };

// const getCurrentUser = () => {
//   return JSON.parse(localStorage.getItem('user'));
// };

// const authService = {
//   login,
//   register,
//   logout,
//   getCurrentUser,
// };

// export default authService;

import API from './api';

const login = async (email, password) => {
  try {
    const response = await API.post('/auth/login', {
      email,
      password,
    });

    const data = response.data;

    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Login failed'
    );
  }
};

const register = async (name, email, password, role) => {
  try {
    const response = await API.post('/auth/register', {
      name,
      email,
     password,
      role,
    });

    const data = response.data;

    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Registration failed'
    );
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
};

export default authService;
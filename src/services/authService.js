const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// FAKE AUTH: Bật fake login khi VITE_USE_FAKE_AUTH=true hoặc chưa cấu hình VITE_API_BASE_URL.
// Dùng tạm để test Front-End khi backend chưa chạy.
const USE_FAKE_AUTH =
  import.meta.env.VITE_USE_FAKE_AUTH === 'true' || !import.meta.env.VITE_API_BASE_URL;

// FAKE AUTH: Tài khoản test cố định cho Front-End.
const FAKE_USER = {
  id: 'fake-user-1',
  fullName: 'Frontend Tester',
  email: 'test@aitasker.local',
  role: 'admin', // Có thể đổi thành 'client' để test giao diện client
};

// FAKE AUTH: Email/password dùng để đăng nhập trên form Login.
const FAKE_ACCOUNT = {
  email: FAKE_USER.email,
  password: '123456',
};

// FAKE AUTH: Token giả để mô phỏng token backend trả về.
const FAKE_TOKEN = 'fake-auth-token-for-frontend-test';

export const register = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'client'  // Default role, will be customizable later
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    // Don't save token yet - only save after email verification and login
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (data) => {
  try {
    // FAKE AUTH: Nếu đang bật fake auth thì bỏ qua fetch backend và trả dữ liệu giả.
    if (USE_FAKE_AUTH) {
      const isValidAccount =
        data.email === FAKE_ACCOUNT.email && data.password === FAKE_ACCOUNT.password;

      if (!isValidAccount) {
        throw new Error('Invalid fake account. Use test@aitasker.local / 123456');
      }

      const result = {
        token: FAKE_TOKEN,
        user: FAKE_USER,
        message: 'Fake login successful',
      };

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      return result;
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // FAKE AUTH: checkLogin() gọi getMe(), nên cần trả user giả thay vì verify backend.
    if (USE_FAKE_AUTH && token === FAKE_TOKEN) {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : FAKE_USER;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch user profile');
    }

    return result;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const sendVerificationCode = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send verification code');
    }

    return result;
  } catch (error) {
    console.error('Send verification code error:', error);
    throw error;
  }
};

export const verifyCode = async (email, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to verify code');
    }

    return result;
  } catch (error) {
    console.error('Verify code error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

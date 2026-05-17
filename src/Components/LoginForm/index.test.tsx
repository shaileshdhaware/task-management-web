import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './index';
import api from './Api';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API
jest.mock('./Api');

describe('LoginForm Component', () => {
  const mockSetAuth = jest.fn();

  const setup = () => {
    render(
      <BrowserRouter>
        <LoginForm setAuth={mockSetAuth} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should render login form correctly', () => {
    setup();

    expect(screen.getByText('Login', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('should login successfully and navigate to dashboard', async () => {
    const user = userEvent.setup();

    (api.post as jest.Mock).mockResolvedValue({
      data: {
        token: 'test-token',
        role: 'admin',
        username: 'testuser',
      },
    });

    setup();

    await user.type(screen.getByPlaceholderText('Username'), 'testuser');
    await user.type(screen.getByPlaceholderText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(api.post).toHaveBeenCalledWith('/login', {
      username: 'testuser',
      password: 'password',
    });

    // Verify localStorage
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(localStorage.getItem('role')).toBe('admin');
    expect(localStorage.getItem('username')).toBe('testuser');

    expect(mockSetAuth).toHaveBeenCalledWith({
      token: 'test-token',
      role: 'admin',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should show error message on failed login', async () => {
    const user = userEvent.setup();

    (api.post as jest.Mock).mockRejectedValue(new Error('Login failed'));

    setup();

    await user.type(screen.getByPlaceholderText('Username'), 'wrong');
    await user.type(screen.getByPlaceholderText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should call API even with empty fields (current behavior)', async () => {
    const user = userEvent.setup();

    (api.post as jest.Mock).mockResolvedValue({
      data: { token: '', role: '', username: '' },
    });

    setup();

    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(api.post).toHaveBeenCalledWith('/login', {
      username: '',
      password: '',
    });
  });
});
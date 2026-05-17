import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NavbarComponent from './NavbarComponent';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('NavbarComponent', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    localStorage.clear();
  });

  test('renders brand + Home link and shows Login when no token exists', () => {
    // Arrange: no token in localStorage
    render(<NavbarComponent />);

    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
  });

  test('navigates to /login when Login button is clicked', async () => {
    const user = userEvent.setup();
    render(<NavbarComponent />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows Welcome + Logout when token exists and hides Login', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('role', 'ADMIN');

    render(<NavbarComponent />);

    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome admin/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });

  test('logout clears localStorage keys, navigates to /dashboard, and switches UI back to Login', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('username', 'someone');

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    const user = userEvent.setup();

    render(<NavbarComponent />);

    // Sanity check authenticated UI
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /logout/i }));

    expect(removeItemSpy).toHaveBeenCalled();
    const removedKeys = removeItemSpy.mock.calls.map(call => call[0]);
    expect(removedKeys).toEqual(expect.arrayContaining(['token', 'role', 'username']));

    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();

    removeItemSpy.mockRestore();
  });

  test('updates UI when token appears in localStorage and component re-renders', async () => {
    const { rerender } = render(<NavbarComponent />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    localStorage.setItem('token', 'new-token');
    localStorage.setItem('role', 'USER');

    rerender(<NavbarComponent />);

    await waitFor(() => {
      expect(screen.getByText(/welcome user/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });
});
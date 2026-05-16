
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./Components/Navbar/NavbarComponent', () => () => (
  <div data-testid="navbar">Navbar</div>
));

jest.mock('./Components/Dashboard/Dashboard', () => () => (
  <div data-testid="dashboard">Dashboard</div>
));

jest.mock('./Components/TaskManager/CreateTask', () => ({
  TaskForm: () => <div data-testid="taskform">TaskForm</div>,
}));

jest.mock('./Components/LoginForm', () => ({
  LoginForm: ({ setAuth }: { setAuth: Function }) => (
    <div data-testid="loginform">LoginForm</div>
  ),
}));

describe('App Component Routing', () => {

  beforeEach(() => {
    window.history.pushState({}, '', '/');
    localStorage.clear();
  });

  test('renders Navbar on all routes', () => {
    render(<App />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  test('renders Dashboard on "/" route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('renders Dashboard on "/dashboard" route', () => {
    window.history.pushState({}, '', '/dashboard');
    render(<App />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('renders TaskForm on "/createtask" route', () => {
    window.history.pushState({}, '', '/createtask');
    render(<App />);
    expect(screen.getByTestId('taskform')).toBeInTheDocument();
  });

  test('renders LoginForm on "/login" route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByTestId('loginform')).toBeInTheDocument();
  });

  test('does not crash if token exists in localStorage', () => {
    localStorage.setItem('token', 'mock-token');
    render(<App />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

});

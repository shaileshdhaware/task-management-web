import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from './CreateTask';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock router hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }), // default create mode
}));

// Mock store
const mockCreateTask = jest.fn();
const mockUpdateTask = jest.fn();
const mockResetError = jest.fn();

jest.mock('../Store', () => ({
  useTasksStore: () => ({
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
    resetStoreError: mockResetError,
  }),
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <TaskForm />
    </MemoryRouter>
  );

describe('TaskForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Create Task form', () => {
    renderComponent();

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter 5-digit task ID')).toBeInTheDocument();
  });

  test('shows validation error for invalid Task ID', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter 5-digit task ID'), {
      target: { value: '123' }, // invalid
    });

    fireEvent.change(screen.getByPlaceholderText('Enter task title'), {
      target: { value: 'Valid Title' },
    });

    fireEvent.click(screen.getByText('Add Task'));

    expect(await screen.findByText(/Task ID must be exactly 5 digits/i)).toBeInTheDocument();
  });

  test('shows validation error for short title', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter 5-digit task ID'), {
      target: { value: '12345' },
    });

    fireEvent.change(screen.getByPlaceholderText('Enter task title'), {
      target: { value: 'ab' },
    });

    fireEvent.click(screen.getByText('Add Task'));

    expect(await screen.findByText(/Please enter valid task title/i)).toBeInTheDocument();
  });

  test('submits form and calls createTask', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter 5-digit task ID'), {
      target: { value: '12345' },
    });

    fireEvent.change(screen.getByPlaceholderText('Enter task title'), {
      target: { value: 'Test Task' },
    });

    fireEvent.change(screen.getByPlaceholderText('Detailed task description'), {
      target: { value: 'Test Description' },
    });

    fireEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        id: 12345,
        title: 'Test Task',
        description: 'Test Description',
        priority: 'Low',
        taskStatus: 'Todo',
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('navigates to dashboard on cancel', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('renders Edit mode and calls updateTask', async () => {
    // override location mock
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      state: {
        id: 12345,
        title: 'Existing Task',
        description: 'Existing',
        priority: 'High',
        taskStatus: 'Done',
      },
    });

    renderComponent();

    expect(screen.getByText('Edit Task')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Update Task'));

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalled();
    });
  });

  test('Task ID is read-only in edit mode', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      state: {
        id: 12345,
        title: 'Existing Task',
        description: 'Existing',
        priority: 'High',
        taskStatus: 'Done',
      },
    });

    renderComponent();

    const idInput = screen.getByDisplayValue('12345');
    expect(idInput).toHaveAttribute('readOnly');
  });
});
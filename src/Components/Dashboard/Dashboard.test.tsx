import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = useNavigate as jest.Mock;
const mockUseTasksStore = jest.fn();

jest.mock('../Store', () => ({
  useTasksStore: () => mockUseTasksStore(),
}));


// Mock ActionButtons
jest.mock('../Common/ActionButtons', () => (props) => {
  const { id, onDelete, onEdit, onView } = props;
  return (
    <div>
      <button type="button" onClick={onView}>
        View-{id}
      </button>
      <button type="button" onClick={onEdit}>
        Edit-{id}
      </button>
      <button type="button" onClick={() => onDelete(id)}>
        Delete-{id}
      </button>
    </div>
  );
});

// Mock ViewTaskModal
jest.mock('../Modal/ViewTaskModal', () => (props) => {
  const { show, handleClose, task } = props;
  if (!show) return null;
  return (
    <div role="dialog" aria-label="view-task-modal">
      <div>Viewing: {task ? task.title : 'No task'}</div>
      <button type="button" onClick={handleClose}>
        Close View
      </button>
    </div>
  );
});

// Mock ConfirmationModal
jest.mock('../Modal/ConfirmationModal', () => (props) => {
  const { show, onConfirm, onCancel } = props;
  if (!show) return null;
  return (
    <div role="dialog" aria-label="confirmation-modal">
      <div>Are you sure?</div>
      <button type="button" onClick={onConfirm}>
        Confirm
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
});

// Mock ErrorModal
jest.mock('../Modal/ErrorModal', () => (props) => {
  const { show, errorMessage, onClose } = props;
  if (!show) return null;
  return (
    <div role="dialog" aria-label="error-modal">
      <div>Error: {errorMessage}</div>
      <button type="button" onClick={onClose}>
        Close Error
      </button>
    </div>
  );
});

describe('Dashboard', () => {
  let fetchTasksMock;
  let deleteTaskMock;
  let resetStoreErrorMock;

  // Mutable "store state" so tests can rerender with different values
  let storeState;

  beforeEach(() => {
    
    mockNavigate.mockClear();
    mockNavigate.mockReturnValue(jest.fn());

    fetchTasksMock = jest.fn();
    deleteTaskMock = jest.fn().mockResolvedValue(undefined);
    resetStoreErrorMock = jest.fn();

    storeState = {
      tasks: [],
      error: null,
      fetchTasks: fetchTasksMock,
      deleteTask: deleteTaskMock,
      resetStoreError: resetStoreErrorMock,
    };

    mockUseTasksStore.mockImplementation(() => storeState);

    // localStorage used to build auth state
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('role', 'Admin');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders header and calls fetchTasks on mount; shows empty state when no tasks', () => {
    render(<Dashboard />);

    expect(screen.getByRole('heading', { name: /welcome to task dashboard/i })).toBeInTheDocument();
    expect(fetchTasksMock).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/you don’t have any tasks listed\./i)).toBeInTheDocument();
  });

  test('renders table when tasks exist', () => {
    storeState.tasks = [
      { id: 1, title: 'Fix bug', priority: 'High', taskStatus: 'Open' },
      { id: 2, title: 'Write tests', priority: 'Low', taskStatus: 'Done' },
    ];

    render(<Dashboard />);

    // Table headers
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/priority/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();

    // Rows (verify some cells)
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();

    // Each id is rendered as a clickable button link
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  test('filters tasks when typing in the search input', async () => {
    const user = userEvent.setup();

    storeState.tasks = [
      { id: 1, title: 'Fix bug', priority: 'High', taskStatus: 'Open' },
      { id: 2, title: 'Write tests', priority: 'Low', taskStatus: 'Done' },
    ];

    render(<Dashboard />);

    const input = screen.getByRole('textbox', { name: '' }); // placeholder-only textbox
    await user.type(input, 'fix');

    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument();

    // Clearing restores full list
    await user.clear(input);
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  test('opens ViewTaskModal when clicking task id button', async () => {
    const user = userEvent.setup();

    storeState.tasks = [
      { id: 1, title: 'Fix bug', priority: 'High', taskStatus: 'Open' },
    ];

    render(<Dashboard />);

    await user.click(screen.getByRole('button', { name: '1' }));

    expect(screen.getByRole('dialog', { name: /view-task-modal/i })).toBeInTheDocument();
    expect(screen.getByText(/viewing: fix bug/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close view/i }));
    expect(screen.queryByRole('dialog', { name: /view-task-modal/i })).not.toBeInTheDocument();
  });

  /*test('navigates to /createtask with task state when clicking Edit in ActionButtons', async () => {
    const user = userEvent.setup();

    const task = { id: 7, title: 'Refactor', priority: 'Medium', taskStatus: 'Open' };
    storeState.tasks = [task];

    render(<Dashboard />);

    await user.click(screen.getByRole('button', { name: 'Edit-7' }));

    expect(mockNavigate).toHaveBeenCalledWith('/createtask', { state: task });
  });*/

  test('shows ConfirmationModal on delete; confirming calls deleteTask with id and auth; then closes', async () => {
    const user = userEvent.setup();

    const task = { id: 3, title: 'Cleanup', priority: 'Low', taskStatus: 'Open' };
    storeState.tasks = [task];

    render(<Dashboard />);

    // Open confirm dialog
    await user.click(screen.getByRole('button', { name: 'Delete-3' }));
    expect(screen.getByRole('dialog', { name: /confirmation-modal/i })).toBeInTheDocument();

    // Confirm delete
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledTimes(1);
    });

    // Called with (id, auth)
    const [calledId, calledAuth] = deleteTaskMock.mock.calls[0];
    expect(calledId).toBe(3);
    expect(calledAuth).toEqual({ token: 'test-token', role: 'Admin' });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /confirmation-modal/i })).not.toBeInTheDocument();
    });
  });

  test('shows ErrorModal when store error is set; closing resets store error', async () => {
    const user = userEvent.setup();

    storeState.tasks = [{ id: 1, title: 'Fix bug', priority: 'High', taskStatus: 'Open' }];
    const { rerender } = render(<Dashboard />);

    // Inject error and rerender to trigger effect
    storeState.error = { response: { data: { error: 'Backend exploded' } } };
    rerender(<Dashboard />);

    expect(screen.getByRole('dialog', { name: /error-modal/i })).toBeInTheDocument();
    expect(screen.getByText(/backend exploded/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close error/i }));
    expect(resetStoreErrorMock).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /error-modal/i })).not.toBeInTheDocument();
    });
  });
});
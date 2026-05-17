import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ViewTaskModal, { ViewTaskProps } from './ViewTaskModal';

describe('ViewTaskModal Component', () => {
  const mockTask = {
    id:12345,
    title: 'Test Task',
    description: 'This is a test task description',
    priority: 'High',
    taskStatus: 'In Progress',
  };

  const setup = (props = {}) => {
    const defaultProps: ViewTaskProps = {
      show: true,
      handleClose: jest.fn(),
      task: mockTask,
      ...props,
    };

    render(<ViewTaskModal {...defaultProps} />);
    return defaultProps;
  };

  test('renders modal with task details when task is provided', () => {
    setup();

    expect(screen.getByText('Test Task')).toBeInTheDocument();

    expect(screen.getByText(/Task Description:/i)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();

    expect(screen.getByText(/Priority:/i)).toBeInTheDocument();
    expect(screen.getByText(mockTask.priority)).toBeInTheDocument();

    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(mockTask.taskStatus)).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: /close/i })[1]).toBeInTheDocument();
  });

  test('does not render anything when task is null', () => {
    setup({ task: null });

    expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  test('renders modal only when show is true', () => {
    setup({ show: false });

    // Modal should not be visible when show is false
    expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
  });

  test('calls handleClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    const { handleClose } = setup();

    const closeButton = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButton[1]);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('calls handleClose when header close button is clicked', async () => {
    const user = userEvent.setup();
    const { handleClose } = setup();

    const headerCloseButton = screen.getAllByRole('button', { name: /close/i });

    await user.click(headerCloseButton[0]);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('renders all task fields correctly', () => {
    setup({
      task: {
        title: 'Bug Fix',
        description: 'Fix API timeout issue',
        priority: 'Low',
        taskStatus: 'Completed',
      },
    });

    expect(screen.getByText('Bug Fix')).toBeInTheDocument();
    expect(screen.getByText('Fix API timeout issue')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
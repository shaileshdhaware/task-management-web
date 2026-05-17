import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ActionButtons, { ActionButtonsProps } from './ActionButtons';

describe('ActionButtons Component', () => {
  const setup = (props = {}) => {
    const defaultProps: ActionButtonsProps = {
      id: 12345,
      onView: jest.fn(),
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      role: 'ADMIN',
      ...props,
    };

    render(<ActionButtons {...defaultProps} />);
    return defaultProps;
  };

  test('renders all action buttons', () => {
    setup();

    expect(screen.getByTitle('View Details')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Item')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Item')).toBeInTheDocument();
  });

  test('calls onView with correct id when view button is clicked', async () => {
    const user = userEvent.setup();
    const { onView, id } = setup();

    const viewButton = screen.getByTitle('View Details');
    await user.click(viewButton);

    expect(onView).toHaveBeenCalledTimes(1);
    expect(onView).toHaveBeenCalledWith(id);
  });

  test('calls onEdit with correct id when edit button is clicked (ADMIN role)', async () => {
    const user = userEvent.setup();
    const { onEdit, id } = setup({ role: 'ADMIN' });

    const editButton = screen.getByTitle('Edit Item');
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(id);
  });

  test('calls onDelete with correct id when delete button is clicked', async () => {
    const user = userEvent.setup();
    const { onDelete, id } = setup();

    const deleteButton = screen.getByTitle('Delete Item');
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(id);
  });

  test('disables edit button when role is USER', () => {
    setup({ role: 'USER' });

    const editButton = screen.getByTitle('Edit Item');
    expect(editButton).toBeDisabled();
  });

  test('disables edit button when role is null', () => {
    setup({ role: null });

    const editButton = screen.getByTitle('Edit Item');
    expect(editButton).toBeDisabled();
  });

  test('edit button is enabled when role is ADMIN', () => {
    setup({ role: 'ADMIN' });

    const editButton = screen.getByTitle('Edit Item');
    expect(editButton).not.toBeDisabled();
  });

  test('does not call onEdit when edit button is disabled', async () => {
    const user = userEvent.setup();
    const { onEdit } = setup({ role: 'USER' });

    const editButton = screen.getByTitle('Edit Item');

    expect(editButton).toBeDisabled();

    await user.click(editButton);

    expect(onEdit).not.toHaveBeenCalled();
  });
});
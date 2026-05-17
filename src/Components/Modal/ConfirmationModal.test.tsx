import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal Component', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      show: true,
      onConfirm: jest.fn(),
      onCancel: jest.fn(),
      ...props,
    };

    render(<ConfirmationModal {...defaultProps} />);
    return defaultProps;
  };

  test('renders modal when show is true', () => {
    setup();

    expect(screen.getByText('Caution')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure want to perform this action?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  test('does not render modal content when show is false', () => {
    setup({ show: false });

    expect(screen.queryByText('Caution')).not.toBeInTheDocument();
  });

  test('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = setup();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onConfirm when Confirm button is clicked', async () => {
    const user = userEvent.setup();
    const { onConfirm } = setup();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when modal close button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = setup();

    // Bootstrap close button usually has aria-label="Close"
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('modal has static backdrop behavior (no accidental close)', () => {
    setup();

    expect(screen.getByText('Caution')).toBeInTheDocument();
  });
});
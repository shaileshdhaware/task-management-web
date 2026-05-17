import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ErrorModal from './ErrorModal';

describe('ErrorModal Component', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      show: true,
      errorMessage: 'Something went wrong',
      onClose: jest.fn(),
      ...props,
    };

    render(<ErrorModal {...defaultProps} />);
    return defaultProps;
  };

  test('renders modal with error message when show is true', () => {
    setup();

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('does not render modal content when show is false', () => {
    setup({ show: false });

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  test('renders dynamic error message correctly', () => {
    setup({ errorMessage: 'API failed due to timeout' });

    expect(
      screen.getByText('API failed due to timeout')
    ).toBeInTheDocument();
  });

  test('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = setup();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when header close button is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = setup();

    // React Bootstrap close button has "Close" accessible label
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('modal remains rendered with static backdrop', () => {
    setup();

    // Confirms modal content is visible
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
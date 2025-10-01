import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ChangePasswordForm from '../ChangePasswordForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ChangePasswordForm', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial button state', () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText('Change password')).toBeInTheDocument();
  });

  it('shows form when button is clicked', () => {
    render(<ChangePasswordForm />);
    fireEvent.click(screen.getByText('Change password'));
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('validates password match', async () => {
    render(<ChangePasswordForm />);
    fireEvent.click(screen.getByText('Change password'));

    // Fill in form with mismatched passwords
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'oldpassword' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'differentpassword' },
    });

    fireEvent.click(screen.getByText('Change Password'));

    expect(await screen.findByText('New passwords do not match')).toBeInTheDocument();
  });

  it('validates password length', async () => {
    render(<ChangePasswordForm />);
    fireEvent.click(screen.getByText('Change password'));

    // Fill in form with short password
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByText('Change Password'));

    expect(await screen.findByText('New password must be at least 8 characters long')).toBeInTheDocument();
  });

  it('handles successful password change', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Password changed successfully' }),
    });

    render(<ChangePasswordForm />);
    fireEvent.click(screen.getByText('Change password'));

    // Fill in form correctly
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'oldpassword' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.click(screen.getByText('Change Password'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        }),
      });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        }),
      });
    });

    // Success message should be shown
    // After success, the form collapses back to a single button
    await waitFor(() => {
      expect(screen.getByText('Change password')).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Current password is incorrect' }),
    });

    render(<ChangePasswordForm />);
    fireEvent.click(screen.getByText('Change password'));

    // Fill in form
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    });

    fireEvent.click(screen.getByText('Change Password'));

    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument();
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import DeleteAccountButton from '../DeleteAccountButton';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

describe('DeleteAccountButton', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    (signOut as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial button state', () => {
    render(<DeleteAccountButton />);
    expect(screen.getByText('Delete account')).toBeInTheDocument();
  });

  it('shows confirmation dialog when button is clicked', () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText('Delete account'));
    
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm your password to continue')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeInTheDocument();
  });

  it('validates password is required', async () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText('Delete account'));
    
    // Try to submit without password
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    
    // Password field should show required validation
    const passwordInput = screen.getByLabelText('Confirm your password to continue');
    expect(passwordInput).toBeRequired();
  });

  it('handles successful account deletion', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Account deleted successfully' }),
    });

    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText('Delete account'));

    // Enter password and submit
    fireEvent.change(screen.getByLabelText('Confirm your password to continue'), {
      target: { value: 'mypassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'mypassword' }),
      });
    });

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('handles API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Password is incorrect' }),
    });

    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText('Delete account'));

    // Enter password and submit
    fireEvent.change(screen.getByLabelText('Confirm your password to continue'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));

    expect(await screen.findByText('Password is incorrect')).toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('closes confirmation dialog when cancel is clicked', () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText('Delete account'));
    
    // Confirmation dialog should be visible
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Confirmation dialog should be hidden
    expect(screen.queryByText('This action cannot be undone.')).not.toBeInTheDocument();
  });

  it('shows loading state during deletion', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Account deleted successfully' }),
        });
      }, 100);
    }));

    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText('Delete account'));

    // Enter password and submit
    fireEvent.change(screen.getByLabelText('Confirm your password to continue'), {
      target: { value: 'mypassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));

    // Should show loading state
    expect(screen.getByText('Deleting...')).toBeInTheDocument();

    // Wait for deletion to complete
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });
});
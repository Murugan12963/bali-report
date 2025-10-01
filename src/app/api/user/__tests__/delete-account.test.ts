jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => data,
    }),
  },
}));

// Mock NextRequest
class MockNextRequest {
  private _body: string;

  constructor(url: string, init?: { method?: string; body?: string }) {
    this._body = init?.body || '';
  }

  async json() {
    return JSON.parse(this._body);
  }
}

const NextRequest = MockNextRequest as any;
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { POST } from '../delete-account/route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options module used by the route to avoid loading NextAuth internals
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('Delete Account API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    credentials: {
      password: 'hashed-password',
    },
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.delete as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'mypassword' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Not authenticated');
  });

  it('returns 400 if password is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Password is required');
  });

  it('returns 400 if password is incorrect', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'wrongpassword' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Password is incorrect');
  });

  it('successfully deletes account', async () => {
    const request = new NextRequest('http://localhost:3000/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'correctpassword' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    });
    expect(response.status).toBe(200);
    expect(data.message).toBe('Account deleted successfully');
  });

  it('handles database errors', async () => {
    (prisma.user.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'correctpassword' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An error occurred while deleting account');
  });

  it('returns 400 if user credentials not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUser,
      credentials: null,
    });

    const request = new NextRequest('http://localhost:3000/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'mypassword' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No password set for this account');
  });
});
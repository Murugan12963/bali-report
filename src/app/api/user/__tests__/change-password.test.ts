jest.mock("next/server", () => ({
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
    this._body = init?.body || "";
  }

  async json() {
    return JSON.parse(this._body);
  }
}

const NextRequest = MockNextRequest as any;
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { POST } from "../change-password/route";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options module used by the route to avoid loading NextAuth internals
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    userCredentials: {
      update: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("Change Password API", () => {
  const mockSession = {
    user: {
      id: "user-123",
      email: "test@example.com",
    },
  };

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    credentials: {
      password: "hashed-old-password",
    },
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("new-hashed-password");
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.userCredentials.update as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/user/change-password",
      {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "oldpass",
          newPassword: "newpass",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Not authenticated");
  });

  it("returns 400 if passwords are missing", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/user/change-password",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Current password and new password are required");
  });

  it("returns 400 if current password is incorrect", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = new NextRequest(
      "http://localhost:3000/api/user/change-password",
      {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "wrongpass",
          newPassword: "newpass123",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Current password is incorrect");
  });

  it("successfully changes password", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/user/change-password",
      {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "oldpass",
          newPassword: "newpass123",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(prisma.userCredentials.update).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      data: { password: "new-hashed-password" },
    });
    expect(response.status).toBe(200);
    expect(data.message).toBe("Password updated successfully");
  });

  it("handles database errors", async () => {
    (prisma.userCredentials.update as jest.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const request = new NextRequest(
      "http://localhost:3000/api/user/change-password",
      {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "oldpass",
          newPassword: "newpass123",
        }),
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("An error occurred while changing password");
  });
});

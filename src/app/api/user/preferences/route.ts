import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { UserPreferences } from '@/types/user';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const preferences: UserPreferences = await req.json();

    // Update user preferences
    const updatedPreferences = await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data: {
        darkMode: preferences.darkMode,
        language: preferences.language,
        contentPreferences: preferences.contentPreferences,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        articleDisplay: preferences.articleDisplay,
        autoplayVideos: preferences.autoplayVideos,
      },
    });

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating preferences' },
      { status: 500 }
    );
  }
}
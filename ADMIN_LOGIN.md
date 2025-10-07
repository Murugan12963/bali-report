# Admin Dashboard Login Credentials

## 🔐 How to Access Admin Areas

All `/admin/*` routes are now protected with HTTP Basic Authentication.

### Default Credentials (Development)

When you visit any admin page (e.g., `/admin/analytics`), your browser will show a login popup:

**Username**: `admin`  
**Password**: `bali2025`

### Browser Login Flow

1. Navigate to: `http://localhost:3000/admin/analytics`
2. Browser automatically shows authentication popup
3. Enter username and password
4. Click "Sign In" or press Enter
5. Browser remembers credentials for the session
6. You can now access all admin pages

### Protected Routes

- `/admin/analytics` - Analytics Dashboard
- `/admin/newsletter` - Newsletter Management  
- `/admin/moderation` - Content Moderation
- Any other `/admin/*` routes

## 🔒 Security Notes

### For Development
- Default credentials are in `.env.local`
- Safe to use on localhost
- Credentials stored locally only

### For Production

**⚠️ IMPORTANT: Change credentials before deploying!**

Update `.env.local` (or set environment variables on your hosting platform):

```bash
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password_123!@#
```

**Production Best Practices:**
- Use a strong, unique password (20+ characters)
- Use a non-obvious username (not "admin")
- Consider using environment secrets management
- Consider migrating to NextAuth for more robust authentication

## 🔓 Logout

To logout:
1. Close the browser tab/window
2. Or clear browser session storage
3. Or use browser's "Forget this password" option

## 🛠️ Technical Details

**Authentication Method**: HTTP Basic Authentication  
**Implementation**: Next.js Middleware (`src/middleware.ts`)  
**Storage**: Environment variables (`.env.local`)  
**Session**: Browser-managed (no server sessions)

## 📝 Changing Credentials

### Option 1: Edit .env.local
```bash
# Open .env.local and modify:
ADMIN_USERNAME=yournewusername
ADMIN_PASSWORD=yournewpassword
```

### Option 2: Set Environment Variables
On your production server:
```bash
export ADMIN_USERNAME="yournewusername"
export ADMIN_PASSWORD="yournewpassword"
```

### Option 3: Vercel/Netlify Dashboard
Add environment variables in your hosting platform's dashboard:
- Variable: `ADMIN_USERNAME`, Value: `yournewusername`
- Variable: `ADMIN_PASSWORD`, Value: `yournewpassword`

## ⚙️ Disable Authentication (Not Recommended)

If you need to temporarily disable admin authentication:

1. Comment out the protection in `src/middleware.ts`:
```typescript
// if (path.startsWith("/admin")) {
//   ... auth code ...
// }
```

2. Or remove the middleware entirely (not recommended)

## 🔍 Troubleshooting

### "Authentication Required" popup keeps appearing
- Check your username/password are correct
- Check `.env.local` has the right values
- Restart dev server after changing `.env.local`

### Can't access admin pages
- Ensure middleware is enabled
- Check browser console for errors
- Try in incognito/private window

### Want to use a different auth method?
Consider implementing:
- NextAuth for session-based auth
- JWT tokens for API authentication
- OAuth (Google, GitHub) for social login

## 📧 Support

For issues or questions about admin authentication:
- Check `src/middleware.ts` for implementation
- Review Next.js middleware docs
- See `docs/ANALYTICS_DASHBOARD.md` for dashboard details

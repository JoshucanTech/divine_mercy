# 🚀 Quick Start Checklist

Follow these steps to get the voting platform running in minutes.

## Step 1: Prerequisites ✅

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] PostgreSQL database ready (local, Neon, or Railway)
- [ ] Database URL ready

## Step 2: Setup Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values
```

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string

**Optional (for Flutterwave):**
- `FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_KEY`

The `NEXTAUTH_SECRET` is pre-filled but should be regenerated for production:
```bash
openssl rand -base64 32
```

## Step 3: Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- Next.js 16
- Prisma ORM
- NextAuth.js
- shadcn/ui components
- TailwindCSS

## Step 4: Database Setup

```bash
# Option A: If this is a fresh database, run migrations
pnpm db:migrate

# Option B: If using an existing setup
pnpm db:push
```

## Step 5: Initialize Data

```bash
# Create default settings and admin user
pnpm db:init
```

This creates:
- ✅ Default voting settings (100 NGN per vote)
- ✅ Default admin user (admin@example.com / admin123)

## Step 6: Start Development

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

## 🧪 Test the App

### Public Voting
1. Visit `http://localhost:3000`
2. Click "Add Contestant" (you'll need to log in first) OR
3. Check if demo contestants exist from previous testing

### Admin Dashboard
1. Go to `http://localhost:3000/admin/login`
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Create a test contestant
4. Visit home page and vote for them

### Real-time Updates
1. Open leaderboard in two browser windows
2. Cast a vote in one window
3. Watch the vote count update in the other window (SSE)

## 🔧 Useful Commands

```bash
# View/edit database directly
pnpm db:studio

# Run database migrations
pnpm db:migrate

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check
```

## 🎨 Customize Your Setup

### Change Vote Cost
1. Go to Admin Dashboard → Settings
2. Update "Vote Cost"
3. Click "Save Settings"

### Change Currency
1. Go to Admin Dashboard → Settings
2. Update "Currency Code" (e.g., USD, EUR, GBP)
3. Click "Save Settings"

### Enable/Disable Voting
1. Go to Admin Dashboard → Settings
2. Toggle "Voting is Active"
3. Click "Save Settings"

### Change Admin Password
1. Access Prisma Studio: `pnpm db:studio`
2. Click "AdminUser" table
3. Delete the old user
4. Run `pnpm db:init` to recreate default user
5. Update credentials in code or manually create new user

## 💳 Add Flutterwave Payments

When ready to accept real payments:

1. Create Flutterwave account: https://dashboard.flutterwave.com
2. Get API keys from Settings → API
3. Update `.env.local`:
   ```
   FLUTTERWAVE_PUBLIC_KEY=your_key
   FLUTTERWAVE_SECRET_KEY=your_secret
   ```
4. Implement payment endpoint in `/app/api/vote/initiate/route.ts`
5. Update webhook handler in `/app/api/webhook/flutterwave/route.ts`

## 📱 Test on Mobile

```bash
# Get your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile device
http://YOUR_IP:3000
```

## 🚨 Common Issues

### "Database connection failed"
```bash
# Test your connection string
psql YOUR_DATABASE_URL

# Verify DATABASE_URL in .env.local
```

### "Admin login not working"
```bash
# Check admin user exists
pnpm db:studio

# Recreate admin user
pnpm db:init
```

### "SSE not updating"
- Refresh browser
- Check browser console for errors
- Verify internet connection
- Try incognito mode

### "Build fails"
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

## 📚 Next Steps

- [ ] Read [README.md](./README.md) for full documentation
- [ ] Read [SETUP.md](./SETUP.md) for detailed configuration
- [ ] Customize branding and colors
- [ ] Add real contestants
- [ ] Integrate Flutterwave payments
- [ ] Deploy to Vercel or your preferred platform

## 🆘 Need Help?

1. Check the error message carefully
2. Review the relevant documentation file
3. Check browser console (F12)
4. Check server logs in terminal
5. Review database with `pnpm db:studio`

---

**You're all set!** 🎉

The voting platform is running locally and ready for development.

Next: Customize it for your use case and deploy!

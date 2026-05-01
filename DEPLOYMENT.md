# 🚀 Deployment Guide

Complete guide to deploying the voting platform to production.

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] Admin password changed from default
- [ ] Flutterwave keys added (if using payments)
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting reviewed
- [ ] Database indexed optimally

## Deployment Options

## Option 1: Vercel (Recommended)

### Setup

1. Push code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/voting-platform.git
git push -u origin main
```

2. Import in Vercel
   - Go to https://vercel.com/import
   - Select your GitHub repository
   - Click "Import"

3. Configure Environment Variables
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET` (generate new: `openssl rand -base64 32`)
     - `NEXTAUTH_URL` (your production domain)
     - `FLUTTERWAVE_PUBLIC_KEY`
     - `FLUTTERWAVE_SECRET_KEY`

4. Configure Domains
   - Go to Settings → Domains
   - Add your custom domain
   - Update `NEXTAUTH_URL` to your domain

5. Deploy
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Database Setup (Vercel Postgres)

Use Vercel's hosted PostgreSQL:

1. In Vercel project, go to Storage → Create Database
2. Select PostgreSQL
3. Copy connection string to `DATABASE_URL`
4. Run migrations: `vercel env pull` then `pnpm db:migrate`

### Automatic Deployments

Every git push to main automatically deploys:
- Set in Vercel dashboard → Settings → Git
- Automatic deployments from push are enabled by default

## Option 2: AWS (EC2 + RDS)

### Prerequisites
- AWS Account
- EC2 instance (t3.micro or larger)
- RDS PostgreSQL database

### Steps

1. Launch EC2 Instance
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js and pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

2. Setup Application
```bash
git clone https://github.com/yourusername/voting-platform.git
cd voting-platform
pnpm install
```

3. Configure Environment
```bash
nano .env.production
# Add all production variables
```

4. Setup Database
```bash
pnpm db:migrate
pnpm db:seed
```

5. Build & Run
```bash
pnpm build
pnpm start
```

6. Use PM2 for Process Management
```bash
npm install -g pm2
pm2 start "pnpm start" --name "voting-app"
pm2 startup
pm2 save
```

7. Setup Nginx Reverse Proxy
```bash
sudo yum install nginx
sudo systemctl start nginx

# Configure /etc/nginx/nginx.conf to proxy to localhost:3000
```

## Option 3: Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy source
COPY . .

# Build
RUN pnpm build

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  voting-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/voting
      NEXTAUTH_SECRET: your-secret
      NEXTAUTH_URL: https://yourdomain.com
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: voting
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy

```bash
docker-compose build
docker-compose up -d
```

## Option 4: Railway.app

1. Connect GitHub repository
2. Create PostgreSQL database
3. Add environment variables
4. Deploy automatically

See: https://docs.railway.app/getting-started

## Option 5: Traditional VPS (DigitalOcean, Linode, etc.)

1. SSH into server
2. Install Node.js, PostgreSQL
3. Clone repository
4. Setup .env
5. Run migrations
6. Use PM2 or systemd for process management
7. Setup nginx reverse proxy
8. Configure SSL (Let's Encrypt)

## Post-Deployment

### 1. Setup Monitoring

```bash
# Install monitoring
pm2 install pm2-auto-pull
pm2 install pm2-logrotate
```

### 2. Setup Backups

```bash
# Backup database daily
0 2 * * * pg_dump $DATABASE_URL > /backups/voting-$(date +\%Y\%m\%d).sql
```

### 3. Enable SSL/HTTPS

```bash
# Using Let's Encrypt
sudo certbot certonly --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

### 4. Configure Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 5. Setup Logging

```bash
# Check application logs
pm2 logs voting-app

# Setup centralized logging (optional)
# Use Datadog, New Relic, or LogRocket
```

### 6. Monitor Database

```bash
# Verify database health
psql $DATABASE_URL -c "SELECT version();"

# Check table sizes
psql $DATABASE_URL -c "\dt+ ;"
```

## Production Configuration

### Environment Variables Checklist

```env
# Database (required)
DATABASE_URL="postgresql://user:pass@host:5432/voting"

# NextAuth (required)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"

# Flutterwave (for payments)
FLUTTERWAVE_PUBLIC_KEY="pk_live_xxx"
FLUTTERWAVE_SECRET_KEY="sk_live_xxx"

# Optional
NODE_ENV="production"
LOG_LEVEL="info"
```

### Performance Tuning

```typescript
// Increase cache
export const revalidate = 3600 // 1 hour for ISR

// Optimize images
{/* Image optimization in Next.js */}
<Image
  src="/image.jpg"
  alt="..."
  priority={true}
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// Database connection pooling
// Configure in Prisma schema
```

### Security Hardening

1. **CORS Configuration**
```typescript
// In route handler
const headers = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}
```

2. **Rate Limiting**
- Upgrade to Upstash Redis for distributed rate limiting
- Configure per-IP limits for voting endpoint

3. **CSRF Protection**
- NextAuth includes CSRF tokens by default

4. **Input Validation**
- All endpoints use Zod validation

5. **SQL Injection**
- Protected by Prisma ORM

## Rollback Plan

If deployment goes wrong:

```bash
# Revert code
git revert HEAD
git push

# In Vercel: Auto-redeploy from main

# For manual deployments:
pm2 restart voting-app
```

## Health Checks

### Setup Monitoring

```bash
# Vercel: Automatically monitored
# Custom: Create health check endpoint

# GET /api/health
{
  "status": "ok",
  "uptime": 3600,
  "database": "connected"
}
```

## Scaling

As traffic grows:

1. **Vertical Scaling**
   - Increase instance size
   - Upgrade database tier

2. **Horizontal Scaling**
   - Use load balancer
   - Multiple instances
   - Upgrade rate limiting to Redis

3. **Database Optimization**
   - Add indexes
   - Archive old transactions
   - Enable query caching

4. **CDN**
   - Serve static assets from CDN
   - Cache leaderboard (5 min)

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

### Database Connection Error
```bash
# Test connection
psql $DATABASE_URL

# Verify credentials
echo $DATABASE_URL
```

### SSE Not Working
- Check firewall allows long-lived connections
- Verify browser supports EventSource
- Check for proxy timeout (increase to 120s)

### Webhook Not Received
- Verify webhook URL is public
- Check Flutterwave IP whitelist
- Review firewall rules
- Check logs for errors

## Support

- **Vercel**: https://vercel.com/help
- **Railway**: https://docs.railway.app
- **AWS**: https://aws.amazon.com/support
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs

---

**Deployed successfully?** 🎉

Monitor your deployment and enjoy your live voting platform!

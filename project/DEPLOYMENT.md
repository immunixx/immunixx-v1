# Deployment Guide

## Overview

This guide covers deploying the AI WBC Analyzer to production. The application consists of two parts:
1. **Frontend**: React application (static files)
2. **Backend**: FastAPI Python server

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel

1. **Prepare the project**:
```bash
npm run build
```

2. **Install Vercel CLI**:
```bash
npm install -g vercel
```

3. **Deploy**:
```bash
vercel
```

4. **Configure environment variables**:
- In Vercel dashboard, add:
  - `VITE_API_BASE_URL`: Your backend URL

5. **Set build settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Deploy Backend to Railway

1. **Create account**: Go to railway.app

2. **Create new project**:
- Click "New Project"
- Choose "Deploy from GitHub" or "Empty Project"

3. **Add backend files**:
- Upload backend directory
- Ensure requirements.txt is present

4. **Configure**:
- Runtime: Python
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Add build command** (if needed):
```bash
pip install -r requirements.txt
```

6. **Environment variables**:
- Railway will automatically set PORT
- Add any custom variables if needed

7. **Deploy**:
- Railway will provide a URL like: `https://your-app.railway.app`

8. **Update frontend**:
- Set `VITE_API_BASE_URL` in Vercel to your Railway URL

---

### Option 2: Netlify (Frontend) + Heroku (Backend)

#### Deploy Frontend to Netlify

1. **Build the project**:
```bash
npm run build
```

2. **Drag and drop**:
- Go to netlify.com
- Drag the `dist` folder to deploy

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Environment variables**:
- In Netlify dashboard, add:
  - `VITE_API_BASE_URL`: Your backend URL

#### Deploy Backend to Heroku

1. **Install Heroku CLI**:
```bash
brew install heroku/brew/heroku  # macOS
# Or download from heroku.com
```

2. **Login**:
```bash
heroku login
```

3. **Create app**:
```bash
cd backend
heroku create your-app-name
```

4. **Add Procfile**:
```bash
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
```

5. **Add runtime.txt**:
```bash
echo "python-3.11.0" > runtime.txt
```

6. **Deploy**:
```bash
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a your-app-name
git push heroku main
```

7. **Verify**:
```bash
heroku open
```

---

### Option 3: DigitalOcean App Platform

#### Deploy Full Stack

1. **Create account**: digitalocean.com

2. **Create new app**:
- Click "Create" → "Apps"
- Connect GitHub repository

3. **Configure frontend**:
- Type: Static Site
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL`: `/api` (use same domain)

4. **Configure backend**:
- Type: Web Service
- Build Command: `pip install -r requirements.txt`
- Run Command: `uvicorn main:app --host 0.0.0.0 --port 8080`
- HTTP Port: 8080
- Source Directory: `backend`

5. **Deploy**:
- DigitalOcean will build and deploy both

---

### Option 4: AWS (Advanced)

#### Frontend: S3 + CloudFront

1. **Build**:
```bash
npm run build
```

2. **Create S3 bucket**:
- Bucket name: `wbc-analyzer-frontend`
- Enable static website hosting

3. **Upload files**:
```bash
aws s3 sync dist/ s3://wbc-analyzer-frontend --acl public-read
```

4. **Create CloudFront distribution**:
- Origin: Your S3 bucket
- Enable HTTPS

5. **Get CloudFront URL**:
- Use this as your frontend URL

#### Backend: EC2 or Lambda

**Using EC2**:

1. **Launch EC2 instance**:
- Ubuntu 22.04 LTS
- t2.micro (free tier)

2. **SSH into instance**:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install dependencies**:
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx
```

4. **Clone/upload backend files**:
```bash
mkdir /home/ubuntu/backend
cd /home/ubuntu/backend
# Upload your files
```

5. **Install Python packages**:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

6. **Run with supervisor**:
```bash
sudo apt install supervisor
```

Create supervisor config:
```ini
[program:wbc-backend]
command=/home/ubuntu/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
directory=/home/ubuntu/backend
user=ubuntu
autostart=true
autorestart=true
```

7. **Configure nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

8. **Enable HTTPS with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=https://api.your-domain.com
```

### Backend
No environment variables needed for basic setup. For production, add:
```env
ALLOWED_ORIGINS=https://your-frontend-domain.com
MAX_UPLOAD_SIZE=10485760
```

---

## Domain Configuration

### Custom Domain

1. **Buy domain**: Namecheap, GoDaddy, etc.

2. **DNS Configuration**:
```
Type: A
Name: @
Value: [Your server IP]

Type: CNAME
Name: api
Value: [Your backend URL]
```

3. **SSL Certificate**:
- Use Let's Encrypt (free)
- Or use platform's built-in SSL

---

## Production Checklist

### Security

- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Implement authentication (if needed)
- [ ] Sanitize file uploads
- [ ] Add CSP headers
- [ ] Enable HSTS

### Performance

- [ ] Enable gzip compression
- [ ] Add CDN for static assets
- [ ] Optimize images
- [ ] Enable caching headers
- [ ] Minify CSS/JS (done by Vite)
- [ ] Use production build

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Add performance monitoring

### Backup

- [ ] Backup analysis data
- [ ] Backup uploaded images
- [ ] Backup generated reports
- [ ] Document recovery procedures

---

## Cost Estimates

### Free Tier Options
- **Vercel**: Free for hobby projects
- **Netlify**: Free for small projects
- **Railway**: $5/month after free trial
- **Heroku**: Free tier discontinued, starts at $7/month

### Paid Options
- **DigitalOcean**: $5-10/month
- **AWS**: $10-20/month (varies)
- **Azure**: Similar to AWS
- **Google Cloud**: Similar to AWS

---

## Scaling Considerations

### Traffic Growth

**Low Traffic** (< 1000 requests/day):
- Single server setup sufficient
- Use free tier options

**Medium Traffic** (1000-10000 requests/day):
- Use CDN for frontend
- Scale backend vertically
- Consider caching

**High Traffic** (> 10000 requests/day):
- Load balancer
- Multiple backend instances
- Redis for caching
- Database for storage
- Queue for async processing

### Database Integration

For production, consider adding database:
```bash
# Add to requirements.txt
sqlalchemy
asyncpg  # for PostgreSQL
```

Store:
- Analysis history
- User data
- Generated reports metadata

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests
      # Deploy to your hosting provider
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check uptime

**Weekly**:
- Review analytics
- Check storage usage
- Update dependencies

**Monthly**:
- Security updates
- Performance optimization
- Backup verification

### Updates

```bash
# Frontend dependencies
npm update
npm audit fix

# Backend dependencies
pip list --outdated
pip install --upgrade package-name
```

---

## Troubleshooting Production

### Common Issues

**Issue**: 502 Bad Gateway
- Check backend is running
- Verify port configuration
- Check firewall rules

**Issue**: CORS errors
- Update ALLOWED_ORIGINS
- Check headers configuration

**Issue**: Slow performance
- Enable caching
- Use CDN
- Optimize images
- Add database indexes

### Monitoring Tools

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry, Rollbar
- **Analytics**: Google Analytics, Plausible
- **Performance**: New Relic, DataDog

---

## Support

For deployment help:
1. Check platform-specific documentation
2. Review error logs
3. Test locally first
4. Use staging environment

---

## Next Steps

After deployment:
1. Test all features
2. Set up monitoring
3. Configure backups
4. Document your setup
5. Plan for scaling

Remember: This is an educational/research tool. For clinical use, additional regulatory compliance would be required.

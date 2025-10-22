# Sprint100 Quick Deploy Guide

## 🚀 One-Command Deployment

### Render (Recommended - Easiest)
```bash
# 1. Connect GitHub repo to Render
# 2. Set environment variables in Render dashboard
# 3. Deploy automatically on git push
npm run deploy:render
```

### Railway (Modern Platform)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
npm run deploy:railway
```

### Heroku (Established Platform)
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Deploy
npm run deploy:heroku
```

### Docker (Self-Hosting)
```bash
# Deploy with Docker Compose
npm run deploy:docker
```

## 🔧 Environment Variables

### Required for Production:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/sprint100
JWT_SECRET=your_secure_jwt_secret_here
ALLOWED_ORIGINS=https://your-domain.com
```

### Optional:
```bash
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
ENABLE_REQUEST_LOGGING=false
```

## 📋 Pre-Deployment Checklist

- [ ] **Environment Variables**: All required variables set
- [ ] **Database**: PostgreSQL instance created
- [ ] **JWT Secret**: Strong, unique secret (32+ characters)
- [ ] **CORS**: Specific allowed origins (not *)
- [ ] **HTTPS**: SSL certificate configured
- [ ] **Domain**: Custom domain configured (optional)

## 🎯 Post-Deployment Verification

### Health Checks:
```bash
# Check server health
curl https://your-api.com/health

# Check database connectivity
curl https://your-api.com/ready
```

### Database:
```bash
# Check migration status
npx prisma migrate status

# View database
npx prisma studio
```

## 🚨 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version and dependencies
2. **Database Connection**: Verify DATABASE_URL and SSL settings
3. **Memory Issues**: Increase memory limits for large applications
4. **CORS Errors**: Check ALLOWED_ORIGINS configuration

### Debug Commands:
```bash
# Check logs
heroku logs --tail        # Heroku
railway logs              # Railway
docker-compose logs -f    # Docker

# Test database
npx prisma db pull

# Check environment
echo $DATABASE_URL
```

## 📊 Performance Tips

### Production Optimization:
- Use connection pooling for database
- Enable gzip compression
- Set appropriate rate limits
- Monitor memory usage
- Use CDN for static assets

### Monitoring:
- Set up uptime monitoring
- Configure log aggregation
- Monitor database performance
- Set up alerts for errors

---

**💡 Pro Tip**: Start with Render for simplicity, then migrate to Railway or Heroku for advanced features. Use Docker for full control.

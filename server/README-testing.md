# Server Testing & Deployment Guide

This guide explains how to deploy or run a publicly-reachable test server for external testers.

## Quick Start for Testers

### Option 1: Use a Hosted Test Server (Recommended)

If you have access to a deployed test server:

1. Update your `.env` file with the test server URL:
   ```bash
   SERVER_URL=https://your-test-server.com
   TEST_SERVER_URL=https://your-test-server.com
   APP_ENV=test
   ```

2. Run the client with tunnel mode:
   ```bash
   cd client
   npx expo start --tunnel
   ```

### Option 2: Expose Local Server with ngrok

If you need to expose your local development server:

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your local server:
   ```bash
   cd server
   npm run dev
   ```

3. In another terminal, expose port 4000:
   ```bash
   ngrok http 4000
   ```

4. Copy the public URL (e.g., `https://abc123.ngrok.io`) and update your `.env`:
   ```bash
   SERVER_URL=https://abc123.ngrok.io
   TEST_SERVER_URL=https://abc123.ngrok.io
   APP_ENV=test
   ```

5. Start the client with tunnel:
   ```bash
   cd client
   npx expo start --tunnel
   ```

## Security Notes

⚠️ **Important Security Considerations:**

- The test server should use a separate database from production
- Use development JWT secrets, not production secrets
- Consider rate limiting for public access
- Monitor server logs for unusual activity
- The test server is for testing only - do not use for production traffic

## Environment Variables

For test deployment, ensure these environment variables are set:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database (use separate test database)
DATABASE_URL="file:./test.db"

# JWT Secret (use development secret)
JWT_SECRET="dev_secret_for_testing"

# CORS (allow external connections)
CORS_ORIGIN="*"
```

## Deployment Options

### Heroku (Simple)
```bash
# Install Heroku CLI, then:
heroku create sprint100-test
heroku config:set JWT_SECRET="dev_secret_for_testing"
heroku config:set NODE_ENV="development"
git push heroku main
```

### Railway
```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically on push
```

### DigitalOcean App Platform
```bash
# Connect GitHub repo
# Configure build settings
# Set environment variables
# Deploy
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure CORS is configured to allow your client domain
2. **Database Issues**: Make sure the test database is properly initialized
3. **Port Conflicts**: Ensure port 4000 is available or change the PORT environment variable
4. **Network Issues**: Use `--tunnel` mode for Expo client to handle network connectivity

### Testing Connectivity:

```bash
# Test server connectivity
curl https://your-test-server.com/api/health

# Test database connection
curl https://your-test-server.com/api/users
```

## Monitoring

For test servers, consider basic monitoring:

- Server uptime
- Response times
- Error rates
- Database connection status

Use tools like:
- Uptime monitoring services
- Application performance monitoring (APM)
- Basic logging and alerting

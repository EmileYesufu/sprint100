# sprint100

## Testing / External Testers

This repository is prepared for external testers to easily run and test the Sprint100 app without affecting the main development workflow.

### Quick Start for Testers

1. **Clone and Setup:**
   ```bash
   git clone <repository-url>
   cd sprint100
   cp .env.example .env
   npm run testers:install
   ```

2. **Configure Environment:**
   - Edit `.env` to set `SERVER_URL` to your test server
   - For external access, use `APP_ENV=test` and `TEST_SERVER_URL`

3. **Start Testing:**
   ```bash
   # For external testers (recommended)
   cd client
   npx expo start --tunnel
   
   # Or use the helper script
   npm run testers:start
   ```

### Environment Configuration

- **`.env.example`** - Template with all required variables
- **`.env.test`** - Example configuration for testers
- **`.env`** - Your local configuration (not committed to git)

### Using Expo Tunnel for External Testers

The `--tunnel` mode is recommended for external testers as it creates a public URL that works from anywhere:

```bash
cd client
npx expo start --tunnel
```

Share the QR code link with testers who have Expo Go installed.

### Exposing Local Server

If you need to expose your local development server for testing:

```bash
# Install ngrok globally
npm install -g ngrok

# Start your server
cd server && npm run dev

# In another terminal, expose port 4000
ngrok http 4000

# Update .env with the ngrok URL
SERVER_URL=https://abc123.ngrok.io
```

### Tester Documentation

See **[TESTER_README.md](./TESTER_README.md)** for comprehensive testing instructions, troubleshooting, and feature testing checklists.

### Server Deployment

See **[server/README-testing.md](./server/README-testing.md)** for guidance on deploying a test server for external access.

### Developer Workflow Unchanged

**Important:** The default developer workflow remains unchanged. Run `npm run dev` in the server directory to continue your current testing. The tester flow is opt-in and uses separate environment settings.

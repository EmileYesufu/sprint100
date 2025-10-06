# 🚀 Sprint100 Server Setup Checklist

## ✅ **Prerequisites**
- [ ] Node.js installed (v24.9.0+)
- [ ] npm package manager
- [ ] Git repository cloned
- [ ] VS Code (optional but recommended)

## 📁 **Project Structure**
```
sprint100/
├── server/                 # Node.js/Express backend
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   └── utils/
│   │       └── elo.ts      # ELO calculation utility
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── dev.db         # SQLite database
│   ├── package.json        # Dependencies & scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── .env               # Environment variables
├── client/                 # Expo React Native app
└── .vscode/               # VS Code configuration
```

## 🔧 **Server Configuration**

### **Environment Variables (.env)**
```bash
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (change in production!)
JWT_SECRET="dev_secret_key_change_in_production"

# Server
PORT=4000
```

### **Dependencies Installed**
- [ ] express - Web framework
- [ ] socket.io - Real-time communication
- [ ] cors - Cross-origin resource sharing
- [ ] bcryptjs - Password hashing
- [ ] jsonwebtoken - JWT token handling
- [ ] prisma & @prisma/client - Database ORM
- [ ] typescript - TypeScript compiler
- [ ] ts-node-dev - Development server

## 🗄️ **Database Setup**

### **Prisma Configuration**
- [ ] Schema created with User, Match, MatchPlayer models
- [ ] SQLite database (dev.db) created
- [ ] Prisma client generated
- [ ] Database tables created

### **Database Models**
- [ ] **User**: id, email, password, elo, createdAt
- [ ] **Match**: id, createdAt, duration
- [ ] **MatchPlayer**: id, matchId, userId, finishPosition, timeMs, deltaElo

## 🚀 **Development Scripts**

### **Available Commands**
```bash
# Development
npm run dev              # Start server with hot-reload
npm run build           # Compile TypeScript
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
```

## 🔐 **Authentication System**

### **API Endpoints**
- [ ] `POST /api/register` - User registration
- [ ] `POST /api/login` - User authentication
- [ ] JWT token generation and validation
- [ ] Secure password hashing with bcryptjs

### **Socket.io Authentication**
- [ ] JWT middleware for socket connections
- [ ] User context attached to socket
- [ ] Authentication error handling

## 🏃‍♂️ **Racing Game Features**

### **Real-time Communication**
- [ ] Socket.io server configured
- [ ] CORS enabled for client connections
- [ ] Matchmaking queue system
- [ ] Race state management

### **Game Logic**
- [ ] ELO rating calculation
- [ ] Match creation and management
- [ ] Player progress tracking
- [ ] Race completion detection
- [ ] ELO updates after matches

## 🧪 **Testing Checklist**

### **Server Startup**
- [ ] Server starts without errors
- [ ] Database connection established
- [ ] Socket.io server running
- [ ] API endpoints responding

### **API Testing**
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens generated correctly
- [ ] Database records created

### **Socket.io Testing**
- [ ] Client can connect with valid token
- [ ] Queue join/leave functionality
- [ ] Match creation works
- [ ] Race updates transmitted
- [ ] Match completion handled

## 🚀 **VS Code Integration**

### **Launch Configurations**
- [ ] "Run Server (ts-node-dev)" - F5 to start server
- [ ] "Start Expo" - F5 to start client

### **Tasks Available**
- [ ] Server: Install Dependencies
- [ ] Server: Generate Prisma Client
- [ ] Server: Push Database Schema
- [ ] Server: Open Prisma Studio

## 🔄 **Development Workflow**

### **Daily Development**
1. [ ] Start server: `npm run dev` or F5 → "Run Server"
2. [ ] Start client: `npm start` or F5 → "Start Expo"
3. [ ] Test authentication flow
4. [ ] Test matchmaking and racing
5. [ ] Check database with Prisma Studio

### **Database Management**
1. [ ] Modify schema in `prisma/schema.prisma`
2. [ ] Run `npm run db:push` to apply changes
3. [ ] Run `npm run db:generate` to update client
4. [ ] Use `npm run db:studio` to inspect data

## ⚠️ **Production Considerations**

### **Security**
- [ ] Change JWT_SECRET in production
- [ ] Use environment-specific database URLs
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization

### **Scaling**
- [ ] Replace in-memory queue with Redis
- [ ] Implement persistent match state
- [ ] Add reconnection handling
- [ ] Implement anti-cheat measures

## 🎯 **Ready for Development!**

Your Sprint100 server is now fully configured and ready for:
- ✅ Real-time multiplayer racing
- ✅ ELO-based competitive rankings
- ✅ User authentication and management
- ✅ Database persistence
- ✅ VS Code development workflow

**Next Steps:**
1. Start the server: `npm run dev`
2. Start the client: `npm start`
3. Test the complete racing game flow!

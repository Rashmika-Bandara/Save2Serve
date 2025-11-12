# Save2Serve - Docker Deployment Guide (WSL)

## Prerequisites

Before you begin, ensure you have:
- ✅ Docker Desktop for Windows installed and running
- ✅ WSL 2 enabled
- ✅ Docker integration with WSL enabled in Docker Desktop settings

## Step-by-Step Guide to Build and Run

### 1. Open WSL Terminal

Open your WSL terminal (Ubuntu or your preferred distribution):

```bash
# Open WSL
wsl
```

### 2. Navigate to Project Directory

```bash
# Navigate to your project folder
cd /mnt/c/Users/User/Desktop/Save2Serve
```

### 3. Clean Up Previous Builds (Optional but Recommended)

If you've run Docker before, clean up old containers and images:

```bash
# Stop and remove all containers
docker-compose down

# Remove all unused containers, networks, and images (optional)
docker system prune -a

# Remove specific project volumes if needed
docker volume rm save2serve_mongo_data
```

### 4. Build the Docker Images

Build all services (frontend, backend, and MongoDB):

```bash
# Build all services
docker-compose build

# Or build with no cache (if you made changes)
docker-compose build --no-cache
```

### 5. Start All Services

Start all containers in detached mode (runs in background):

```bash
# Start all services
docker-compose up -d
```

### 6. Check Container Status

Verify that all containers are running:

```bash
# View running containers
docker-compose ps

# Or use docker ps
docker ps
```

You should see three containers running:
- `save2serve-frontend` (port 3000)
- `save2serve-backend` (port 4000)
- `save2serve-mongo` (port 27017)

### 7. View Logs

Check logs to ensure everything is working:

```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongo

# Follow logs in real-time
docker-compose logs -f
```

### 8. Access Your Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Backend Health Check**: http://localhost:4000/health

### 9. Test the Application

1. Go to http://localhost:3000
2. Click "Create New Account"
3. Fill in the Sign Up form
4. Choose your role (Buyer or Seller)
5. Sign up and then log in
6. You should be redirected to the appropriate dashboard

## Useful Docker Commands

### Managing Containers

```bash
# Stop all services
docker-compose stop

# Start stopped services
docker-compose start

# Restart all services
docker-compose restart

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes database data)
docker-compose down -v
```

### Viewing Logs

```bash
# View last 100 lines of logs
docker-compose logs --tail=100

# Follow logs for specific service
docker-compose logs -f backend

# View logs since specific time
docker-compose logs --since 10m
```

### Accessing Containers

```bash
# Access backend container shell
docker exec -it save2serve-backend sh

# Access MongoDB shell
docker exec -it save2serve-mongo mongosh

# Inside MongoDB shell, check database
use Save2Serve
show collections
db.users.find()
```

### Rebuilding After Code Changes

```bash
# Rebuild and restart specific service
docker-compose up -d --build backend

# Rebuild all services
docker-compose up -d --build
```

### Checking Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## Troubleshooting

### If containers won't start:

1. **Check if ports are in use:**
   ```bash
   # Check if port 3000 is in use
   netstat -ano | findstr :3000
   
   # Check if port 4000 is in use
   netstat -ano | findstr :4000
   ```

2. **View detailed logs:**
   ```bash
   docker-compose logs backend
   ```

3. **Rebuild from scratch:**
   ```bash
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up -d
   ```

### If MongoDB connection fails:

```bash
# Check MongoDB is running
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### If frontend can't connect to backend:

1. Check backend is running: http://localhost:4000/health
2. View backend logs: `docker-compose logs backend`
3. Ensure CORS is configured correctly

## Development vs Production

### For Development (Hot Reload):

Instead of Docker, you can run services individually:

```bash
# Terminal 1 - Start MongoDB only
docker-compose up mongo

# Terminal 2 - Start Backend (in backend folder)
cd backend
npm install
npm start

# Terminal 3 - Start Frontend (in frontend folder)
cd frontend
npm install
npm start
```

### For Production:

Use Docker Compose as described in this guide.

## Stopping the Application

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove all containers
docker-compose down

# Stop and remove everything including database
docker-compose down -v
```

## Quick Commands Cheat Sheet

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart after changes
docker-compose restart

# Clean everything
docker-compose down -v && docker system prune -a
```

## Success Indicators

✅ All three containers are "Up" in `docker-compose ps`
✅ Backend health check returns: http://localhost:4000/health
✅ Frontend loads at: http://localhost:3000
✅ You can create an account and log in
✅ No errors in `docker-compose logs`

---

**Happy Coding! 🚀**

For issues, check the logs first: `docker-compose logs -f`

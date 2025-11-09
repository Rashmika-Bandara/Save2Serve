# Save2Serve Application

A full-stack web application with React frontend, Node.js/Express backend, and MongoDB database.

## 🏗️ Architecture

- **Frontend**: React + Nginx (Port 3000 → 80)
- **Backend**: Node.js + Express (Port 4000)
- **Database**: MongoDB (Port 27017)

## 📋 Prerequisites

### Option 1: Docker (Recommended for Production)
- Docker Desktop for Windows
- Docker Compose

### Option 2: Local Development
- Node.js 18+
- MongoDB Community Server
- MongoDB Compass (optional, for GUI)

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Start all services:**
   ```powershell
   docker compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MongoDB: mongodb://localhost:27017

3. **Stop services:**
   ```powershell
   docker compose down
   ```

4. **Stop and remove data:**
   ```powershell
   docker compose down -v
   ```

---

### Local Development (Without Docker)

#### 1. Start MongoDB Service
```powershell
net start MongoDB
```

#### 2. Start Backend
```powershell
cd backend
npm install
node app.js
```

#### 3. Start Frontend
```powershell
cd frontend
npm install
npm start
```

#### 4. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- MongoDB Compass: mongodb://localhost:27017

---

## 📁 Project Structure

```
Save2Serve/
├── backend/
│   ├── Controllers/
│   │   └── authController.js
│   ├── Models/
│   │   └── User.js
│   ├── Routes/
│   │   └── auth.js
│   ├── app.js
│   ├── Dockerfile
│   ├── init-db.js
│   ├── test-connection.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── Login.js
│   │   └── SignUp.js
│   ├── Dockerfile
│   └── package.json
├── mongo-init/
│   └── init-mongo.js
├── docker-compose.yaml
└── README.md
```

---

## 🗄️ Database Schema

### Database: `Save2Serve`

### Collection: `users`

| Field      | Type   | Required | Unique | Description        |
|------------|--------|----------|--------|--------------------|
| fullName   | String | Yes      | No     | User's full name   |
| goodName   | String | Yes      | No     | User's good name   |
| email      | String | Yes      | Yes    | User's email       |
| password   | String | Yes      | No     | Hashed password    |
| phone      | String | Yes      | No     | Phone number       |
| dob        | Date   | Yes      | No     | Date of birth      |
| role       | String | Yes      | No     | 'Seller' or 'Buyer'|

---

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory (optional):

```env
MONGO_URI=mongodb://127.0.0.1:27017/Save2Serve
PORT=4000
NODE_ENV=development
JWT_SECRET=yoursecretkey
```

### MongoDB Connection

- **Docker**: `mongodb://mongo:27017/Save2Serve`
- **Local**: `mongodb://127.0.0.1:27017/Save2Serve`

---

## 🐳 Docker Images

### Build Individual Images

**Backend:**
```powershell
docker build -t save2serve-backend ./backend
```

**Frontend:**
```powershell
docker build -t save2serve-frontend ./frontend
```

**MongoDB:**
```powershell
docker pull mongo:6
```

### Run Individual Containers

**MongoDB:**
```powershell
docker run -d --name save2serve-mongo -p 27017:27017 -v mongo_data:/data/db mongo:6
```

**Backend:**
```powershell
docker run -d --name save2serve-backend -p 4000:4000 -e MONGO_URI=mongodb://mongo:27017/Save2Serve save2serve-backend
```

**Frontend:**
```powershell
docker run -d --name save2serve-frontend -p 3000:80 save2serve-frontend
```

---

## 🔍 Testing & Debugging

### Test MongoDB Connection
```powershell
cd backend
node test-connection.js
```

### Initialize Database
```powershell
cd backend
node init-db.js
```

### View Docker Logs
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

### Access MongoDB Shell
```powershell
docker exec -it save2serve-mongo mongosh
```

Then:
```javascript
use Save2Serve
show collections
db.users.find().pretty()
db.users.countDocuments()
```

---

## 📊 MongoDB Compass

### Connection String
```
mongodb://localhost:27017
```

### Operations
- View all users in `Save2Serve` → `users` collection
- Filter users: `{ "role": "Seller" }`
- Search by email: `{ "email": "user@example.com" }`

---

## 🛠️ Common Issues & Solutions

### Issue: Backend can't connect to MongoDB
**Solution:**
- Check if MongoDB service is running: `Get-Service MongoDB`
- Start MongoDB: `net start MongoDB`
- Use IPv4 address: `mongodb://127.0.0.1:27017/Save2Serve`

### Issue: ERR_CONNECTION_REFUSED on port 4000
**Solution:**
- Ensure backend is running: `node app.js` in backend folder
- Check if port 4000 is available
- Restart backend server

### Issue: Database not showing in Compass
**Solution:**
- MongoDB creates databases only when data is inserted
- Register at least one user through the frontend
- Refresh MongoDB Compass (F5)

### Issue: Docker containers not starting
**Solution:**
- Ensure Docker Desktop is running
- Check for port conflicts: `netstat -ano | findstr :4000`
- Rebuild: `docker compose down -v && docker compose up --build`

---

## 🚦 API Endpoints

### Authentication

**POST** `/api/auth/signup`
```json
{
  "fullName": "John Doe",
  "goodName": "Johnny",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "1234567890",
  "dob": "1990-01-01",
  "role": "Buyer"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

---

## 📝 Development Workflow

1. Make code changes in `backend/` or `frontend/`
2. For Docker: `docker compose up --build`
3. For local: Backend auto-restarts (nodemon), Frontend auto-reloads
4. Test in browser: http://localhost:3000
5. Check MongoDB Compass for data changes

---

## 🎯 Production Deployment

### Build for Production
```powershell
docker compose -f docker-compose.prod.yaml up --build -d
```

### Environment Variables
Set production values:
- `MONGO_URI`: Production MongoDB connection string
- `JWT_SECRET`: Strong secret key
- `NODE_ENV=production`

---

## 👥 Contributors

- Rashmika Bandara

---

## 📄 License

ISC

---

## 🔗 Useful Commands

```powershell
# Docker
docker compose up -d              # Start in background
docker compose down               # Stop containers
docker compose restart backend    # Restart specific service
docker compose logs -f mongo      # Follow MongoDB logs
docker system prune -a            # Clean up Docker

# MongoDB
net start MongoDB                 # Start MongoDB service
net stop MongoDB                  # Stop MongoDB service
mongosh                          # Access MongoDB shell

# Node.js
npm install                      # Install dependencies
npm start                        # Start application
node app.js                      # Run without nodemon
```

---

For more information or support, please contact the development team.

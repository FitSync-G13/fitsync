# FitSync - Personal Training Management System

A modern, cloud-native fitness management platform built with microservices architecture.

[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Python-green)]()
[![Frontend](https://img.shields.io/badge/Frontend-React-61dafb)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)]()
[![Cache](https://img.shields.io/badge/Cache-Redis-dc382d)]()

## Overview

FitSync is a comprehensive personal training management system designed for gyms, trainers, and clients. Built using microservices architecture, it provides a scalable, maintainable solution for managing fitness programs, bookings, progress tracking, and notifications.

**Live System**:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- 6 Backend Microservices (Ports 3001-3005, 8003-8004)

## Key Features

### For Clients
- 📊 Personal dashboard with workout stats and progress
- 📅 Book training sessions with trainers
- 💪 Access assigned workout and diet plans
- 📈 Track body metrics and workout logs
- 🏆 Earn achievements and view analytics
- 🔔 Receive booking and program notifications

### For Trainers
- 📋 Manage client programs and workout plans
- 🗓️ Schedule availability and view bookings
- 📝 Create exercises, workouts, and diet plans
- 👥 Monitor client progress and metrics
- 📊 View booking statistics and schedules

### For Admins & Gym Owners
- 👤 User management (CRUD operations)
- 🏢 Gym management and configuration
- 📊 System-wide analytics and reporting
- 🔧 Full access to all platform features

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Start the Complete System

**Option 1: Docker Compose (Recommended)**
```bash
cd fitsync
docker-compose up -d
```

**Option 2: Using Startup Scripts**

Windows:
```cmd
cd fitsync
start-services.bat
```

Mac/Linux:
```bash
cd fitsync
chmod +x start-all-services.sh
./start-all-services.sh
```

### Access the Application

1. **Frontend**: Open http://localhost:3000
2. **API Gateway**: http://localhost:4000
3. **Quick Login**: Use the quick login buttons on the login page

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fitsync.com | Admin@123 |
| Trainer | trainer@fitsync.com | Trainer@123 |
| Client | client@fitsync.com | Client@123 |
| Gym Owner | gym@fitsync.com | Gym@123 |

## Architecture

FitSync follows a microservices architecture with independent, scalable services:

```
┌─────────────────┐
│  React Frontend │ :3000
└────────┬────────┘
         │
┌────────▼────────┐
│   API Gateway   │ :4000
└────────┬────────┘
         │
    ┌────┴────────────────────────┐
    │                             │
┌───▼────┐  ┌────────┐  ┌────────▼──┐
│  User  │  │Training│  │  Schedule │
│Service │  │Service │  │  Service  │
│ :3001  │  │ :3002  │  │   :8003   │
└───┬────┘  └───┬────┘  └─────┬─────┘
    │           │              │
┌───▼────┐  ┌───▼──────┐  ┌───▼──────┐
│Progress│  │Notification│ │  Redis  │
│Service │  │  Service   │ │  :6379  │
│ :8004  │  │   :3005    │ └─────────┘
└────────┘  └────────────┘
    │
┌───▼──────────────────────┐
│ PostgreSQL Databases (4) │
│ :5432, :5433, :5434, :5435│
└──────────────────────────┘
```

### Services

1. **User Service** (Node.js/Express) - Authentication, user management, RBAC
2. **Training Service** (Node.js/Express) - Exercises, workouts, diets, programs
3. **Schedule Service** (Python/FastAPI) - Bookings, availability, sessions
4. **Progress Service** (Python/FastAPI) - Metrics, logs, analytics, achievements
5. **Notification Service** (Node.js/Express) - Event-driven notifications
6. **API Gateway** (Node.js/Express) - Unified API, rate limiting, JWT validation

## Project Structure

```
fitsync/
├── services/
│   ├── user-service/          # Authentication & user management
│   ├── training-service/      # Exercise & program management
│   ├── schedule-service/      # Booking & availability
│   ├── progress-service/      # Progress tracking & analytics
│   ├── notification-service/  # Event-driven notifications
│   └── api-gateway/          # Unified API entry point
├── frontend/                 # React application
├── docs/                     # Documentation
├── docker-compose.yml        # Infrastructure orchestration
├── start-all-services.sh     # Mac/Linux startup script
└── start-services.bat        # Windows startup script
```

## Technology Stack

### Backend
- **Node.js** 18 with Express.js
- **Python** 3.11 with FastAPI
- **PostgreSQL** 15 (4 databases)
- **Redis** 7 (caching & pub/sub)

### Frontend
- **React** 18
- **React Router** v6
- **Axios** for API calls
- **Context API** for state management

### Infrastructure
- **Docker** & Docker Compose
- **JWT** authentication
- **bcrypt** password hashing
- **Winston/Python logging**

## Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and patterns
- **[Development Guide](docs/DEVELOPMENT.md)** - Local development workflow

## API Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@fitsync.com", "password": "Client@123"}'

# Response
{
  "success": true,
  "data": {
    "user": {...},
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc..."
    }
  }
}
```

### Get Exercises
```bash
curl http://localhost:4000/api/exercises \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Booking
```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id": "uuid-here",
    "booking_date": "2025-12-01",
    "start_time": "10:00:00",
    "end_time": "11:00:00"
  }'
```

### Track Body Metrics
```bash
curl -X POST http://localhost:4000/api/metrics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weight_kg": 75.5,
    "height_cm": 175,
    "recorded_date": "2025-11-24"
  }'
```

## Security Features

- ✅ JWT-based authentication (15min access, 7-day refresh)
- ✅ bcrypt password hashing (10 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Token refresh mechanism
- ✅ Secure headers with Helmet.js
- ✅ CORS configuration
- ✅ Request correlation IDs

## Testing

### Health Check
```bash
curl http://localhost:4000/health
```

### Service-Specific Health
```bash
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Training Service
curl http://localhost:8003/health  # Schedule Service
curl http://localhost:8004/health  # Progress Service
curl http://localhost:3005/health  # Notification Service
```

## Project Statistics

- **Total Services**: 6 microservices + 1 API gateway + 1 frontend
- **Total Code**: ~5,000+ lines
- **Languages**: JavaScript, Python, SQL
- **Databases**: 4 PostgreSQL instances
- **API Endpoints**: 60+ RESTful endpoints
- **Authentication**: JWT with refresh tokens
- **Test Users**: 50 seeded users

## Development

### Start Individual Service
```bash
cd services/user-service
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### View Logs
```bash
docker-compose logs -f user-service
docker-compose logs -f training-service
docker-compose logs -f api-gateway
```

## Troubleshooting

### Services Won't Start
1. Check Docker is running: `docker ps`
2. Check ports are available: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)
3. View logs: `docker-compose logs [service-name]`

### Authentication Errors
1. Ensure API Gateway is running on port 4000
2. Check JWT_SECRET is set in environment variables
3. Verify tokens haven't expired

### Database Connection Issues
1. Check PostgreSQL containers: `docker-compose ps`
2. Verify connection strings in .env files
3. Run migrations: `npm run migrate`

## Roadmap

### ✅ Completed
- Full microservices backend
- React frontend with authentication
- Role-based dashboards
- Docker deployment
- Comprehensive documentation

### 🔄 Future Enhancements
- WebSocket real-time updates
- Advanced analytics dashboard
- Mobile responsive improvements
- Integration tests
- Payment integration
- Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is created for educational and demonstration purposes.

## Support

For issues and questions:
- Check the [documentation](docs/)
- Review service logs
- Verify environment configurations

---

**Built with ❤️ using modern microservices architecture**

🚀 Ready to revolutionize fitness management!

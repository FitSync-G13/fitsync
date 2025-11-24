# FitSync API Documentation

Complete API reference for all FitSync microservices.

## Base URL

All API requests should be made through the API Gateway:

```
http://localhost:4000/api
```

## Authentication

FitSync uses JWT (JSON Web Tokens) for authentication.

### Token Types

1. **Access Token**
   - Short-lived (15 minutes)
   - Used for API requests
   - Include in `Authorization` header

2. **Refresh Token**
   - Long-lived (7 days)
   - Used to obtain new access tokens
   - Stored securely on client

### Authorization Header

Include the access token in all authenticated requests:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## User Service

### Authentication Endpoints

#### Register User

Create a new user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "client",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-15",
  "gender": "male"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "role": "client",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2025-11-24T12:00:00.000Z"
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc..."
    }
  }
}
```

**Validation Rules:**
- Email must be valid and unique
- Password min 8 characters, must contain uppercase, lowercase, number
- Role must be: `admin`, `trainer`, `client`, or `gym_owner`

---

#### Login

Authenticate and receive tokens.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "client@fitsync.com",
  "password": "Client@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "client@fitsync.com",
      "role": "client",
      "first_name": "John",
      "last_name": "Client"
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc..."
    }
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

#### Refresh Token

Get a new access token using refresh token.

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

---

#### Logout

Invalidate tokens and end session.

```http
POST /auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Management Endpoints

#### Get Current User Profile

Get authenticated user's profile.

```http
GET /users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "client@fitsync.com",
    "role": "client",
    "first_name": "John",
    "last_name": "Client",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-15",
    "gender": "male",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Update Profile

Update current user's profile.

```http
PUT /users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Updated",
  "phone": "+0987654321"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

---

#### List Users (Admin Only)

Get paginated list of users.

```http
GET /users?page=1&limit=10&role=client&search=john
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-1",
        "email": "user1@example.com",
        "role": "client",
        "first_name": "John",
        "last_name": "Doe"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

#### Get User by ID (Admin/Trainer)

```http
GET /users/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* user object */ }
}
```

---

#### Update User Role (Admin Only)

```http
PUT /users/:id/role
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "role": "trainer"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

---

#### Deactivate User (Admin Only)

```http
DELETE /users/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

## Training Service

### Exercise Endpoints

#### Create Exercise

```http
POST /exercises
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer` or `admin`

**Request Body:**
```json
{
  "name": "Barbell Squat",
  "description": "Compound lower body exercise targeting quads, glutes, and hamstrings",
  "muscle_group": "legs",
  "equipment_needed": "barbell",
  "difficulty_level": "intermediate",
  "instructions": "Stand with feet shoulder-width apart...",
  "video_url": "https://example.com/squat.mp4",
  "image_url": "https://example.com/squat.jpg"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Barbell Squat",
    "muscle_group": "legs",
    "created_by": "trainer-uuid",
    "created_at": "2025-11-24T12:00:00.000Z"
  }
}
```

---

#### List Exercises

```http
GET /exercises?muscle_group=legs&difficulty=intermediate&search=squat
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `muscle_group` (optional): Filter by muscle group
- `difficulty` (optional): Filter by difficulty level
- `equipment` (optional): Filter by equipment needed
- `search` (optional): Search by name or description
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Barbell Squat",
      "description": "Compound lower body exercise",
      "muscle_group": "legs",
      "difficulty_level": "intermediate",
      "equipment_needed": "barbell"
    }
  ]
}
```

---

#### Get Exercise Details

```http
GET /exercises/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Barbell Squat",
    "description": "Compound lower body exercise",
    "muscle_group": "legs",
    "equipment_needed": "barbell",
    "difficulty_level": "intermediate",
    "instructions": "Step-by-step instructions...",
    "video_url": "https://example.com/squat.mp4",
    "image_url": "https://example.com/squat.jpg",
    "created_by": "trainer-uuid",
    "created_at": "2025-11-24T12:00:00.000Z"
  }
}
```

---

#### Update Exercise

```http
PUT /exercises/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer` or `admin`

**Request Body:** (partial update supported)
```json
{
  "name": "Barbell Back Squat",
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

#### Delete Exercise

```http
DELETE /exercises/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer` or `admin`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Exercise deleted successfully"
}
```

---

### Workout Plan Endpoints

#### Create Workout Plan

```http
POST /workouts
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer` or `admin`

**Request Body:**
```json
{
  "name": "Full Body Strength",
  "description": "3x per week full body routine for muscle gain",
  "goal": "muscle_gain",
  "difficulty_level": "intermediate",
  "duration_weeks": 12,
  "frequency_per_week": 3,
  "exercises": [
    {
      "exercise_id": "uuid-1",
      "sets": 4,
      "reps": 8,
      "rest_seconds": 90,
      "notes": "Focus on form, progressive overload"
    },
    {
      "exercise_id": "uuid-2",
      "sets": 3,
      "reps": 10,
      "rest_seconds": 60
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Full Body Strength",
    "goal": "muscle_gain",
    "created_by": "trainer-uuid"
  }
}
```

---

#### List Workout Plans

```http
GET /workouts?goal=muscle_gain&difficulty=intermediate
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Full Body Strength",
      "description": "3x per week routine",
      "goal": "muscle_gain",
      "difficulty_level": "intermediate",
      "duration_weeks": 12
    }
  ]
}
```

---

#### Get Workout Plan Details

```http
GET /workouts/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Full Body Strength",
    "description": "3x per week routine",
    "goal": "muscle_gain",
    "exercises": [
      {
        "exercise_id": "uuid-1",
        "exercise_name": "Barbell Squat",
        "sets": 4,
        "reps": 8,
        "rest_seconds": 90
      }
    ]
  }
}
```

---

### Diet Plan Endpoints

#### Create Diet Plan

```http
POST /diets
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer` or `admin`

**Request Body:**
```json
{
  "name": "Muscle Gain Diet",
  "description": "High protein diet for muscle building",
  "goal": "muscle_gain",
  "daily_calories": 3000,
  "protein_grams": 200,
  "carbs_grams": 350,
  "fat_grams": 80,
  "meals": [
    {
      "meal_time": "breakfast",
      "name": "Protein Oatmeal",
      "description": "Oats, protein powder, banana",
      "calories": 600,
      "protein_grams": 40
    }
  ]
}
```

**Response:** `201 Created`

---

#### List Diet Plans

```http
GET /diets?goal=muscle_gain
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`

---

### Program Endpoints

#### Assign Program to Client

```http
POST /programs
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer` or `admin`

**Request Body:**
```json
{
  "client_id": "uuid-client",
  "workout_plan_id": "uuid-workout",
  "diet_plan_id": "uuid-diet",
  "start_date": "2025-12-01",
  "end_date": "2026-03-01",
  "notes": "Focus on progressive overload"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-program",
    "client_id": "uuid-client",
    "status": "active",
    "start_date": "2025-12-01"
  }
}
```

**Note:** This triggers a notification event to the client.

---

#### List Programs

```http
GET /programs?client_id=uuid&status=active
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`

---

#### Update Program Status

```http
PUT /programs/:id/status
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Status values:** `active`, `paused`, `completed`, `cancelled`

**Response:** `200 OK`

---

## Schedule Service

### Availability Endpoints

#### Set Trainer Availability

```http
POST /availability
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer`

**Request Body:**
```json
{
  "day_of_week": 1,
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "is_available": true
}
```

**day_of_week:** 0=Sunday, 1=Monday, ..., 6=Saturday

**Response:** `201 Created`

---

#### Get Trainer Availability

```http
GET /availability/trainer/:trainer_id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "is_available": true
    }
  ]
}
```

---

### Booking Endpoints

#### Create Booking

```http
POST /bookings
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "trainer_id": "uuid-trainer",
  "booking_date": "2025-12-01",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "session_type": "personal_training",
  "notes": "Focus on squat form"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-booking",
    "status": "scheduled",
    "booking_date": "2025-12-01",
    "start_time": "10:00:00"
  }
}
```

**Validation:**
- Checks trainer availability
- Detects time conflicts
- Triggers notification event

**Error:** `409 Conflict` if time slot already booked

---

#### List Bookings

```http
GET /bookings?status=scheduled&from_date=2025-12-01
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `status`: Filter by status (`scheduled`, `completed`, `cancelled`)
- `from_date`: Start date filter
- `to_date`: End date filter
- `trainer_id`: Filter by trainer
- `client_id`: Filter by client

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "trainer_id": "uuid-trainer",
      "client_id": "uuid-client",
      "booking_date": "2025-12-01",
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "status": "scheduled"
    }
  ]
}
```

---

#### Reschedule Booking

```http
PUT /bookings/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "booking_date": "2025-12-02",
  "start_time": "14:00:00",
  "end_time": "15:00:00"
}
```

**Response:** `200 OK`

---

#### Cancel Booking

```http
PUT /bookings/:id/cancel
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

**Note:** Triggers cancellation notification.

---

#### Complete Booking

```http
PUT /bookings/:id/complete
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer`

**Response:** `200 OK`

---

### Group Session Endpoints

#### Create Group Session

```http
POST /sessions/group
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Required Role:** `trainer`

**Request Body:**
```json
{
  "name": "HIIT Cardio Class",
  "description": "High intensity interval training",
  "trainer_id": "uuid-trainer",
  "session_date": "2025-12-01",
  "start_time": "18:00:00",
  "end_time": "19:00:00",
  "max_participants": 20,
  "location": "Gym Floor A"
}
```

**Response:** `201 Created`

---

#### List Group Sessions

```http
GET /sessions/group?from_date=2025-12-01
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`

---

#### Enroll in Group Session

```http
POST /sessions/group/:id/enroll
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Enrolled successfully"
}
```

**Error:** `400 Bad Request` if session is full

---

## Progress Service

### Body Metrics Endpoints

#### Record Body Metrics

```http
POST /metrics
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "recorded_date": "2025-11-24",
  "weight_kg": 75.5,
  "height_cm": 175,
  "body_fat_percentage": 15.5,
  "muscle_mass_kg": 60.0,
  "chest_cm": 100,
  "waist_cm": 80,
  "hips_cm": 95,
  "bicep_left_cm": 35,
  "bicep_right_cm": 35,
  "thigh_left_cm": 55,
  "thigh_right_cm": 55,
  "notes": "Post-workout measurement"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "weight_kg": 75.5,
    "bmi": 24.6,
    "recorded_date": "2025-11-24"
  }
}
```

**Note:** BMI is automatically calculated if height and weight provided.

---

#### Get Metrics History

```http
GET /metrics/client/:client_id?from_date=2025-01-01&to_date=2025-12-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "recorded_date": "2025-11-24",
      "weight_kg": 75.5,
      "bmi": 24.6
    }
  ]
}
```

---

#### Get Latest Metrics

```http
GET /metrics/client/:client_id/latest
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`

---

#### Get Chart Data

```http
GET /metrics/client/:client_id/chart?metric=weight_kg&period=90
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `metric`: The metric to chart (`weight_kg`, `body_fat_percentage`, etc.)
- `period`: Number of days (default: 90)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "labels": ["2025-09-01", "2025-10-01", "2025-11-01"],
    "values": [78.0, 76.5, 75.5]
  }
}
```

---

### Workout Log Endpoints

#### Log Workout Session

```http
POST /workout-logs
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "workout_plan_id": "uuid-workout",
  "date_completed": "2025-11-24",
  "duration_minutes": 60,
  "exercises": [
    {
      "exercise_id": "uuid-1",
      "sets_completed": 4,
      "reps_completed": 8,
      "weight_used": 100,
      "notes": "Felt strong today"
    }
  ],
  "overall_notes": "Great workout, felt energized"
}
```

**Response:** `201 Created`

---

#### Get Workout History

```http
GET /workout-logs/client/:client_id?limit=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`

---

### Analytics Endpoints

#### Get Client Analytics

```http
GET /analytics/client/:client_id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_workouts": 45,
    "total_minutes": 2700,
    "workouts_this_week": 3,
    "workouts_this_month": 12,
    "current_weight": 75.5,
    "weight_change_30days": -2.5,
    "average_workout_duration": 60,
    "achievement_count": 8
  }
}
```

---

#### Get Trainer Analytics

```http
GET /analytics/trainer/:trainer_id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_sessions": 120,
    "total_clients": 25,
    "sessions_this_week": 15,
    "active_programs": 18,
    "average_rating": 4.8
  }
}
```

---

#### Get Achievements

```http
GET /achievements/client/:client_id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "type": "workout_streak",
      "title": "7-Day Streak",
      "description": "Completed 7 consecutive workouts",
      "earned_date": "2025-11-20"
    }
  ]
}
```

---

## Notification Service

### Notification Endpoints

#### Get User Notifications

```http
GET /notifications?status=unread&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `status`: `all`, `unread`, `read`
- `limit`: Number of notifications (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "type": "booking_confirmation",
      "title": "Booking Confirmed",
      "message": "Your session on 2025-12-01 at 10:00 has been booked",
      "is_read": false,
      "created_at": "2025-11-24T12:00:00.000Z"
    }
  ]
}
```

---

#### Mark Notification as Read

```http
PUT /notifications/:id/read
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`

---

#### Delete Notification

```http
DELETE /notifications/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`

---

#### Get Unread Count

```http
GET /notifications/unread/count
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., time slot already booked)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Error Codes

- `INVALID_TOKEN` - JWT token is invalid or expired
- `VALIDATION_ERROR` - Request data validation failed
- `NOT_FOUND` - Requested resource not found
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks required permissions
- `CONFLICT` - Resource conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting

The API Gateway implements rate limiting:

- **Limit:** 100 requests per 15 minutes
- **Headers:**
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

**Example:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1732454400
```

---

## Correlation IDs

All requests receive a correlation ID for tracking:

**Response Header:**
```
X-Correlation-ID: abc123-def456-ghi789
```

Include this ID when reporting issues for faster debugging.

---

## Examples

### Complete Authentication Flow

```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","role":"client","first_name":"Test","last_name":"User"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}' \
  | jq -r '.data.tokens.access_token')

# 3. Get Profile
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}"
```

### Complete Booking Flow

```bash
# 1. Get trainer availability
curl http://localhost:4000/api/availability/trainer/TRAINER_UUID \
  -H "Authorization: Bearer $TOKEN"

# 2. Create booking
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id":"TRAINER_UUID",
    "booking_date":"2025-12-01",
    "start_time":"10:00:00",
    "end_time":"11:00:00"
  }'

# 3. Get my bookings
curl http://localhost:4000/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Collection

A Postman collection with all endpoints is available at:
```
fitsync/docs/FitSync-API.postman_collection.json
```

Import it to quickly test all API endpoints.

---

## Need Help?

- Check the [Quick Start Guide](QUICK_START.md) for setup instructions
- Review the [Architecture Guide](ARCHITECTURE.md) for system design
- See the [main README](../README.md) for project overview

---

**Last Updated:** November 24, 2025

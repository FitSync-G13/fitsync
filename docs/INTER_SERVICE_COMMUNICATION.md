# Inter-Service Communication Plan

**Version:** 2.0
**Last Updated:** 2025-11-26
**Status:** Implementation Phase

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Service Communication Matrix](#service-communication-matrix)
4. [Detailed Service Communication](#detailed-service-communication)
5. [Event Schema Definitions](#event-schema-definitions)
6. [Communication Flow Examples](#communication-flow-examples)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Error Handling & Resilience](#error-handling--resilience)

---

## Overview

### Purpose
This document defines the comprehensive inter-service communication strategy for the FitSync microservices architecture. It establishes patterns for synchronous and asynchronous communication to ensure data consistency, system reliability, and optimal user experience.

### Communication Goals
- **Data Consistency**: Validate cross-service references before creating records
- **Event-Driven Automation**: Trigger workflows automatically based on business events
- **Decoupled Architecture**: Maintain service independence while enabling collaboration
- **Rich User Experience**: Provide contextual notifications and data enrichment
- **Performance Optimization**: Use caching and batch operations to reduce latency

---

## Architecture Patterns

### Hybrid Communication Model

FitSync implements a **hybrid communication architecture** combining:

#### 1. Synchronous Communication (REST/HTTP)
**Use Cases:**
- Data validation (user exists, trainer is valid, etc.)
- Data enrichment (fetching user names, profile details)
- Immediate consistency requirements
- Request-response queries

**Protocol:** REST over HTTP/HTTPS
**Format:** JSON
**Authentication:** JWT Bearer tokens forwarded from API Gateway

#### 2. Asynchronous Communication (Redis Pub/Sub)
**Use Cases:**
- Event notifications (booking created, program assigned)
- Workflow triggers (booking completed → create workout log)
- Fan-out scenarios (one event → multiple subscribers)
- Non-blocking operations

**Protocol:** Redis Pub/Sub
**Format:** JSON messages
**Channels:** Namespaced by entity and action (e.g., `booking.created`)

#### 3. Shared Cache (Redis)
**Use Cases:**
- User profile caching (reduce User Service load)
- Session management
- Frequently accessed reference data

**TTL Strategy:**
- User profiles: 15 minutes
- Session data: As per JWT expiry
- Reference data: 1 hour

---

## Service Communication Matrix

### Quick Reference Table

| From Service | To Service | Method | Purpose |
|-------------|-----------|--------|---------|
| **Training** | User | REST (Sync) | Validate trainer/client IDs |
| **Training** | Notification | Event (Async) | Program assigned/completed |
| **Training** | Progress | Event (Async) | Program completion for achievements |
| **Schedule** | User | REST (Sync) | Validate user IDs and roles |
| **Schedule** | Training | REST (Sync) | Verify active program exists |
| **Schedule** | Notification | Event (Async) | Booking lifecycle events |
| **Schedule** | Progress | Event (Async) | Booking completed for workout logs |
| **Progress** | User | REST (Sync) | Validate client IDs |
| **Progress** | Schedule | REST (Sync) | Fetch booking details |
| **Progress** | Training | REST (Sync) | Fetch program details |
| **Progress** | Notification | Event (Async) | Achievements and milestones |
| **Notification** | User | REST (Sync) | Fetch contact information |
| **Notification** | Training | REST (Sync) | Enrich program notifications |
| **Notification** | Schedule | REST (Sync) | Enrich booking notifications |
| **API Gateway** | All Services | REST (Sync) | Request routing and composition |

---

## Detailed Service Communication

### 1. User Service (Identity & Profile Authority)

**Role:** Central authority for user authentication, authorization, and profile data

#### Provides (Inbound)

| Endpoint | Method | Called By | Purpose |
|----------|--------|-----------|---------|
| `/api/users/{id}` | GET | Training, Schedule, Progress, Notification | Fetch single user profile |
| `/api/users/batch` | POST | Notification | Fetch multiple user profiles |
| `/api/users/{id}/role-info` | GET | Training, Schedule | Get role-specific data |
| `/api/auth/login` | POST | API Gateway | User authentication |
| `/api/auth/register` | POST | API Gateway | User registration |

#### Consumes (Outbound)
- None (provider service)

#### New Endpoints to Implement

```javascript
// Batch user fetch for efficiency
POST /api/users/batch
Request: { user_ids: ["uuid1", "uuid2", ...] }
Response: {
  success: true,
  data: [
    { id: "uuid1", name: "John Doe", email: "john@example.com", ... },
    { id: "uuid2", name: "Jane Smith", email: "jane@example.com", ... }
  ]
}

// Role-specific information
GET /api/users/{id}/role-info
Response (Trainer): {
  success: true,
  data: {
    certifications: ["CPT", "Nutrition Specialist"],
    specializations: ["Strength Training", "Weight Loss"],
    years_experience: 5,
    rating: 4.8
  }
}

Response (Client): {
  success: true,
  data: {
    health_clearance: true,
    emergency_contact: {...},
    fitness_level: "intermediate"
  }
}
```

---

### 2. Training Service (Program Management)

**Role:** Manages workout plans, diet plans, and personalized training programs

#### Provides (Inbound)

| Endpoint | Method | Called By | Purpose |
|----------|--------|-----------|---------|
| `/api/programs/client/{client_id}/active` | GET | Schedule | Get client's active programs |
| `/api/programs/{id}` | GET | Notification, Progress | Fetch program details |
| `/api/programs/{id}/complete` | POST | Progress | Mark program as completed |

#### Consumes (Outbound)

**REST Calls:**
| To Service | Endpoint | Trigger | Purpose |
|-----------|----------|---------|---------|
| User | `GET /api/users/{id}` | Creating program | Validate trainer and client exist |
| User | `POST /api/users/batch` | Listing programs | Enrich with user names |

**Events Published:**
```javascript
// Program assigned to client
Channel: "program.assigned"
Payload: {
  event: "program.assigned",
  timestamp: "2025-11-26T10:30:00Z",
  data: {
    program_id: "uuid",
    client_id: "uuid",
    trainer_id: "uuid",
    workout_plan_id: "uuid",
    diet_plan_id: "uuid",
    start_date: "2025-11-26",
    duration_weeks: 12
  }
}

// Program completed
Channel: "program.completed"
Payload: {
  event: "program.completed",
  timestamp: "2025-11-26T10:30:00Z",
  data: {
    program_id: "uuid",
    client_id: "uuid",
    trainer_id: "uuid",
    completion_date: "2025-11-26",
    adherence_rate: 0.85
  }
}

// Program updated
Channel: "program.updated"
Payload: {
  event: "program.updated",
  timestamp: "2025-11-26T10:30:00Z",
  data: {
    program_id: "uuid",
    client_id: "uuid",
    trainer_id: "uuid",
    changes: ["workout_plan_updated", "diet_plan_modified"]
  }
}
```

#### Implementation Changes

**New HTTP Client Utility:**
```javascript
// src/utils/httpClient.js
const axios = require('axios');

const userServiceClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 5000
});

async function validateUser(userId) {
  const response = await userServiceClient.get(`/api/users/${userId}`);
  return response.data;
}

async function fetchUsersBatch(userIds) {
  const response = await userServiceClient.post('/api/users/batch', { user_ids: userIds });
  return response.data;
}

module.exports = { validateUser, fetchUsersBatch };
```

**Event Publisher:**
```javascript
// src/utils/eventPublisher.js
const redis = require('./redis');

async function publishEvent(channel, eventData) {
  const message = JSON.stringify({
    event: channel,
    timestamp: new Date().toISOString(),
    data: eventData
  });

  await redis.publish(channel, message);
  logger.info(`Event published: ${channel}`, eventData);
}

module.exports = { publishEvent };
```

---

### 3. Schedule Service (Booking & Availability)

**Role:** Manages appointments, trainer availability, and session scheduling

#### Provides (Inbound)

| Endpoint | Method | Called By | Purpose |
|----------|--------|-----------|---------|
| `/api/bookings/{id}` | GET | Progress, Notification | Fetch booking details |
| `/api/bookings/{id}/complete` | PUT | Progress | Mark booking complete |

#### Consumes (Outbound)

**REST Calls:**
| To Service | Endpoint | Trigger | Purpose |
|-----------|----------|---------|---------|
| User | `GET /api/users/{id}` | Creating booking | Validate trainer and client |
| User | `POST /api/users/batch` | Listing bookings | Enrich with user names |
| Training | `GET /api/programs/client/{id}/active` | Creating booking | Verify active program |

**Events Published:**
```python
# Booking created
Channel: "booking.created"
Payload: {
  "event": "booking.created",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "client_id": "uuid",
    "trainer_id": "uuid",
    "gym_id": "uuid",
    "booking_date": "2025-11-30",
    "start_time": "14:00:00",
    "end_time": "15:00:00",
    "type": "one_on_one"
  }
}

# Booking cancelled
Channel: "booking.cancelled"
Payload: {
  "event": "booking.cancelled",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "client_id": "uuid",
    "trainer_id": "uuid",
    "cancellation_reason": "Client request",
    "cancelled_by": "uuid"
  }
}

# Booking completed (NEW)
Channel: "booking.completed"
Payload: {
  "event": "booking.completed",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "client_id": "uuid",
    "trainer_id": "uuid",
    "workout_date": "2025-11-26",
    "start_time": "14:00:00",
    "end_time": "15:00:00",
    "duration_minutes": 60,
    "trainer_notes": "Great session, client improved form"
  }
}

# Booking reminder (NEW)
Channel: "booking.reminder"
Payload: {
  "event": "booking.reminder",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "client_id": "uuid",
    "trainer_id": "uuid",
    "booking_date": "2025-11-27",
    "start_time": "14:00:00",
    "hours_until": 24
  }
}

# Booking rescheduled (NEW)
Channel: "booking.rescheduled"
Payload: {
  "event": "booking.rescheduled",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "client_id": "uuid",
    "trainer_id": "uuid",
    "old_date": "2025-11-30",
    "old_start_time": "14:00:00",
    "new_date": "2025-12-01",
    "new_start_time": "15:00:00"
  }
}
```

#### Implementation Changes

**HTTP Client (Python):**
```python
# utils/http_client.py
import httpx
import os

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:3001")
TRAINING_SERVICE_URL = os.getenv("TRAINING_SERVICE_URL", "http://localhost:3002")

async def validate_user(user_id: str, token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{USER_SERVICE_URL}/api/users/{user_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5.0
        )
        response.raise_for_status()
        return response.json()

async def get_active_programs(client_id: str, token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRAINING_SERVICE_URL}/api/programs/client/{client_id}/active",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5.0
        )
        response.raise_for_status()
        return response.json()
```

---

### 4. Progress Service (Metrics & Analytics)

**Role:** Tracks client progress, body metrics, workout logs, and achievements

#### Provides (Inbound)

| Endpoint | Method | Called By | Purpose |
|----------|--------|-----------|---------|
| `/api/analytics/client/{id}` | GET | API Gateway | Client analytics dashboard |
| `/api/achievements/client/{id}` | GET | API Gateway, Notification | Client achievements |

#### Consumes (Outbound)

**REST Calls:**
| To Service | Endpoint | Trigger | Purpose |
|-----------|----------|---------|---------|
| User | `GET /api/users/{id}` | Recording metrics | Validate client exists |
| Schedule | `GET /api/bookings/{id}` | Creating workout log | Fetch booking details |
| Training | `GET /api/programs/{id}` | Analytics | Fetch program details |

**Events Published:**
```python
# Achievement earned
Channel: "achievement.earned"
Payload: {
  "event": "achievement.earned",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "achievement_id": "uuid",
    "client_id": "uuid",
    "type": "weight_milestone",
    "title": "Lost 10kg",
    "description": "You've successfully lost 10kg!",
    "badge_icon": "weight_loss_10kg.png"
  }
}

# Milestone reached
Channel: "milestone.reached"
Payload: {
  "event": "milestone.reached",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "client_id": "uuid",
    "milestone_type": "weight_goal",
    "target_value": 75.0,
    "achieved_value": 74.8,
    "previous_value": 85.0,
    "metric": "weight_kg"
  }
}

# Progress updated
Channel: "progress.updated"
Payload: {
  "event": "progress.updated",
  "timestamp": "2025-11-26T10:30:00Z",
  "data": {
    "client_id": "uuid",
    "metric_type": "body_metrics",
    "new_value": {
      "weight_kg": 74.8,
      "body_fat_percentage": 18.5
    },
    "change_from_last": {
      "weight_kg": -0.5,
      "body_fat_percentage": -0.3
    }
  }
}
```

**Events Subscribed:**
```python
# Listen for booking completions to auto-create workout logs
Channel: "booking.completed"
Handler: async def handle_booking_completed(data)

# Listen for program completions to award achievements
Channel: "program.completed"
Handler: async def handle_program_completed(data)
```

#### Implementation Changes

**Event Subscriber:**
```python
# Add to main.py
async def subscribe_to_events():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe('booking.completed', 'program.completed')

    async for message in pubsub.listen():
        if message['type'] == 'message':
            channel = message['channel']
            data = json.loads(message['data'])

            if channel == 'booking.completed':
                await handle_booking_completed(data)
            elif channel == 'program.completed':
                await handle_program_completed(data)

# Event handlers
async def handle_booking_completed(event_data):
    data = event_data['data']
    # Auto-create workout log stub
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO workout_logs (client_id, booking_id, workout_date,
                                     exercises_completed, total_duration_minutes)
            VALUES ($1, $2, $3, '[]', $4)
        """, data['client_id'], data['booking_id'],
             data['workout_date'], data['duration_minutes'])

    logger.info(f"Auto-created workout log for booking {data['booking_id']}")

async def handle_program_completed(event_data):
    data = event_data['data']
    # Award program completion achievement
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO achievements (client_id, achievement_type, title, description)
            VALUES ($1, 'program_completion', $2, $3)
            RETURNING *
        """, data['client_id'],
             f"Completed {data.get('program_name', 'Training Program')}",
             "You've successfully completed your training program!")

    # Publish achievement earned event
    await publish_event('achievement.earned', {
        'client_id': data['client_id'],
        'type': 'program_completion',
        'title': f"Completed {data.get('program_name', 'Training Program')}"
    })
```

---

### 5. Notification Service (Multi-Channel Notifications)

**Role:** Handles all user notifications via email, SMS, push, and in-app channels

#### Provides (Inbound)

| Endpoint | Method | Called By | Purpose |
|----------|--------|-----------|---------|
| `/api/notifications` | GET | Frontend | List user notifications |
| `/api/notifications/{id}/read` | PUT | Frontend | Mark notification as read |
| `/api/notifications/unread/count` | GET | Frontend | Get unread count |

#### Consumes (Outbound)

**REST Calls:**
| To Service | Endpoint | Trigger | Purpose |
|-----------|----------|---------|---------|
| User | `GET /api/users/{id}` | All events | Fetch contact info (email, phone) |
| User | `POST /api/users/batch` | Batch notifications | Fetch multiple user contacts |
| Training | `GET /api/programs/{id}` | Program events | Enrich notification content |
| Schedule | `GET /api/bookings/{id}` | Booking events | Enrich notification content |

**Events Subscribed:**
```javascript
// All subscribed channels
const SUBSCRIBED_CHANNELS = [
  'booking.created',
  'booking.cancelled',
  'booking.completed',
  'booking.reminder',
  'booking.rescheduled',
  'program.assigned',
  'program.completed',
  'program.updated',
  'achievement.earned',
  'milestone.reached',
  'progress.updated'
];
```

#### Implementation Changes

**Enhanced Event Handlers:**
```javascript
// src/handlers/eventHandlers.js
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const TRAINING_SERVICE_URL = process.env.TRAINING_SERVICE_URL || 'http://localhost:3002';
const SCHEDULE_SERVICE_URL = process.env.SCHEDULE_SERVICE_URL || 'http://localhost:8003';

async function handleProgramAssigned(eventData) {
  const { data } = eventData;

  // Fetch client contact info
  const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/${data.client_id}`);
  const user = userResponse.data.data;

  // Fetch program details
  const programResponse = await axios.get(`${TRAINING_SERVICE_URL}/api/programs/${data.program_id}`);
  const program = programResponse.data.data;

  // Send enriched notification
  await sendEmail(
    user.email,
    'New Training Program Assigned',
    `Hi ${user.name},\n\nYour trainer has assigned you a new program:\n` +
    `Program: ${program.name}\n` +
    `Duration: ${program.duration_weeks} weeks\n` +
    `Start Date: ${data.start_date}\n\n` +
    `Login to view your program details.`
  );

  // Store in-app notification
  storeNotification(data.client_id, {
    type: 'program_assigned',
    title: 'New Program Assigned',
    message: `Your trainer assigned you: ${program.name}`,
    metadata: { program_id: data.program_id }
  });
}

async function handleMilestoneReached(eventData) {
  const { data } = eventData;

  const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/${data.client_id}`);
  const user = userResponse.data.data;

  await sendEmail(
    user.email,
    '🎉 Milestone Achieved!',
    `Congratulations ${user.name}!\n\n` +
    `You've reached a new milestone:\n` +
    `${data.milestone_type}: ${data.achieved_value}\n` +
    `Progress: ${data.previous_value} → ${data.achieved_value}\n\n` +
    `Keep up the great work!`
  );

  storeNotification(data.client_id, {
    type: 'milestone',
    title: 'Milestone Achieved!',
    message: `You've reached: ${data.milestone_type}`,
    metadata: data
  });
}
```

---

### 6. API Gateway (Orchestration Layer)

**Role:** Request routing, composition, rate limiting, and circuit breaking

#### New Composite Endpoints

```javascript
// Composite dashboard endpoints
app.get('/api/dashboard/client/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Parallel requests to multiple services
    const [profile, programs, bookings, metrics] = await Promise.all([
      axios.get(`${services.user}/api/users/${id}`),
      axios.get(`${services.training}/api/programs?client_id=${id}`),
      axios.get(`${services.schedule}/api/bookings?client_id=${id}&limit=5`),
      axios.get(`${services.progress}/api/analytics/client/${id}`)
    ]);

    res.json({
      success: true,
      data: {
        profile: profile.data.data,
        active_programs: programs.data.data,
        upcoming_bookings: bookings.data.data,
        progress_summary: metrics.data.data
      }
    });
  } catch (error) {
    logger.error('Dashboard composition error:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard' });
  }
});

app.get('/api/dashboard/trainer/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [profile, programs, todayBookings] = await Promise.all([
      axios.get(`${services.user}/api/users/${id}`),
      axios.get(`${services.training}/api/programs?trainer_id=${id}`),
      axios.get(`${services.schedule}/api/bookings?trainer_id=${id}&date=today`)
    ]);

    res.json({
      success: true,
      data: {
        profile: profile.data.data,
        active_clients: programs.data.data.length,
        today_schedule: todayBookings.data.data
      }
    });
  } catch (error) {
    logger.error('Trainer dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard' });
  }
});
```

---

## Event Schema Definitions

### Standard Event Structure

All events follow this structure:

```json
{
  "event": "string (channel name)",
  "timestamp": "ISO 8601 datetime",
  "correlation_id": "optional UUID for tracing",
  "data": {
    // Event-specific payload
  }
}
```

### Event Catalog

| Channel | Publisher | Subscribers | Payload Keys |
|---------|-----------|-------------|--------------|
| `booking.created` | Schedule | Notification | booking_id, client_id, trainer_id, booking_date, start_time, type |
| `booking.cancelled` | Schedule | Notification | booking_id, client_id, trainer_id, cancellation_reason |
| `booking.completed` | Schedule | Progress, Notification | booking_id, client_id, trainer_id, workout_date, duration_minutes, trainer_notes |
| `booking.reminder` | Schedule | Notification | booking_id, client_id, trainer_id, booking_date, hours_until |
| `booking.rescheduled` | Schedule | Notification | booking_id, old_date, new_date, client_id, trainer_id |
| `program.assigned` | Training | Notification | program_id, client_id, trainer_id, workout_plan_id, diet_plan_id, start_date |
| `program.completed` | Training | Progress, Notification | program_id, client_id, trainer_id, completion_date, adherence_rate |
| `program.updated` | Training | Notification | program_id, client_id, trainer_id, changes[] |
| `achievement.earned` | Progress | Notification | achievement_id, client_id, type, title, description |
| `milestone.reached` | Progress | Notification | client_id, milestone_type, target_value, achieved_value |
| `progress.updated` | Progress | Notification | client_id, metric_type, new_value, change_from_last |

---

## Communication Flow Examples

### Flow 1: Creating a Booking with Full Validation

```
┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Client  │    │ API Gateway │    │ User Service │    │   Training   │    │   Schedule   │
│         │    │             │    │              │    │   Service    │    │   Service    │
└────┬────┘    └──────┬──────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
     │                │                   │                   │                   │
     │ POST /bookings │                   │                   │                   │
     ├───────────────>│                   │                   │                   │
     │                │ GET /users/{trainer_id}               │                   │
     │                ├──────────────────>│                   │                   │
     │                │  Trainer Profile  │                   │                   │
     │                │<──────────────────┤                   │                   │
     │                │ GET /users/{client_id}                │                   │
     │                ├──────────────────>│                   │                   │
     │                │  Client Profile   │                   │                   │
     │                │<──────────────────┤                   │                   │
     │                │ GET /programs/client/{id}/active      │                   │
     │                ├──────────────────────────────────────>│                   │
     │                │          Active Program               │                   │
     │                │<──────────────────────────────────────┤                   │
     │                │ POST /bookings                        │                   │
     │                ├──────────────────────────────────────────────────────────>│
     │                │          Booking Created              │                   │
     │                │<──────────────────────────────────────────────────────────┤
     │   Success      │                   │                   │                   │
     │<───────────────┤                   │                   │                   │
     │                │                   │                   │                   │
     │                │                   │                   │ PUBLISH           │
     │                │                   │                   │ booking.created   │
     │                │                   │                   ├──────────────────>│
     │                │                   │                   │      Redis        │
     └────────────────┴───────────────────┴───────────────────┴───────────────────┘
                                                                       │
                                                                       │ SUBSCRIBE
                                                                       v
                                                              ┌────────────────┐
                                                              │  Notification  │
                                                              │    Service     │
                                                              └────────────────┘
```

### Flow 2: Completing a Booking (Cascading Events)

```
Trainer completes booking
        │
        v
Schedule Service marks complete
        │
        ├─> PUBLISH booking.completed
        │
        ├─────────────────────┬─────────────────────┐
        │                     │                     │
        v                     v                     v
Progress Service    Notification Service     [Future Services]
        │                     │
        │                     ├─> Fetch user contact
        │                     ├─> Send email
        │                     └─> Store in-app notification
        │
        ├─> Fetch booking details
        ├─> Create workout log stub
        └─> Client can fill details later
```

### Flow 3: Assigning Program (Multi-Service Coordination)

```
Trainer assigns program
        │
        v
Training Service
        │
        ├─> Validate trainer (User Service)
        ├─> Validate client (User Service)
        ├─> Create program record
        │
        └─> PUBLISH program.assigned
                    │
                    v
            Notification Service
                    │
                    ├─> Fetch client contact (User Service)
                    ├─> Fetch program details (Training Service)
                    ├─> Send email with program info
                    └─> Store in-app notification
```

---

## Implementation Guidelines

### REST Call Best Practices

#### 1. Timeout Configuration
```javascript
// Always set timeouts for external calls
const httpClient = axios.create({
  timeout: 5000, // 5 seconds max
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### 2. Error Handling
```javascript
async function validateUser(userId) {
  try {
    const response = await userServiceClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new ValidationError(`User ${userId} not found`);
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new ServiceUnavailableError('User service unavailable');
    }
    throw error;
  }
}
```

#### 3. Token Forwarding
```javascript
// Always forward authentication tokens
async function callService(url, token) {
  return await httpClient.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

### Event Publishing Best Practices

#### 1. Event Structure
```javascript
async function publishEvent(channel, data) {
  const event = {
    event: channel,
    timestamp: new Date().toISOString(),
    correlation_id: uuidv4(), // For tracing
    data: data
  };

  await redisClient.publish(channel, JSON.stringify(event));
  logger.info(`Published ${channel}`, { correlation_id: event.correlation_id });
}
```

#### 2. Event Idempotency
```javascript
// Include unique identifiers to handle duplicate events
{
  event_id: "uuid",
  booking_id: "uuid",
  // ... other fields
}
```

#### 3. Error Handling in Subscribers
```javascript
async function handleEvent(message) {
  try {
    const event = JSON.parse(message);
    await processEvent(event);
  } catch (error) {
    logger.error('Event processing failed', {
      error: error.message,
      event: message
    });
    // Don't throw - prevents subscriber from dying
  }
}
```

### Caching Strategy

#### 1. User Profile Caching
```javascript
async function getUserWithCache(userId) {
  const cacheKey = `user:${userId}`;

  // Check cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from service
  const user = await userServiceClient.get(`/api/users/${userId}`);

  // Cache for 15 minutes
  await redisClient.setex(cacheKey, 900, JSON.stringify(user.data));

  return user.data;
}
```

#### 2. Cache Invalidation
```javascript
// Invalidate cache when user updates profile
async function updateUserProfile(userId, updates) {
  await userDb.update(userId, updates);

  // Invalidate cache
  await redisClient.del(`user:${userId}`);

  // Optionally publish event
  await publishEvent('user.updated', { user_id: userId });
}
```

---

## Error Handling & Resilience

### Circuit Breaker Pattern

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(callUserService, options);

breaker.on('open', () => {
  logger.warn('Circuit breaker opened for User Service');
});

breaker.on('halfOpen', () => {
  logger.info('Circuit breaker half-open, testing User Service');
});

async function getUserSafely(userId) {
  try {
    return await breaker.fire(userId);
  } catch (error) {
    if (breaker.opened) {
      // Fallback behavior
      return { id: userId, name: 'Unknown User' };
    }
    throw error;
  }
}
```

### Retry Logic

```javascript
const retry = require('async-retry');

async function fetchWithRetry(url) {
  return await retry(
    async (bail) => {
      try {
        return await axios.get(url);
      } catch (error) {
        if (error.response?.status === 404) {
          // Don't retry 404s
          bail(error);
        }
        throw error; // Retry other errors
      }
    },
    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 3000
    }
  );
}
```

### Fallback Strategies

#### 1. Graceful Degradation
```javascript
async function enrichBookingWithUserNames(booking) {
  try {
    const [client, trainer] = await Promise.all([
      getUserSafely(booking.client_id),
      getUserSafely(booking.trainer_id)
    ]);

    return {
      ...booking,
      client_name: client.name,
      trainer_name: trainer.name
    };
  } catch (error) {
    logger.warn('Failed to enrich booking', error);
    // Return booking without enrichment
    return booking;
  }
}
```

#### 2. Partial Success
```javascript
async function notifyMultipleUsers(userIds, message) {
  const results = await Promise.allSettled(
    userIds.map(id => sendNotification(id, message))
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  logger.info(`Notifications sent: ${succeeded} succeeded, ${failed} failed`);

  return { succeeded, failed };
}
```

---

## Monitoring & Observability

### Request Correlation

```javascript
// Add correlation ID to all service calls
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

async function callServiceWithCorrelation(url, token, correlationId) {
  return await httpClient.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Correlation-ID': correlationId
    }
  });
}
```

### Metrics to Track

1. **Service-to-Service Call Latency**
   - P50, P95, P99 latencies for each service pair
   - Example: `schedule_to_user_latency_ms`

2. **Event Processing Time**
   - Time from event publish to processing complete
   - Example: `booking_created_to_notification_sent_ms`

3. **Error Rates**
   - Service call failures by service and endpoint
   - Event processing failures by channel

4. **Circuit Breaker States**
   - Count of open/half-open circuit breakers
   - Recovery time after circuit opens

---

## Migration Plan

### Phase 1: Foundation (Week 1)
- [ ] Implement User Service batch endpoints
- [ ] Add HTTP clients to all services
- [ ] Implement event publishing infrastructure

### Phase 2: Core Validation (Week 2)
- [ ] Schedule Service validates users via User Service
- [ ] Training Service validates users via User Service
- [ ] Progress Service validates users via User Service

### Phase 3: Event Publishing (Week 3)
- [ ] Training Service publishes program events
- [ ] Schedule Service publishes new booking events
- [ ] Progress Service publishes achievement events

### Phase 4: Event Subscription (Week 4)
- [ ] Progress Service subscribes to booking/program events
- [ ] Notification Service handles all new events
- [ ] Test end-to-end event flows

### Phase 5: Optimization (Week 5)
- [ ] Implement caching for user profiles
- [ ] Add circuit breakers for service calls
- [ ] Implement composite API Gateway endpoints

---

## Testing Strategy

### Unit Tests
- Mock external service calls
- Test event publishing/subscribing logic
- Validate error handling

### Integration Tests
- Test service-to-service communication
- Verify event flows end-to-end
- Test fallback behaviors

### Load Tests
- Test system under concurrent service calls
- Verify event processing throughput
- Test circuit breaker activation

---

## Appendix

### Service URLs (Default)
```
User Service:         http://localhost:3001
Training Service:     http://localhost:3002
Schedule Service:     http://localhost:8003
Progress Service:     http://localhost:8004
Notification Service: http://localhost:3005
API Gateway:          http://localhost:4000
```

### Redis Channels
```
booking.created
booking.cancelled
booking.completed
booking.reminder
booking.rescheduled
program.assigned
program.completed
program.updated
achievement.earned
milestone.reached
progress.updated
```

### Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Business rule violation
- `500 Internal Server Error`: Unexpected error
- `502 Bad Gateway`: Downstream service failure
- `503 Service Unavailable`: Service down/circuit open

---

**Document Version:** 2.0
**Last Updated:** 2025-11-26
**Maintained By:** FitSync Development Team

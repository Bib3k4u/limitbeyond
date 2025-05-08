# LimitBeyond API Documentation

## Authentication Endpoints

### 1. User Registration
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "1234567890",
    "role": "MEMBER"
}
```

**Response:**
```json
{
    "message": "User registered successfully"
}
```

### 2. User Login
```http
POST /api/auth/signin
```

**Request Body:**
```json
{
    "username": "johndoe",
    "password": "password123"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User Management Endpoints

### 1. Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response:**
```json
{
    "id": "123",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "1234567890",
    "roles": ["MEMBER"],
    "active": true
}
```

### 2. Get All Trainers (Admin Only)
```http
GET /api/users/trainers
Authorization: Bearer {token}
```

**Response:**
```json
[
    {
        "id": "456",
        "username": "trainer1",
        "email": "trainer1@example.com",
        "firstName": "Trainer",
        "lastName": "One",
        "roles": ["TRAINER"],
        "active": true,
        "assignedMembers": ["123", "789"]
    }
]
```

### 3. Get All Members (Admin/Trainer)
```http
GET /api/users/members
Authorization: Bearer {token}
```

**Response:**
```json
[
    {
        "id": "123",
        "username": "member1",
        "email": "member1@example.com",
        "firstName": "Member",
        "lastName": "One",
        "roles": ["MEMBER"],
        "active": true,
        "assignedTrainer": "456"
    }
]
```

### 4. Activate User (Admin Only)
```http
PUT /api/users/{userId}/activate
Authorization: Bearer {token}
```

**Response:**
```json
{
    "message": "User activated successfully"
}
```

### 5. Assign Trainer to Member (Admin Only)
```http
PUT /api/users/member/{memberId}/assign-trainer
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "trainerId": "456"
}
```

**Response:**
```json
{
    "message": "Trainer assigned successfully"
}
```

## Feedback Endpoints

### 1. Create Feedback (Member Only)
```http
POST /api/feedback
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "title": "Gym Equipment Feedback",
    "content": "The treadmill in zone 2 needs maintenance."
}
```

**Response:**
```json
{
    "message": "Feedback submitted successfully"
}
```

### 2. Get Feedback
```http
GET /api/feedback
Authorization: Bearer {token}
```

**Response:**
```json
[
    {
        "id": "789",
        "memberId": "123",
        "title": "Gym Equipment Feedback",
        "content": "The treadmill in zone 2 needs maintenance.",
        "createdAt": "2024-03-15T10:30:00",
        "responses": [
            {
                "responderId": "456",
                "content": "Thank you for reporting. We'll fix it today.",
                "responseTime": "2024-03-15T11:00:00"
            }
        ]
    }
]
```

### 3. Respond to Feedback (Admin/Trainer)
```http
POST /api/feedback/{feedbackId}/respond
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "content": "Thank you for reporting. We'll fix it today."
}
```

**Response:**
```json
{
    "message": "Response added successfully"
}
```

## Diet Chat Endpoints

### 1. Create Diet Chat (Member Only)
```http
POST /api/diet-chat
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "title": "Diet Plan Discussion",
    "initialQuery": "I need help with my protein intake calculation."
}
```

**Response:**
```json
{
    "message": "Diet chat created successfully"
}
```

### 2. Get Diet Chats
```http
GET /api/diet-chat
Authorization: Bearer {token}
```

**Response:**
```json
[
    {
        "id": "101",
        "memberId": "123",
        "title": "Diet Plan Discussion",
        "initialQuery": "I need help with my protein intake calculation.",
        "createdAt": "2024-03-15T14:00:00",
        "messages": [
            {
                "senderId": "123",
                "content": "I need help with my protein intake calculation.",
                "timestamp": "2024-03-15T14:00:00",
                "senderRole": "MEMBER"
            },
            {
                "senderId": "456",
                "content": "Sure, let's calculate based on your weight and activity level.",
                "timestamp": "2024-03-15T14:15:00",
                "senderRole": "TRAINER"
            }
        ]
    }
]
```

### 3. Reply to Diet Chat (Admin/Trainer)
```http
POST /api/diet-chat/{chatId}/reply
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "content": "Sure, let's calculate based on your weight and activity level."
}
```

**Response:**
```json
{
    "message": "Reply added successfully"
}
```

## General Notes

1. All requests requiring authentication must include the JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

2. Error Responses follow this format:
```json
{
    "message": "Error message description"
}
```

3. HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 
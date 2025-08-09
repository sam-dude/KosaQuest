GET
/user/profile
Get user profile
Headers
Authorization: Bearer JWT_TOKEN required
Response (200)
{
                                    "status": "OK",
                                    "message": "Profile retrieved successfully",
                                    "data": {
                                    "user": {
                                    "id": "user_id",
                                    "name": "John Doe",
                                    "email": "john.doe@example.com",
                                    "xp": 150,
                                    "isEmailVerified": true,
                                    "createdAt": "2024-01-01T00:00:00.000Z",
                                    "updatedAt": "2024-01-01T00:00:00.000Z"
                                    }
                                    }
                                    }
Response Codes
200
Profile retrieved successfully
401
User not authenticated
404
User not found
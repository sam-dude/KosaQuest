https://github.com/sam-dude/KosaQuest.git


GET
/stories
Get all stories
Query Parameters

                                    difficulty: Filter by difficulty (Beginner, Intermediate, Advanced) optional
                                    language: Filter by language (English, Native) optional
                                
Response (200)
{
                                    "status": "OK",
                                    "message": "Stories retrieved successfully",
                                    "data": {
                                    "stories": [
                                    {
                                    "storyId": "story_001",
                                    "title": "The Wise Tortoise",
                                    "description": "A story about patience and wisdom",
                                    "language": "English",
                                    "difficulty": "Beginner",
                                    "totalXP": 50
                                    }
                                    ],
                                    "count": 1
                                    }
                                    }
GET
/stories/:storyId
Get story by ID
URL Parameters
storyId: Story ID required
                                
Response (200)
{
                                    "status": "OK",
                                    "message": "Story retrieved successfully",
                                    "data": {
                                    "storyId": "story_001",
                                    "title": "The Wise Tortoise",
                                    "description": "A story about patience and wisdom",
                                    "language": "English",
                                    "difficulty": "Beginner",
                                    "pages": [
                                    {
                                    "pageNo": 1,
                                    "english": "Once upon a time...",
                                    "native": "Il était une fois..."
                                    }
                                    ],
                                    "quizzes": [
                                    {
                                    "questionId": "q1",
                                    "question": "What is the main lesson of the story?",
                                    "options": ["Patience", "Speed", "Luck", "Money"],
                                    "answer": "Patience"
                                    }
                                    ],
                                    "totalXP": 50
                                    }
                                    }
Response Codes
200
Story retrieved successfully
400
Story ID is required
404
Story not found
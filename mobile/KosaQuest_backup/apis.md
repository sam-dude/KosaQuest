POST
/quiz/submit
Submit quiz answers
Headers
Authorization: Bearer JWT_TOKEN required
Request Body
{
                                    "storyId": "story_001", // required
                                    "responses": [ // required
                                    {
                                    "questionId": "q1",
                                    "answer": "Patience"
                                    },
                                    {
                                    "questionId": "q2",
                                    "answer": "Wisdom"
                                    }
                                    ]
                                    }
Response (200)
{
                                    "status": "OK",
                                    "message": "Quiz submitted successfully",
                                    "data": {
                                    "xpEarned": 50,
                                    "totalXP": 150,
                                    "score": 8,
                                    "maxScore": 10,
                                    "scorePercentage": 80,
                                    "results": [
                                    {
                                    "questionId": "q1",
                                    "answer": "Patience",
                                    "isCorrect": true,
                                    "pointsEarned": 5
                                    }
                                    ]
                                    }
                                    }
Response Codes
200
Quiz submitted successfully
400
Story ID and responses array are required
401
User not authenticated
404
Story not found
409
You have already completed this story

POST
/nft/mint
Mint NFT badge
Headers
Authorization: Bearer JWT_TOKEN required
Request Body
{
                                    "badgeType": "proverb_apprentice" // optional, defaults
                                        to proverb_apprentice
                                    }
Available Badge Types

                                    proverb_apprentice - 1 XP required (First story completion)
                                    story_master - 500 XP required (Complete 10 stories)
                                    quiz_champion - 250 XP required (Perfect scores on 5 quizzes)
                                    language_explorer - 1000 XP required (Multiple languages)
                                
Response (201)
{
                                    "status": "Created",
                                    "message": "NFT badge minted successfully",
                                    "data": {
                                    "badgeLink": "https://opensea.io/assets/kosa-quest/proverb_apprentice-user_id",
                                    "txHash": "0xabc123def456...",
                                    "badge": {
                                    "id": "badge_id",
                                    "name": "Proverb Apprentice",
                                    "type": "proverb_apprentice",
                                    "description": "Completed your first story and earned your first XP",
                                    "imageUrl": "https://example.com/badges/proverb-apprentice.png",
                                    "issuedAt": "2024-01-01T00:00:00.000Z"
                                    }
                                    }
                                    }
Response Codes
201
NFT badge minted successfully
400
Invalid badge type or insufficient XP
401
User not authenticated
404
User not found
409
Badge already minted for this user
GET
/nft/my-badges
Get user's NFT badges
Headers
Authorization: Bearer JWT_TOKEN required
Response (200)
{
                                    "status": "OK",
                                    "message": "Badges retrieved successfully",
                                    "data": {
                                    "badges": [
                                    {
                                    "id": "badge_id",
                                    "name": "Proverb Apprentice",
                                    "type": "proverb_apprentice",
                                    "description": "Completed your first story and earned your first XP",
                                    "imageUrl": "https://example.com/badges/proverb-apprentice.png",
                                    "badgeLink": "https://opensea.io/assets/kosa-quest/proverb_apprentice-user_id",
                                    "txHash": "0xabc123def456...",
                                    "issuedAt": "2024-01-01T00:00:00.000Z"
                                    }
                                    ],
                                    "count": 1
                                    }
                                    }
GET
/nft/check-eligibility
Check badge eligibility
Headers
Authorization: Bearer JWT_TOKEN required
Response (200)
{
                                    "status": "OK",
                                    "message": "Badge eligibility checked successfully",
                                    "data": {
                                    "eligibleBadges": [
                                    {
                                    "type": "proverb_apprentice",
                                    "name": "Proverb Apprentice",
                                    "description": "Completed your first story and earned your first XP",
                                    "xpRequired": 1
                                    }
                                    ],
                                    "userXP": 150
                                    }
                                    }
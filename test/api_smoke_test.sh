#!/bin/bash

# Add a new user
echo "Adding a new user..."
curl -X PUT https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users \
-H "Content-Type: application/json" \
-d '{"name": "testUser"}'
echo "User created." 

# Add a new flashcard
echo "Adding a new flashcard..."
curl -X PUT https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users/flashcards \
-H "Content-Type: application/json" \
-d '{"userID": "testUser", "term": "Sample Term", "definition": "Sample Definition"}'
echo "Flashcard added."

# Get user's flashcards
echo "Retrieving flashcards..."
curl -X GET "https://c0cfd7la93.execute-api.us-east-2.amazonaws.com/users/flashcards?userID=testUser"
echo "Retrieved flashcards." 
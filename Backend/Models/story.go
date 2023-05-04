package models

import "time"

type Story struct {
	StoryId      int       `json:"storyId"`
	UserId       int       `json:"userId"`
	Title        string    `json:"title"`
	Energy       int       `json:"energy"`
	Focus        int       `json:"focus"`
	Creativity   int       `json:"creativity"`
	Irritability int       `json:"irritability"`
	Anxiety      int       `json:"anxiety"`
	Happiness    int       `json:"happiness"`
	Journal      string    `json:"journal"`
	Date         time.Time `json:"date"`
	Votes        int       `json:"votes"`
}

// energy INT,
// 	focus INT,
// 	creativity INT,
// 	irritability INT,
// 	happiness INT,
// 	anxiety INT,

type StoryDrugs struct {
	Story
	Drugs []UserDrug `json:"drugs"`
}

/*
JSON and SQL inserts for testing
{
	"userid": 1,
	"calmness": 0,
	"focus": 10,
	"creativity": 10,
	"mood": 8,
	"irritability": 6,
	"wakefulness": 9,
	"rating": 10,
	"journal": "ahh yeah"
}

{
		"userId": 1,
		"drugId": 3,
		"dosage": "1mg 2x Daily"
}


INSERT INTO stories (userid,calmness,focus,creativity,irritability,mood,wakefulness,rating,journal,date)
VALUES (1,2,5,6,10,5,4,6,'test3','2022-02-12');
*/

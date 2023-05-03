package models

import "time"

type UserDrug struct {
	UserDrugId  int    `json:"userDrugId"`
	UserId      int    `json:"userId"`
	DrugId      int    `json:"drugId"`
	DrugName    string `json:"drugName"`
	Dosage      string `json:"dosage"`
	DateStarted time.Time `json:"dateStarted"`
	DateEnded   time.Time `json:"dateEnded"`
}

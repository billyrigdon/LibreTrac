package models

import "time"

type Disorder struct {
	DisorderId      int    `json:"disorderId"`
	DisorderName    string `json:"disorderName"`
}

type UserDisorder struct {
	UserDisorderId 	int		`json:"userDisorderId"`
	UserId			int		`json:"userId"`
	DisorderId      int    	`json:"disorderId"`
	DisorderName    string 	`json:"disorderName"`
	DiagnoseDate    time.Time 	`json:"diagnoseDate"`
}
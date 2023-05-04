package models

//TODO: Add username
type UserProfile struct {
	UserId                 int    `json:"userId"`
	Username               string `json:"username"`
	// Age                    int    `json:"age"`
	// Weight                 int    `json:"weight"`
	// Country                string `json:"country"`
	// Avatar                 string `json:"avatar"`
	// Status                 string `json:"status"`
	Reputation             int    `json:"reputation"`
	// FunFact                string `json:"funFact"`
	CovidVaccine           bool   `json:"covidVaccine"`
	Smoker                 bool   `json:"smoker"`
	Drinker                bool   `json:"drinker"`
	// TwoFactor              bool   `json:"twoFactor"`
	OptOutOfPublicStories  bool   `json:"optOutOfPublicStories"`
	// CameraPermission       bool   `json:"cameraPermission"`
	// MicrophonePermission   bool   `json:"microphonePermission"`
	NotificationPermission bool   `json:"notificationPermission"`
	// FilePermission         bool   `json:"filePermission"`
	// NightMode              bool   `json:"nightMode"`
	// HighContrast           bool   `json:"highContrast"`
	// SlowInternet           bool   `json:"slowInternet"`
	TextSize               int    `json:"textSize"`
	// ScreenReader           bool   `json:"screenReader"`
}

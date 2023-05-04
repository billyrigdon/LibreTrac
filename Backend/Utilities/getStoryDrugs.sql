SELECT drugId 
FROM user_drugs.ud
JOIN stories s on ud.userId = s.userId
WHERE ud.userId = 
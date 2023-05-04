CREATE PROCEDURE getAvgDrugCombo(drugA int,drugB int)
LANGUAGE SQL
AS $$
BEGIN
	DROP TABLE IF EXISTS temp_user_drugs;

-- Get users who have taken or are taking both drug 1 and 2
	SELECT ud1.userId,
		ud1.drugId as drug1,
		ud1.dateStarted as drug1DateStart,
		ud1.dateEnded as drug1DateEnd,
		ud2.drugId as drug2,
		ud2.dateStarted drug2DateStart,
		ud2.dateEnded drug2DateEnd
	INTO TEMP temp_user_drugs
	FROM user_drugs ud1
	INNER JOIN user_drugs ud2
		ON ud1.userId = ud2.userId
			AND ud1.userDrugId != ud2.userDrugId
	WHERE ud1.drugId = drugA
		AND ud2.drugId = drugB;

--Join the temp_user_drugs table with the stories table to only pull in stories by users 
--who have taken both drugs. Filter this further by only showing stories within the date
--range of dateStarted and dateEnded of both drugs.
	SELECT 
		AVG(calmness) as Calmness,
		AVG(focus) as Focus,
		AVG(creativity) as Creativity,
		AVG(irritability) as Irritability,
		AVG(mood) as Mood,
		AVG(wakefulness) as Wakefulness,
		AVG(rating) as Rating
	FROM stories s
	INNER JOIN temp_user_drugs tud
		ON tud.userId = s.userId
	WHERE s.date >= tud.drug1DateStart
		AND s.date >= tud.drug2DateStart
		AND (
			s.date <= tud.drug1DateEnd
				OR
			tud.drug1DateEnd IS NULL 
		)
		AND (
			s.date <= tud.drug2DateEnd
				OR
			tud.drug2DateEnd IS NULL
		);
END; $$
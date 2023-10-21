--User tables
CREATE TABLE users (
	userId SERIAL PRIMARY KEY,
	username TEXT,
	password TEXT,
	email TEXT,
	dateCreated TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX user_email
ON users(email);

CREATE UNIQUE INDEX user_name
ON users(username);


CREATE TABLE user_profile (
	userId INT,
	username TEXT,
	age INT,
	weight INT,
	country TEXT,
	avatar TEXT,
	status TEXT,
	reputation INT,
	funFact TEXT,
	covidVaccine BOOLEAN, 
	smoker BOOLEAN,
	drinker BOOLEAN,
	twoFactor BOOLEAN,
	optOutOfPublicStories BOOLEAN,
	cameraPermission BOOLEAN,
	microphonePermission BOOLEAN,
	notificationPermission BOOLEAN,
	filePermission BOOLEAN,
	nightMode BOOLEAN,
	highContrast BOOLEAN,
	slowInternet BOOLEAN,
	textSize INT,
	screenReader BOOLEAN,
	CONSTRAINT fk_userId
		FOREIGN KEY(userId)
			REFERENCES users(userId)
);

CREATE UNIQUE INDEX profile_userId
ON user_profile(userId);

-- Stories
CREATE TABLE stories (
	storyId SERIAL PRIMARY KEY,
	userId INT,
	title TEXT,
	energy INT,
	focus INT,
	creativity INT,
	irritability INT,
	happiness INT,
	anxiety INT,
	journal TEXT,
 	date TIMESTAMPTZ DEFAULT NOW(),
	CONSTRAINT fk_userId
		FOREIGN KEY(userId)
			REFERENCES users(userId)
);

CREATE TABLE story_votes (
	storyId INT,
	userId INT,
	CONSTRAINT fk_storyId FOREIGN KEY(storyId) REFERENCES stories(storyId),
	CONSTRAINT fk_userId FOREIGN KEY(userId) REFERENCES users(userId)
);

CREATE UNIQUE INDEX story_vote
ON story_votes(userId,storyId);

CREATE TABLE story_comments (
	commentId SERIAL PRIMARY KEY,
	storyId INT,
	userId INT,
	content TEXT,
	parentCommentId INT,
	dateCreated TIMESTAMPTZ DEFAULT NOW(),
	updatedAt TIMESTAMPTZ DEFAULT NOW(),
	CONSTRAINT fk_storyId FOREIGN KEY(storyId) REFERENCES stories(storyId),
	CONSTRAINT fk_userId FOREIGN KEY(userId) REFERENCES users(userId),
	CONSTRAINT fk_parentCommentId FOREIGN KEY(parentCommentId) REFERENCES story_comments(commentId)
);

CREATE TABLE notifications (
	notificationId SERIAL PRIMARY KEY,
	storyId INT,
	viewed BOOLEAN,
	parentCommentId INT,
	userId INT,
	commentId INT,
);

CREATE TABLE comment_votes (
	commentId INT,
	userId INT,
	CONSTRAINT fk_commentId FOREIGN KEY(commentId) REFERENCES story_comments(commentId),
	CONSTRAINT fk_userId FOREIGN KEY(userId) REFERENCES users(userId)
);

CREATE UNIQUE INDEX comment_vote
ON comment_votes(userId,commentId);


--Drug tables
CREATE TABLE drugs (
	drugId SERIAL PRIMARY KEY,
	name TEXT UNIQUE
);

CREATE TABLE user_drugs (
	userDrugId SERIAL PRIMARY KEY,
	userId INT,
	dosage TEXT,
	drugId INT,
	dateStarted TIMESTAMPTZ DEFAULT NOW(),
	dateEnded TIMESTAMPTZ,
	-- CONSTRAINT fk_drugId FOREIGN KEY(drugId) REFERENCES drugs(drugId),
	CONSTRAINT fk_userId FOREIGN KEY(userId) REFERENCES users(userId)
);

SELECT userDrugId
		FROM user_drugs
		WHERE userId = 5
		AND drugId = 12707
		AND dateEnded IS NULL;


CREATE TABLE disorders (
	disorderId SERIAL PRIMARY KEY,
	disorderName TEXT
);

CREATE TABLE user_disorders (
	userDisorderId SERIAL PRIMARY KEY,
	userId INT,
	disorderName TEXT,
	disorderId INT,
	diagnoseDate TIMESTAMPTZ,
	CONSTRAINT fk_userId FOREIGN KEY(userId) REFERENCES users(userId)
);

INSERT INTO drugs (drugId, name) VALUES
(1, 'Lamictal'),
(2, 'Risperidone'),
(3, 'Ritalin'),
(4, 'Zoloft'),
(5, 'Bupropion'),
(6, 'Pantoprazole'),
(7, 'Levetiractetam'),
(8, 'Piracetam'),
(9, 'Pramiracetam'),
(10, 'Noopept'),
(11, 'Modafinil'),
(12, 'Lisdexamfetamine'),
(13, 'Amphetamine Salts'),
(14, 'THC'),
(15, 'CBD'),
(16, 'Abilify'),
(17, 'Xanax'),
(18, 'Lexapro'),
(19, 'L-Theanine'),
(20, 'Creatine'),
(21, 'Caffeine'),
(22, 'Omega 3'),
(23, 'Multivitamin'),
(24, 'Magnesium'),
(25, 'Melatonin'),
(26, 'Methylphenidate'),
(27, 'Remeron'),
(127, 'Mushrooms'),
(128, 'DMT'),
(129, 'Cocaine'),
(131, 'MDMA'),
(132, 'Ketamine'),
(133, 'Heroin'),
(134, 'Alcohol'),
(135, 'Nicotine'),
(136, 'DXM'),
(137, 'Psilocybin'),
(138, 'Mescaline'),
(139, 'Kratom'),
(140, 'Ibuprofen'),
(141, 'Acetaminophen'),
(142, 'Lisinopril'),
(143, 'Simvastatin'),
(144, 'Metformin'),
(145, 'Aspirin'),
(146, 'Lorazepam'),
(147, 'Cetirizine'),
(148, 'Fluoxetine'),
(149, 'Amlodipine'),
(150, 'Gabapentin'),
(151, 'Losartan'),
(152, 'Omeprazole'),
(154, 'Atorvastatin'),
(155, 'Sertraline'),
(156, 'Trazodone'),
(157, 'Escitalopram'),
(158, 'Alprazolam'),
(159, 'Meloxicam'),
(160, 'Venlafaxine'),
(161, 'Hydrochlorothiazide'),
(162, 'Montelukast'),
(163, 'Clonazepam'),
(164, 'Carvedilol'),
(165, 'Oxycodone'),
(166, 'Methylprednisolone'),
(167, 'Cyclobenzaprine'),
(168, 'Prednisone'),
(169, 'Furosemide'),
(170, 'Zolpidem'),
(171, 'Rosuvastatin'),
(172, 'Diclofenac'),
(173, 'Levothyroxine'),
(174, 'Metoprolol'),
(175, 'Cephalexin'),
(176, 'Propranolol'),
(177, 'Prednisolone'),
(178, 'Amoxicillin'),
(179, 'Quetiapine'),
(180, 'Azithromycin'),
(181, 'Citalopram'),
(182, 'Ranitidine'),
(183, 'Metronidazole'),
(184, 'Sumatriptan'),
(185, 'Warfarin'),
(186, 'Valsartan'),
(187, 'Nifedipine'),
(188, 'Glipizide'),
(189, 'Duloxetine'),
(190, 'Budesonide'),
(191, 'Mirtazapine'),
(192, 'Tamsulosin'),
(194, 'Finasteride'),
(195, 'Famotidine'),
(196, 'Pravastatin'),
(197, 'Spironolactone'),
(198, 'Candesartan'),
(199, 'Insulin'),
(200, 'Hydroxyzine'),
(201, 'Cefdin');

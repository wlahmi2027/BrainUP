CREATE TABLE utilisateur (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  mot_de_passe VARCHAR(255),
  role VARCHAR(50), -- 'etudiant' or 'enseignant'
  specialite VARCHAR(255), -- only for enseignant
  progression FLOAT,       -- only for etudiant
  score_moyen FLOAT        -- only for etudiant
);

-- enseignant table
CREATE TABLE enseignant (
  id INT PRIMARY KEY,
  specialite VARCHAR(255),
  CONSTRAINT fk_enseignant_utilisateur FOREIGN KEY (id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- etudiant table
CREATE TABLE etudiant (
  id INT PRIMARY KEY,
  progression FLOAT,
  score_moyen FLOAT,
  CONSTRAINT fk_etudiant_utilisateur FOREIGN KEY (id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- cours table
CREATE TABLE cours (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  enseignant_id INT,
  CONSTRAINT fk_cours_enseignant FOREIGN KEY (enseignant_id) REFERENCES enseignant(id) ON DELETE CASCADE
);

-- lecon table
CREATE TABLE lecon (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(255),
  contenu TEXT,
  course_id INT,
  CONSTRAINT fk_lecon_cours FOREIGN KEY (course_id) REFERENCES cours(id) ON DELETE CASCADE
);

-- quiz table
CREATE TABLE quiz (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(255),
  course_id INT,
  CONSTRAINT fk_quiz_cours FOREIGN KEY (course_id) REFERENCES cours(id) ON DELETE CASCADE
);

-- question table
CREATE TABLE question (
  id SERIAL PRIMARY KEY,
  enonce TEXT,
  options VARCHAR(255),
  reponse_correcte VARCHAR(255),
  quiz_id INT,
  CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

-- resultat table
CREATE TABLE resultat (
  id SERIAL PRIMARY KEY,
  user_id INT,
  quiz_id INT,
  score FLOAT,
  date DATE,
  CONSTRAINT fk_resultat_utilisateur FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
  CONSTRAINT fk_resultat_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

-- recommandation table
CREATE TABLE recommandation (
  id SERIAL PRIMARY KEY,
  user_id INT,
  course_id INT,
  score_recommendation FLOAT,
  CONSTRAINT fk_recommandation_utilisateur FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
  CONSTRAINT fk_recommandation_cours FOREIGN KEY (course_id) REFERENCES cours(id) ON DELETE CASCADE
);

-- iaservice table
CREATE TABLE iaservice (
  id SERIAL PRIMARY KEY
);
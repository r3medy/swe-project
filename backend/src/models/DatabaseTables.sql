USE swe_project;
---------------------------
CREATE TABLE users (
  userId INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  role ENUM('Admin', 'Freelance', 'Client') NOT NULL DEFAULT 'Client', 
  -- User Details
  firstName VARCHAR(100) NOT NULL, 
  lastName 	VARCHAR(100) NOT NULL, 
  email 	VARCHAR(100) NOT NULL UNIQUE, 
  username	VARCHAR(100) NOT NULL UNIQUE,
  -- User specifics
  title VARCHAR(100), 
  country VARCHAR(100), 
  bio TEXT, 
  -- Security specifics
  hashedPassword CHAR(100) NOT NULL, 
  SSN VARCHAR(20) UNIQUE, 
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (userId)
);
---------------------------
CREATE TABLE posts (
  -- IDs
  postId INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  clientId INT UNSIGNED NOT NULL, 
  -- Job details
  jobTitle VARCHAR(255) NOT NULL, 
  jobType ENUM('Fixed', 'Hourly') NOT NULL, 
  jobDescription TEXT, 
  -- Payment
  budget INT UNSIGNED, 
  hourlyRate INT UNSIGNED, 
  -- Others
  status ENUM('Pending', 'Accepted', 'Refused'), 
  isJobAccepted BOOLEAN DEFAULT FALSE, 
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (postId), 
  CONSTRAINT fk_posts_client FOREIGN KEY (clientId) REFERENCES users(userId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE savedPosts (
  -- Primary keys
  userId INT UNSIGNED NOT NULL, 
  postId INT UNSIGNED NOT NULL, 
  savedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (userId, postId), 
  CONSTRAINT fk_saved_users FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE, 
  CONSTRAINT fk_saved_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE proposals (
  -- IDs
  proposalId INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  freelancerId INT UNSIGNED NOT NULL, 
  postId INT UNSIGNED NOT NULL, 
  -- Proposal Info
  description TEXT, 
  status ENUM('Pending', 'Accepted', 'Refused'), 
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (proposalId, freelancerId, postId), 
  CONSTRAINT fk_proposal_user FOREIGN KEY (freelancerId) REFERENCES users(userId) ON DELETE CASCADE, 
  CONSTRAINT fk_proposal_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE chatLogs (
  -- IDs
  postId INT UNSIGNED NOT NULL, 
  freelancerId INT UNSIGNED NOT NULL, 
  clientId INT UNSIGNED NOT NULL, 
  -- Message Info
  sender ENUM('Freelancer', 'Client'), 
  content TEXT NOT NULL, 
  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (postId, freelancerId, clientId), 
  CONSTRAINT fk_chat_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE, 
  CONSTRAINT fk_chat_freelancer FOREIGN KEY (freelancerId) REFERENCES users(userId) ON DELETE CASCADE, 
  CONSTRAINT fk_chat_client FOREIGN KEY (clientId) REFERENCES users(userId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE tags (
  -- IDs
  tagId INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  -- Tag Info
  tagName VARCHAR(100) NOT NULL UNIQUE, 
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (tagId)
);
---------------------------
CREATE TABLE postTags (
  -- IDs
  postId INT UNSIGNED NOT NULL, 
  tagId INT UNSIGNED NOT NULL, 
  -- Constraints
  PRIMARY KEY (postId, tagId), 
  CONSTRAINT fk_posttags_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE, 
  CONSTRAINT fk_posttags_tag FOREIGN KEY (tagId) REFERENCES tags(tagId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE notifications (
  -- IDs
  notificationId INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  userId INT UNSIGNED NOT NULL, 
  -- Notification Info
  content TEXT NOT NULL, 
  isMarkedRead BOOLEAN DEFAULT FALSE, 
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (notificationId, userId), 
  CONSTRAINT fk_notifications_user FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

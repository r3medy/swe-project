USE swe_project;
---------------------------
CREATE TABLE users (
  userId INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  role   ENUM('Admin', 'Freelancer', 'Client') NOT NULL DEFAULT 'Client', 
  -- User Details
  firstName VARCHAR(100) NOT NULL, 
  lastName 	VARCHAR(100) NOT NULL, 
  email 	VARCHAR(100) NOT NULL UNIQUE, 
  username	VARCHAR(100) NOT NULL UNIQUE,
  -- User specifics
  title   VARCHAR(100), 
  country VARCHAR(100), 
  bio     TEXT, 
  gender  ENUM('Male', 'Female') NOT NULL,
  profilePicture VARCHAR(255),
  -- Security specifics
  hashedPassword CHAR(100) NOT NULL, 
  createdAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (userId)
);
---------------------------
CREATE TABLE posts (
  -- IDs
  postId     INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  clientId   INT UNSIGNED NOT NULL, 
  -- Job details
  jobTitle   VARCHAR(255) NOT NULL, 
  jobType    ENUM('Fixed', 'Hourly') NOT NULL, 
  jobDescription TEXT, 
  jobThumbnail	 VARCHAR(255),
  -- Payment
  budget     INT UNSIGNED, 
  hourlyRate INT UNSIGNED, 
  -- Others
  status        ENUM('Pending', 'Accepted', 'Refused'), 
  isJobAccepted BOOLEAN DEFAULT FALSE, 
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (postId), 
  CONSTRAINT fk_posts_client FOREIGN KEY (clientId) REFERENCES users(userId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE savedPosts (
  -- Primary keys
  userId   INT UNSIGNED NOT NULL, 
  postId   INT UNSIGNED NOT NULL, 
  savedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (userId, postId), 
  CONSTRAINT fk_saved_users FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE, 
  CONSTRAINT fk_saved_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE proposals (
  -- IDs
  proposalId   INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  freelancerId INT UNSIGNED NOT NULL, 
  postId       INT UNSIGNED NOT NULL, 
  -- Proposal Info
  description  TEXT, 
  status       ENUM('Pending', 'Accepted', 'Refused'), 
  submittedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (proposalId), 
  CONSTRAINT fk_proposal_user FOREIGN KEY (freelancerId) REFERENCES users(userId) ON DELETE CASCADE, 
  CONSTRAINT fk_proposal_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE chats (
  -- IDs
  chatId       INT UNSIGNED AUTO_INCREMENT NOT NULL,
  postId       INT UNSIGNED NOT NULL,
  freelancerId INT UNSIGNED NOT NULL,
  clientId     INT UNSIGNED NOT NULL,
  -- Date
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  PRIMARY KEY (chatId),
  CONSTRAINT fk_chats_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
  CONSTRAINT fk_chats_freelancer FOREIGN KEY (freelancerId) REFERENCES users(userId) ON DELETE CASCADE,
  CONSTRAINT fk_chats_client FOREIGN KEY (clientId) REFERENCES users(userId) ON DELETE CASCADE
);
-- Indexes
CREATE INDEX idx_chats_client ON chats (clientId);
CREATE INDEX idx_chats_freelancer ON chats (freelancerId);
CREATE INDEX idx_chats_post ON chats (postId);
---------------------------
CREATE TABLE messages (
  -- IDs
  messageId      INT UNSIGNED AUTO_INCREMENT NOT NULL,
  chatId         INT UNSIGNED NOT NULL,
  senderId       INT UNSIGNED NOT NULL,
  -- Message Info
  messageContent TEXT NOT NULL,
  -- Date
  sentAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  PRIMARY KEY (messageId),
  CONSTRAINT fk_messages_chat FOREIGN KEY (chatId) REFERENCES chats(chatId) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (senderId) REFERENCES users(userId) ON DELETE CASCADE
);
-- Indexes
CREATE INDEX idx_messages_chat ON messages (chatId);
CREATE INDEX idx_messages_sender ON messages (senderId);
CREATE INDEX idx_messages_sentAt ON messages (sentAt);
---------------------------
CREATE TABLE tags (
  -- IDs
  tagId        INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  -- Tag Info
  tagName      VARCHAR(100) NOT NULL UNIQUE, 
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (tagId)
);
---------------------------
CREATE TABLE usertags (
  -- IDs
  userId INT UNSIGNED NOT NULL, 
  tagId  INT UNSIGNED NOT NULL, 
  -- Constraints
  PRIMARY KEY (userId, tagId), 
  CONSTRAINT fk_usertags_user FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE, 
  CONSTRAINT fk_usertags_tag FOREIGN KEY (tagId) REFERENCES tags(tagId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE posttags (
  -- IDs
  postId INT UNSIGNED NOT NULL, 
  tagId  INT UNSIGNED NOT NULL, 
  -- Constraints
  PRIMARY KEY (postId, tagId), 
  CONSTRAINT fk_posttags_post FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE, 
  CONSTRAINT fk_posttags_tag FOREIGN KEY (tagId) REFERENCES tags(tagId) ON DELETE CASCADE
);
---------------------------
CREATE TABLE notifications (
  -- IDs
  notificationId INT UNSIGNED AUTO_INCREMENT NOT NULL, 
  userId         INT UNSIGNED NOT NULL, 
  -- Notification Info
  content        TEXT NOT NULL, 
  isMarkedRead   BOOLEAN DEFAULT FALSE, 
  createdAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  -- Constraints
  PRIMARY KEY (notificationId), 
  CONSTRAINT fk_notifications_user FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

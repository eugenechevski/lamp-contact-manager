create database contact_manager;
use contact_manager;


CREATE TABLE IF NOT EXISTS contact_manager.USERS (
  ID INT NOT NULL AUTO_INCREMENT,
  FIRST VARCHAR(50) NOT NULL DEFAULT '',
  LAST VARCHAR(50) NOT NULL DEFAULT '',
  USER VARCHAR(50) NOT NULL DEFAULT '',
  PASSWORD VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contact_manager.CONTACTS (
  ID INT NOT NULL AUTO_INCREMENT,
  FIRST VARCHAR(50) NOT NULL DEFAULT '',
  LAST VARCHAR(50) NOT NULL DEFAULT '',
  EMAIL VARCHAR(50) NOT NULL DEFAULT '',
  PHONE_NUMBER VARCHAR(50) NOT NULL DEFAULT '',
  USER_ID INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID),
  CONSTRAINT fk_user_id FOREIGN KEY (USER_ID) REFERENCES contact_manager.USERS(ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
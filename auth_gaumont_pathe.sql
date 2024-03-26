#------------------------------------------------------------
#        Script MySQL.
#------------------------------------------------------------

#------------------------------------------------------------
# Table: users
#------------------------------------------------------------

CREATE TABLE users(
        id_users   Int  Auto_increment  NOT NULL ,
        uid        Varchar (50) NOT NULL ,
        login      Varchar (50) NOT NULL ,
        password   Varchar (50) NOT NULL ,
        created_at Date NOT NULL ,
        update_at  Date NOT NULL ,
        status     Varchar (50) NOT NULL
	,CONSTRAINT users_PK PRIMARY KEY (id_users)
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: roles
#------------------------------------------------------------

CREATE TABLE roles(
        id_roles Int  Auto_increment  NOT NULL ,
        uid      Varchar (50) NOT NULL ,
        name     Varchar (50) NOT NULL
	,CONSTRAINT roles_PK PRIMARY KEY (id_roles)
)ENGINE=InnoDB;

#------------------------------------------------------------
# Table: possede
#------------------------------------------------------------

CREATE TABLE possede(
        id_roles Int NOT NULL ,
        id_users Int NOT NULL
	,CONSTRAINT possede_PK PRIMARY KEY (id_roles,id_users)

	,CONSTRAINT possede_roles_FK FOREIGN KEY (id_roles) REFERENCES roles(id_roles)
	,CONSTRAINT possede_users0_FK FOREIGN KEY (id_users) REFERENCES users(id_users)
)ENGINE=InnoDB;


#-----------------------------------

DELIMITER |
CREATE TRIGGER `setRolesUid` BEFORE INSERT ON `roles`
 FOR EACH ROW BEGIN
    SET new.uid = SHA(CONCAT(new.name, new.id_roles));
END |
DELIMITER ;

DELIMITER |
CREATE TRIGGER `setUsersUid` BEFORE INSERT ON `users`
 FOR EACH ROW BEGIN
    SET new.uid = SHA(CONCAT(new.login, new.id_users));
END |
DELIMITER ;

INSERT INTO `roles`(`name`) VALUES ('ROLE_ADMIN');
INSERT INTO `roles`(`name`) VALUES ('ROLE_USER');


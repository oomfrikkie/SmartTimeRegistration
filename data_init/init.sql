-- SQL initialization script for SmartTimeRegistration

CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Example account
INSERT INTO account (name, surname, email, password)
VALUES ('John', 'Doe', 'john.doe@example.com', 'password123');

CREATE TABLE event (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL,
    account_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE
);


-- Project table
CREATE TABLE project (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Example project
INSERT INTO project (name)
VALUES ('Smart Time Registration');

-- Enum type for project member roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_member_role') THEN
        CREATE TYPE project_member_role AS ENUM ('admin', 'employee');
    END IF;
END$$;


-- Project member (many-to-many between account and project)
CREATE TABLE project_member (
    project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    roles project_member_role NOT NULL,
    PRIMARY KEY (project_id, account_id)
);

-- Invitations table
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    inviter_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    invitee_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL
);

-- Add John Doe as ADMIN to the first project
-- Assumes the first project and account have id = 1
INSERT INTO project_member (project_id, account_id, roles)
VALUES (1, 1, 'admin');

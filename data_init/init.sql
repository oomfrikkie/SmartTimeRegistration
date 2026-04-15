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

-- Account token table for email verification and password reset
CREATE TABLE IF NOT EXISTS account_token (
    token_id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    token_type VARCHAR(50) NOT NULL, -- 'EMAIL_VERIFICATION' or 'PASSWORD_RESET'
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    account_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE
);

CREATE TABLE event (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    package_name VARCHAR(255),
    project_name VARCHAR(255),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL,
    location VARCHAR(500),
    description TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    is_series BOOLEAN DEFAULT FALSE,
    attendees JSON,
    account_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE
);


-- Project table
CREATE TABLE project (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) default 'ongoing' NOT NULL,
    total_hours DECIMAL(6, 2) DEFAULT 0 NOT NULL,
    start_date DATE,
    end_date DATE
);

-- Example project
INSERT INTO project (name, status, total_hours, start_date, end_date)
VALUES ('Smart Time Registration', 'ongoing', 125, '2026-02-13', '2026-08-08');

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
    assigned_hours INT,
    PRIMARY KEY (project_id, account_id)
);

-- Enum type for invitation status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
        CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
    END IF;
END$$;


-- Invitations table
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    inviter_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    invitee_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    assigned_hours INT,
    status invitation_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO project_member (project_id, account_id, roles, assigned_hours)
VALUES (1, 1, 'admin', 0);


-- Work package table
CREATE TABLE work_package (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_hours DECIMAL(6,2) DEFAULT 0 NOT NULL,
    project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE
);

-- Join table for project members and work packages (many-to-many)
CREATE TABLE project_member_work_package (
    project_member_project_id INTEGER NOT NULL,
    project_member_account_id INTEGER NOT NULL,
    work_package_id INTEGER NOT NULL REFERENCES work_package(id) ON DELETE CASCADE,
    PRIMARY KEY (project_member_project_id, project_member_account_id, work_package_id),
    FOREIGN KEY (project_member_project_id, project_member_account_id)
        REFERENCES project_member(project_id, account_id) ON DELETE CASCADE
);

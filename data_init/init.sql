-- SQL initialization script for SmartTimeRegistration

CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE event (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL
);


-- Project table
CREATE TABLE project (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Project members (many-to-many between account and project)
CREATE TABLE project_members (
    project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
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

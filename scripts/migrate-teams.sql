-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, accountant_id)
);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  invited_by INTEGER NOT NULL REFERENCES accountants(id),
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups (for access control within a team)
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group members (which team members belong to which groups)
CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  team_member_id INTEGER NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  UNIQUE(group_id, team_member_id)
);

-- Group clients (which clients a group can access)
CREATE TABLE IF NOT EXISTS group_clients (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE(group_id, client_id)
);

-- Direct client assignments (contractor access — individual member to specific client)
CREATE TABLE IF NOT EXISTS client_assignments (
  id SERIAL PRIMARY KEY,
  team_member_id INTEGER NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES accountants(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_member_id, client_id)
);

-- Multiple emails per client
CREATE TABLE IF NOT EXISTS client_emails (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  label VARCHAR(100) DEFAULT 'Primary',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification BCC emails
CREATE TABLE IF NOT EXISTS notification_emails (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, email)
);

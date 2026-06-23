# Local Development Setup

## Prerequisites

You need to have installed:
- Docker Desktop (includes Docker and Docker Compose)
- Node.js 18+ (for running npm locally if needed)

Download Docker Desktop: https://www.docker.com/products/docker-desktop

## Quick Start

### 1. Navigate to Project Directory

```bash
cd ~/Desktop/accountant-hub
```

### 2. Start Services with Docker Compose

```bash
docker-compose up --build
```

This will:
- Build the Next.js application
- Start PostgreSQL database
- Start the Next.js development server

### 3. Wait for Services to Be Ready

You'll see output like:
```
accountant-hub-db  | PostgreSQL is up and running
accountant-hub-app | ready - started server on 0.0.0.0:3000
```

### 4. Open Application

Visit: **http://localhost:3000**

You should see the Accountant Hub landing page.

---

## Testing the Application

### 1. Create an Account

- Click "Create Account"
- Fill in: Name, Email, Password (8+ characters)
- Click "Create Account"

### 2. Login

- Click "Login"
- Enter your email and password
- You should see the dashboard

### 3. Logout

- Click "Logout" button
- You'll be redirected to home page

---

## Database Access

If you want to directly access the PostgreSQL database:

```bash
# In another terminal
docker-compose exec postgres psql -U accountant -d accountant_hub

# Then you can run SQL queries:
\dt  # List all tables
SELECT * FROM accountants;  # View all accountants
\q   # Quit
```

---

## Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```

---

## Troubleshooting

### Port 3000 or 5432 Already in Use

If you get "port already in use" error:

```bash
# On Mac/Linux: Find and kill process
lsof -i :3000  # Find what's using port 3000
kill -9 <PID>  # Kill that process

# Or change ports in docker-compose.yml
```

### Can't Connect to Database

Make sure PostgreSQL container is healthy:

```bash
docker-compose ps
```

You should see:
```
accountant-hub-db  ... (healthy)
accountant-hub-app ... (running)
```

If db shows unhealthy, check logs:

```bash
docker-compose logs postgres
```

### Need to Reset Database

```bash
docker-compose down -v
docker-compose up --build
```

---

## Next Steps

Once you have it running locally:

1. **Test signup/login** - Make sure auth works
2. **Add API endpoints** for:
   - Creating clients
   - Creating document requests
   - Uploading files
3. **Build UI components** for:
   - Client management
   - Document request portal
   - File upload interface
4. **Add email reminders** via SendGrid

---

## Development Tips

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f postgres
```

### Code Changes Auto-Reload

When you edit Next.js code, it will automatically reload in the browser. No need to restart!

### Database Schema Changes

If you need to modify the database schema, edit `/scripts/init.sql` and restart:

```bash
docker-compose down -v
docker-compose up --build
```

---

## Environment Variables

The `.env.local` file contains:
- `DATABASE_URL` - Connection string for PostgreSQL
- `NEXTAUTH_SECRET` - Secret for JWT tokens (change this in production!)
- `NEXTAUTH_URL` - Application URL

These are already set for local development.

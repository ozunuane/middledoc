# GitHub Actions CI/CD Pipeline

This directory contains the automated CI/CD pipeline for the Accountant Hub project.

## Workflows

### `ci.yml` — Main CI/CD Pipeline

Automatically runs on every push to `main` or `develop` branches, and on pull requests.

#### Jobs:

1. **Test** (Required)
   - Runs on Node.js 18.x and 20.x
   - Installs dependencies
   - Runs TypeScript checks
   - Executes test suite
   - Generates coverage reports
   - Uploads to Codecov

2. **Build** (Required after tests pass)
   - Builds Docker image
   - Pushes to GitHub Container Registry (GHCR)
   - Only pushes on `main` branch
   - Uses build cache for faster rebuilds

3. **Quality** (Required)
   - TypeScript type checking
   - Strict mode validation
   - Code quality verification

4. **Security** (Optional)
   - NPM audit for vulnerabilities
   - Snyk scan (if configured)
   - Flags moderate/high severity issues

5. **Deploy** (Automatic on main)
   - Deploys to Hetzner VM via SSH
   - Pulls latest code
   - Restarts Docker containers
   - Requires GitHub secrets configured

6. **Notify** (Always runs)
   - Posts status to Slack (optional)
   - Summarizes job results

---

## Setup Instructions

### 1. Configure GitHub Secrets

In your repository settings (`Settings → Secrets and variables → Actions`), add:

#### Required for Deployment:
```
HETZNER_HOST          = your-vm-ip-address
HETZNER_SSH_KEY       = (paste your private SSH key here)
```

#### Optional:
```
SNYK_TOKEN            = (Snyk security scanning token)
SLACK_WEBHOOK         = (Slack webhook for notifications)
```

### 2. Create SSH Key for GitHub Actions

```bash
# On your local machine, generate a key for CI/CD:
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -C "github-actions@accountant-hub"

# Copy private key to GitHub Secrets:
cat ~/.ssh/github-actions

# Add public key to Hetzner VM:
ssh-copy-id -i ~/.ssh/github-actions.pub root@your-vm-ip
```

### 3. Prepare Hetzner VM

Before first deployment, ensure the VM has:

```bash
# SSH into VM and prepare:
mkdir -p /app
cd /app
git clone https://github.com/YOUR_USERNAME/accountant-hub.git .

# Create docker volumes directory
mkdir -p /var/lib/postgresql

# Copy environment file
cat > .env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://accountant:prod_password@postgres:5432/accountant_hub
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-domain.com
SENDGRID_API_KEY=your-sendgrid-key
EOF

# Run once manually to set up database
docker-compose up -d
docker-compose exec postgres psql -U accountant -d accountant_hub -f /docker-entrypoint-initdb.d/init.sql
```

### 4. Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: accountant
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: accountant_hub
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U accountant"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  app:
    image: ${REGISTRY}/${IMAGE_NAME}:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/auth/me"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Then update the deploy script in `ci.yml`:

```yaml
script: |
  cd /app
  git pull origin main
  docker-compose -f docker-compose.prod.yml down
  docker-compose -f docker-compose.prod.yml pull
  docker-compose -f docker-compose.prod.yml up -d
  echo "✅ Deployment complete!"
```

---

## Workflow Status

View workflow status in your GitHub repository:
- **Actions** tab shows all workflow runs
- Click on any run to see detailed logs
- Check individual job logs for debugging

---

## Environment Variables

### Development (`.env.local`)
```
NODE_ENV=development
DATABASE_URL=postgresql://accountant:dev_password_change_me@localhost:5432/accountant_hub
NEXTAUTH_SECRET=dev-secret-change-this
NEXTAUTH_URL=http://localhost:3000
SENDGRID_API_KEY=
```

### Production (`.env.production` on VM)
```
NODE_ENV=production
DATABASE_URL=postgresql://accountant:STRONG_PASSWORD@postgres:5432/accountant_hub
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
NEXTAUTH_URL=https://your-domain.com
SENDGRID_API_KEY=SG.your_key_here
```

---

## Monitoring & Debugging

### View Live Logs on VM
```bash
# SSH into VM
ssh root@your-vm-ip

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Check container status
docker-compose ps

# Database connection test
docker-compose exec postgres psql -U accountant -d accountant_hub -c "SELECT version();"
```

### GitHub Actions Logs
- Click on failed job in GitHub Actions
- Expand step to see detailed error
- Search for "Error:" or "FAIL" keywords

### Common Issues

**Deployment fails with "Connection refused":**
- Verify SSH key is added to Hetzner VM: `ssh root@your-vm-ip`
- Check GitHub secret `HETZNER_HOST` is correct IP

**Database migration fails:**
- SSH into VM and run: `docker-compose logs postgres`
- Verify `/scripts/init.sql` exists
- Check database volume has space: `df -h`

**Docker image won't build:**
- Check Dockerfile syntax
- Verify all dependencies in package.json are installed
- Review build logs in GitHub Actions

---

## Best Practices

1. **Create feature branches** for development
   - Automatic testing on all PRs
   - No deployment until PR is merged to main

2. **Commit messages**
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`
   - Helps with changelog generation

3. **Protection rules** (Optional)
   - Require status checks to pass before merge
   - Require PR review before merge
   - Dismiss stale PR approvals on new commits

4. **Monitoring**
   - Set up Slack notifications for failures
   - Monitor logs on production VM regularly
   - Set up uptime monitoring (e.g., Uptime Robot)

---

## Troubleshooting

### Tests fail locally but pass in CI
- Check Node.js version: `node --version`
- Clear node_modules: `rm -rf node_modules && npm ci`
- Check for platform-specific issues (Windows vs Linux)

### Deployment fails but tests passed
- Verify Docker image was built successfully
- Check Hetzner VM has enough disk space: `df -h`
- Verify SSH key permissions: `ssh -i key_file root@host`

### Need to rollback?
```bash
# SSH into VM
ssh root@your-vm-ip

# List Docker images
docker images | grep accountant-hub

# Tag previous working image as latest
docker tag accountant-hub:previous accountant-hub:latest

# Restart with previous version
docker-compose down
docker-compose up -d
```

---

## Contact & Support

For issues or questions:
- Check GitHub Actions logs first
- Review error messages in console output
- Check VM logs: `docker-compose logs -f`
- Review this README for common issues

# Deployment Checklist

## Pre-Deployment (First Time Setup)

### GitHub Setup
- [ ] Create GitHub repository
- [ ] Push code to `main` branch
- [ ] Go to **Settings → Secrets and variables → Actions**
- [ ] Add secrets:
  - `HETZNER_HOST` = your Hetzner VM IP
  - `HETZNER_SSH_KEY` = your SSH private key
  - (Optional) `SNYK_TOKEN` = Snyk security token
  - (Optional) `SLACK_WEBHOOK` = Slack webhook for notifications

### Hetzner VM Setup
- [ ] Create CPX11 VM on Hetzner with Ubuntu 22.04
- [ ] Set up firewall rules (allow ports 80, 443, 22)
- [ ] SSH into VM: `ssh root@your-vm-ip`
- [ ] Run initial setup:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
apt install -y docker.io docker-compose

# Start Docker
systemctl start docker && systemctl enable docker

# Create app directory
mkdir -p /app && cd /app

# Clone repository
git clone https://github.com/YOUR_USERNAME/accountant-hub.git .

# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://accountant:CHANGE_ME@postgres:5432/accountant_hub
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.com
SENDGRID_API_KEY=SG.your_key_here
EOF

# Create uploads directory
mkdir -p uploads && chmod 777 uploads

# Initial Docker startup
docker-compose up -d

# Verify containers running
docker-compose ps
```

### DNS Setup (If using domain)
- [ ] Update DNS to point to Hetzner VM IP
- [ ] Wait for DNS propagation (5-30 minutes)

### SSL Certificate (Optional but recommended)
- [ ] Install certbot: `apt install -y certbot python3-certbot-nginx`
- [ ] Get certificate: `certbot certonly --standalone -d your-domain.com`
- [ ] Update nginx config (if using reverse proxy)

---

## Deployment Process

### Automatic Deployment (Recommended)
1. Make changes on feature branch
2. Create pull request
3. GitHub Actions runs tests automatically
4. Review PR and get approval
5. Merge to `main` branch
6. GitHub Actions automatically deploys to Hetzner VM
7. Check `.github/workflows/ci.yml` logs for deployment status

### Manual Deployment
If automatic deployment fails:

```bash
# SSH into VM
ssh root@your-vm-ip

# Navigate to app directory
cd /app

# Pull latest code
git pull origin main

# Restart services
docker-compose down
docker-compose pull
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs -f app
```

---

## Post-Deployment Checks

### Verify Application
- [ ] Open browser: `https://your-vm-ip` or `https://your-domain.com`
- [ ] Home page loads successfully
- [ ] Signup form works
- [ ] Can create account
- [ ] Can login
- [ ] Can access dashboard

### Check Logs
```bash
# View application logs
docker-compose logs app

# View database logs
docker-compose logs postgres

# View all logs
docker-compose logs
```

### Verify Database
```bash
# Connect to database
docker-compose exec postgres psql -U accountant -d accountant_hub

# Check tables created
\dt

# Verify schema loaded
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

# Exit
\q
```

### Monitor Services
```bash
# Check container status
docker-compose ps

# Check disk usage
df -h

# Check CPU/Memory
docker stats

# Check network connectivity
curl http://localhost:3000/api/auth/me
```

---

## Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
# SSH into VM
ssh root@your-vm-ip
cd /app

# Stop current version
docker-compose down

# Revert to previous commit
git reset --hard HEAD~1
git pull origin main

# Restart with previous version
docker-compose up -d

# Verify
docker-compose ps
```

### Database Rollback
```bash
# Backup current database
docker-compose exec postgres pg_dump -U accountant accountant_hub > backup.sql

# Restore from backup (if available)
docker-compose exec postgres psql -U accountant accountant_hub < backup.sql
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Application is responding: `curl https://your-domain.com`
- [ ] Disk space sufficient: `df -h`
- [ ] No error logs: `docker-compose logs --tail=50 app | grep ERROR`

### Weekly Tasks
- [ ] Review GitHub Actions logs for failures
- [ ] Check database size: `docker-compose exec postgres du -sh /var/lib/postgresql/data`
- [ ] Backup database: `docker-compose exec postgres pg_dump -U accountant accountant_hub > backup-$(date +%Y%m%d).sql`

### Monthly Tasks
- [ ] Update OS: `apt update && apt upgrade -y`
- [ ] Update Docker images: `docker-compose pull`
- [ ] Review security logs
- [ ] Test disaster recovery (restore from backup)

---

## Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs app

# Common fixes:
# 1. Check environment variables
cat .env.production

# 2. Verify database is running
docker-compose logs postgres

# 3. Restart everything
docker-compose down
docker-compose up -d
```

### Database errors
```bash
# Check database connection
docker-compose exec postgres psql -U accountant -d accountant_hub -c "SELECT 1"

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Deployment fails
- [ ] Check GitHub Actions logs for error
- [ ] Verify SSH key is correct
- [ ] Verify VM IP is correct
- [ ] Try manual deployment (see above)
- [ ] Check VM has disk space: `df -h`

### Out of disk space
```bash
# Find large files
du -sh /app/*

# Remove Docker build cache
docker system prune -a

# Remove old logs
docker-compose logs --tail=0 > /dev/null

# Last resort: increase volume size on Hetzner
```

---

## Performance Optimization

### Database Optimization
```bash
# Analyze query performance
docker-compose exec postgres psql -U accountant -d accountant_hub << 'EOF'
ANALYZE;
VACUUM ANALYZE;
EOF
```

### Docker Resource Limits
Update `docker-compose.yml`:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Enable Caching
- Implement Redis for session/data caching
- Add CDN for static assets
- Enable Gzip compression

---

## Security Checklist

- [ ] SSH key is secure (permissions 600)
- [ ] Database password is strong
- [ ] NEXTAUTH_SECRET is random (use `openssl rand -base64 32`)
- [ ] Firewall rules are restrictive
- [ ] SSL certificate is valid
- [ ] Regular backups are tested
- [ ] Secrets are not in git history
- [ ] Node.js dependencies are up to date
- [ ] Docker images are from trusted sources

---

## Support & Escalation

### Can't fix it yourself?
1. Check GitHub Actions logs
2. Review application logs: `docker-compose logs -f app`
3. Check this document for similar issues
4. Contact Hetzner support if infrastructure issue
5. File issue on GitHub repository

### Useful Commands
```bash
# SSH into VM
ssh root@your-vm-ip

# View all containers
docker ps -a

# View image info
docker images | grep accountant

# Execute command in container
docker-compose exec app npm run build

# View environment variables
docker-compose config

# Inspect container
docker inspect <container-id>

# Get container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-id>
```

---

**Happy deploying! 🚀**

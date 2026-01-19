# Server Management

DigitalOcean droplet running ryanwaits.com

## Quick Reference

```
IP: 24.144.86.20
SSH: ssh site
User: deploy
App: ~/app
```

## SSH Access

```bash
ssh site                    # connect as deploy user
ssh root@24.144.86.20       # connect as root (if needed)
```

## PM2 (Process Manager)

```bash
pm2 status                  # check app status
pm2 logs site               # tail logs (Ctrl+C to exit)
pm2 logs site --lines 100   # last 100 lines
pm2 restart site            # restart app
pm2 stop site               # stop app
pm2 delete site             # remove from PM2
pm2 start ecosystem.config.js  # start from config
pm2 env 0                   # show environment variables
pm2 monit                   # live monitoring dashboard
```

## Caddy (Reverse Proxy / SSL)

```bash
sudo systemctl status caddy     # check status
sudo systemctl restart caddy    # restart (reloads config)
sudo systemctl stop caddy       # stop
sudo nano /etc/caddy/Caddyfile  # edit config
sudo caddy validate --config /etc/caddy/Caddyfile  # validate config
journalctl -u caddy -f          # tail caddy logs
```

Caddyfile location: `/etc/caddy/Caddyfile`

## Deploy

From local machine:
```bash
git push origin main
```

On server (recommended - just use the script):
```bash
cd ~/app
./scripts/deploy.sh
```

Or manually:
```bash
cd ~/app
git pull
bun install
bun run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp -r .claude .next/standalone/
pm2 restart site
```

## Environment Variables

Stored in: `~/app/ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'site',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      ANTHROPIC_API_KEY: 'sk-ant-...'
    }
  }]
}
```

After editing, restart with:
```bash
pm2 delete site && pm2 start ecosystem.config.js
```

## Health Check

```bash
curl http://localhost:3000/api/health
curl https://ryanwaits.com/api/health
```

## Logs

```bash
pm2 logs site               # app logs
journalctl -u caddy -f      # caddy logs
```

## Firewall

```bash
sudo ufw status             # check firewall
sudo ufw allow 22           # SSH
sudo ufw allow 80           # HTTP
sudo ufw allow 443          # HTTPS
```

## System

```bash
htop                        # system resources
df -h                       # disk usage
free -h                     # memory usage
```

### System Updates

```bash
sudo apt update && sudo apt upgrade -y && sudo reboot
```

After reboot, SSH back in and verify:
```bash
pm2 status
curl https://ryanwaits.com/api/health
```

## Troubleshooting

**App not responding:**
```bash
pm2 status                  # is it running?
pm2 logs site --lines 50    # check for errors
pm2 restart site            # try restarting
```

**SSL issues:**
```bash
sudo systemctl restart caddy
journalctl -u caddy -f      # check for ACME errors
```

**Out of memory:**
```bash
free -h                     # check memory
pm2 restart site            # restart to free memory
```

**Claude Code not working:**
```bash
which claude                # should be /usr/bin/claude
claude --version            # verify it works
pm2 env 0 | grep ANTHROPIC  # check API key is set
```

---

## Optional Enhancements

### GitHub Actions Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DROPLET_HOST }}
          username: ${{ secrets.DROPLET_USER }}
          key: ${{ secrets.DROPLET_SSH_KEY }}
          script: |
            cd ~/app
            ./scripts/deploy.sh

      - name: Health check
        run: |
          sleep 5
          curl -sf https://ryanwaits.com/api/health
```

Add these secrets in GitHub repo → Settings → Secrets:
- `DROPLET_HOST`: 24.144.86.20
- `DROPLET_USER`: deploy
- `DROPLET_SSH_KEY`: contents of your private SSH key

### Monitoring

**Uptime Kuma (self-hosted, free):**
```bash
docker run -d --restart=always -p 3001:3001 louislam/uptime-kuma
```
Then visit http://24.144.86.20:3001 to set up monitoring.

**Betterstack (hosted, free tier):**
- Sign up at https://betterstack.com
- Add https://ryanwaits.com/api/health as a monitor
- Get alerts via email/Slack when site goes down

### Backups

Enable in DigitalOcean dashboard:
- Droplet → Backups → Enable ($2.40/mo)
- Weekly automated snapshots
- Can restore entire droplet if needed

### Log Shipping

**Axiom (free tier):**
```bash
npm install -g @axiomhq/axiom-node
```

Or just use PM2 logs locally - they persist in `~/.pm2/logs/`

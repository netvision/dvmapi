# Verpex Shared Hosting Deployment Guide

This guide explains how to automatically deploy the website to Verpex shared hosting via GitHub Actions.

## Prerequisites

1. **Verpex Hosting Account** with FTP/SFTP access
2. **GitHub Repository** for this project
3. **FTP Credentials** from your Verpex control panel

## Setup Instructions

### Step 1: Get Your Verpex FTP Credentials

1. Log in to your Verpex control panel (cPanel)
2. Navigate to **FTP Accounts** or **File Manager**
3. Note down:
   - FTP Server (e.g., `ftp.yourdomain.com` or `ftp.verpex.com`)
   - FTP Username (e.g., `username@yourdomain.com`)
   - FTP Password
   - Server directory (usually `public_html` or `public_html/subdirectory`)

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

   - **Name**: `FTP_SERVER`  
     **Value**: Your FTP server address (e.g., `ftp.yourdomain.com`)

   - **Name**: `FTP_USERNAME`  
     **Value**: Your FTP username

   - **Name**: `FTP_PASSWORD`  
     **Value**: Your FTP password

### Step 3: Configure Production API URL

1. Open `website/.env.production`
2. Update `VITE_API_BASE_URL` with your actual API URL:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

### Step 4: Adjust Deployment Path (if needed)

If your website should be deployed to a subdirectory instead of the root:

1. Open `.github/workflows/deploy-website.yml`
2. Change the `server-dir` value:
   ```yaml
   server-dir: ./public_html/subdirectory/
   ```

### Step 5: Push to GitHub

Once everything is configured, commit and push to the `main` branch:

```bash
git add .
git commit -m "Configure Verpex deployment"
git push origin main
```

## How It Works

1. **Trigger**: Workflow runs automatically when:
   - You push changes to the `main` branch
   - Changes are made in the `website/` directory
   - You manually trigger it from GitHub Actions tab

2. **Build Process**:
   - Checks out your code
   - Sets up Node.js 20
   - Installs dependencies with `npm ci`
   - Builds the Vue app with `npm run build`
   - Creates optimized production files in `website/dist/`

3. **Deployment**:
   - Connects to your Verpex server via FTP
   - Uploads files from `website/dist/` to `public_html/`
   - Preserves `.htaccess` and other important files

## Important Files

### `.htaccess` for Vue Router (History Mode)

Create this file in your Verpex `public_html/` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures Vue Router works correctly with clean URLs.

## Monitoring Deployments

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. View the deployment progress and logs
4. Each deployment shows:
   - Build status
   - Upload progress
   - Any errors or warnings

## Manual Deployment

You can manually trigger a deployment:

1. Go to **Actions** tab in GitHub
2. Select **Deploy Website to Verpex** workflow
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## Troubleshooting

### Build Fails

- Check the Actions log for specific error messages
- Ensure all dependencies are in `package.json`
- Verify `website/.env.production` has correct API URL

### FTP Connection Fails

- Verify FTP credentials in GitHub Secrets
- Check if your Verpex account allows FTP connections
- Try using IP address instead of hostname
- Ensure firewall allows GitHub Actions IPs

### Website Not Loading After Deployment

- Verify `.htaccess` file exists and is correct
- Check file permissions (755 for directories, 644 for files)
- Clear browser cache
- Check Verpex error logs in cPanel

### API Requests Fail

- Ensure `VITE_API_BASE_URL` in `.env.production` is correct
- Check CORS settings on your API server
- Verify SSL certificate if using HTTPS

## Alternative: SFTP Deployment

If your Verpex hosting uses SFTP instead of FTP:

1. Install SSH key in GitHub Secrets
2. Update `.github/workflows/deploy-website.yml` to use SFTP action:

```yaml
- name: Deploy via SFTP
  uses: wlixcc/SFTP-Deploy-Action@v1.2.4
  with:
    username: ${{ secrets.SFTP_USERNAME }}
    server: ${{ secrets.SFTP_SERVER }}
    ssh_private_key: ${{ secrets.SSH_PRIVATE_KEY }}
    local_path: './website/dist/*'
    remote_path: '/public_html/'
```

## Cost Considerations

- GitHub Actions provides **2,000 free minutes/month** for public repos
- Each deployment takes approximately **2-5 minutes**
- Private repos have limited free minutes (check GitHub pricing)

## Best Practices

1. **Test Locally First**: Always run `npm run build` locally before pushing
2. **Use Branches**: Deploy only from `main` or `production` branch
3. **Monitor Logs**: Check Actions logs after each deployment
4. **Backup**: Keep backups of your live site before major deployments
5. **Environment Variables**: Never commit sensitive data; use GitHub Secrets

## Support

- **Verpex Support**: [https://verpex.com/support](https://verpex.com/support)
- **GitHub Actions Docs**: [https://docs.github.com/actions](https://docs.github.com/actions)
- **FTP Deploy Action**: [https://github.com/SamKirkland/FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)

# Netlify Deployment Guide for ERP Admin

This guide explains how to deploy the ERP Admin Dashboard to Netlify.

## Quick Setup

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Login to Netlify**: Go to [https://app.netlify.com](https://app.netlify.com)

2. **Import Project**:
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository: `netvision/dvmapi`

3. **Configure Build Settings**:
   - **Base directory**: `erp`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `erp/dist`
   - **Branch**: `main`

4. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_BASE_URL` = `https://api.dvmchirawa.ac.in/api/v1`

5. **Deploy**: Click "Deploy site"

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to project root
cd d:\dev\erpapp

# Initialize Netlify site
netlify init

# Deploy
netlify deploy --prod
```

## Configuration Files

### netlify.toml
The `netlify.toml` file at the project root configures:
- Build directory and command
- Publish directory
- Redirects for Vue Router (SPA)
- Cache headers for static assets

### erp/.env.production
Production environment variables:
- `VITE_API_BASE_URL`: Your production API URL

## Custom Domain Setup

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `admin.dvmchirawa.ac.in`)
4. Follow DNS configuration instructions
5. Netlify will automatically provision SSL certificate

### DNS Configuration for Subdomain

Add a CNAME record in your DNS provider:
```
Type: CNAME
Name: admin
Value: your-site-name.netlify.app
```

Or use Netlify DNS:
```
Type: A
Name: admin
Value: 75.2.60.5
```

## Environment Variables

Set these in Netlify Dashboard → Site settings → Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://api.dvmchirawa.ac.in/api/v1` |
| `NODE_VERSION` | `20` |

## Automatic Deployments

Once configured, Netlify will automatically:
- Deploy when you push to `main` branch
- Build preview deployments for pull requests
- Show build logs and deployment status

## Build Status Badge

Add to your README.md:
```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

## Troubleshooting

### Build Fails

1. Check build logs in Netlify dashboard
2. Verify `erp/package.json` has all dependencies
3. Ensure Node version is 20 in build settings

### 404 on Refresh

The `netlify.toml` includes SPA redirects. If still getting 404s:
1. Verify `netlify.toml` is in project root
2. Check redirect rules are applied in Deploy settings

### API Connection Issues

1. Verify `VITE_API_BASE_URL` environment variable
2. Check CORS settings on API server include Netlify domain
3. Ensure API is accessible (try in browser)

### Assets Not Loading

1. Check browser console for errors
2. Verify `base` in `vite.config.ts` if using subdirectory
3. Check cache headers in Network tab

## Deploy Hooks

Create a deploy hook for manual deployments:

1. Go to Site settings → Build & deploy → Build hooks
2. Click "Add build hook"
3. Name it (e.g., "Manual Deploy")
4. Copy the webhook URL
5. Trigger deployment:
   ```bash
   curl -X POST -d {} https://api.netlify.com/build_hooks/YOUR-HOOK-ID
   ```

## Performance Tips

1. **Enable Asset Optimization**:
   - Go to Site settings → Build & deploy → Post processing
   - Enable "Bundle CSS" and "Minify JS"

2. **Configure Cache Headers** (already in netlify.toml):
   - Static assets cached for 1 year
   - HTML not cached for instant updates

3. **Enable Prerendering**:
   - For faster initial load
   - Go to Site settings → Build & deploy → Prerendering

## Cost Considerations

- **Free Tier**: 100GB bandwidth/month, 300 build minutes/month
- Automatic deployments count toward build minutes
- Consider disabling deploy previews if needed

## Best Practices

1. **Use Environment Variables**: Never commit secrets
2. **Test Locally**: Run `npm run build` before pushing
3. **Monitor Deployments**: Check build logs regularly
4. **Use Deploy Previews**: Review changes before merging
5. **Set Up Notifications**: Get alerts for failed deployments

## Support

- Netlify Docs: [https://docs.netlify.com](https://docs.netlify.com)
- Community Forum: [https://answers.netlify.com](https://answers.netlify.com)
- Status Page: [https://www.netlifystatus.com](https://www.netlifystatus.com)

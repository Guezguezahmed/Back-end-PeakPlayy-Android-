# Environment Variables Setup Guide

This guide explains how to configure all environment variables for the DAM Backend application.

## Quick Start

1. **Copy the template file:**
   ```powershell
   # Windows PowerShell
   Copy-Item env.template .env
   
   # Or manually create .env file
   ```

2. **Open the `.env` file** and replace all placeholder values with your actual credentials.

3. **Required variables** (must be configured):
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens (min 20 characters)
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID (if using Google login)
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (if using Google login)
   - `VONAGE_API_KEY` - Vonage API key (if using OTP/SMS)
   - `VONAGE_API_SECRET` - Vonage API secret (if using OTP/SMS)

## Environment Variables Reference

### Application Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode: `development`, `production`, or `test` |
| `PORT` | No | `3001` | Port on which the server will run |

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | **Yes** | `mongodb://127.0.0.1:27017/dam_database` | MongoDB connection string |

**Format:** `mongodb://[username:password@]host[:port][/database][?options]`

**Examples:**
- Local: `mongodb://127.0.0.1:27017/dam_database`
- With auth: `mongodb://user:password@localhost:27017/dam_database`
- Atlas: `mongodb+srv://user:password@cluster.mongodb.net/dam_database`

### JWT Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes** | - | Secret key for signing JWT tokens (min 20 characters) |
| `JWT_EXPIRATION_TIME` | No | `3600s` | Token expiration time (format: `3600s`, `1h`, `7d`) |

**⚠️ Security:** Generate a strong random secret for production:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Application URLs

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BACKEND_URL` | **Yes** | `http://localhost:3001` | Backend URL (no trailing slash!) |
| `FRONTEND_URL` | No | `http://localhost:4200` | Frontend URL for OAuth redirects |

**⚠️ Important:** 
- No trailing slash in `BACKEND_URL`
- Must match exactly in OAuth provider configurations

### Google OAuth2 Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | **Yes** (if using Google) | - | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | **Yes** (if using Google) | - | Google OAuth 2.0 Client Secret |
| `GOOGLE_CALLBACK_URL` | No | Auto-constructed | OAuth callback URL |

**How to get Google OAuth credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create or select a project
3. Enable **Google+ API** or **Google Identity API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI: `{BACKEND_URL}/api/v1/auth/google/redirect`
   - Example: `http://localhost:3001/api/v1/auth/google/redirect`
7. Copy the **Client ID** and **Client Secret**

### Vonage OTP Configuration (SMS)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VONAGE_API_KEY` | **Yes** (if using OTP) | - | Vonage API Key |
| `VONAGE_API_SECRET` | **Yes** (if using OTP) | - | Vonage API Secret |
| `VONAGE_BRAND_NAME` | No | `Vonage` | Brand name for SMS sender |

**How to get Vonage credentials:**

1. Sign up at [Vonage Dashboard](https://dashboard.nexmo.com/)
2. Get your **API Key** and **API Secret** from the dashboard
3. Optionally configure a brand name for SMS sender

### Facebook OAuth2 Configuration (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FACEBOOK_APP_ID` | No | - | Facebook App ID |
| `FACEBOOK_APP_SECRET` | No | - | Facebook App Secret |
| `FACEBOOK_CALLBACK_URL` | No | Auto-constructed | OAuth callback URL |

**Note:** Facebook OAuth is optional and only needed if you want to enable Facebook login.

### Email Configuration (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BREVO_API_KEY` | No | - | Brevo (Sendinblue) API key |
| `MAIL_FROM_EMAIL` | No | - | Sender email address |
| `MAIL_FROM_NAME` | No | - | Sender name |

**Note:** Email configuration is optional and only needed if email verification or notifications are enabled.

### Cookie Configuration (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `COOKIE_DOMAIN` | No | - | Domain for cookies (production only) |

## Example .env File

```env
# Application
NODE_ENV=development
PORT=3001

# Database
MONGO_URI=mongodb://127.0.0.1:27017/dam_database

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_20_characters_long
JWT_EXPIRATION_TIME=3600s

# URLs
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:4200

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/redirect

# Vonage OTP
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret
VONAGE_BRAND_NAME=MyApp
```

## Production Checklist

Before deploying to production:

- [ ] Change `NODE_ENV` to `production`
- [ ] Use a strong, randomly generated `JWT_SECRET` (min 20 characters)
- [ ] Update `BACKEND_URL` to your production domain (HTTPS)
- [ ] Update `FRONTEND_URL` to your production frontend domain
- [ ] Update `MONGO_URI` to your production database
- [ ] Update Google OAuth callback URL in Google Cloud Console
- [ ] Verify all API keys and secrets are correct
- [ ] Never commit `.env` file to version control

## Troubleshooting

### Google OAuth not working?
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that callback URL in Google Cloud Console matches `GOOGLE_CALLBACK_URL`
- Ensure `BACKEND_URL` has no trailing slash

### OTP/SMS not sending?
- Verify `VONAGE_API_KEY` and `VONAGE_API_SECRET` are correct
- Check your Vonage account has sufficient credits
- Verify phone number format is correct (international format with +)

### Database connection failed?
- Check `MONGO_URI` is correct
- Verify MongoDB is running
- Check network/firewall settings if using remote database

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use different secrets** for development and production
3. **Rotate secrets regularly** in production
4. **Use environment-specific values** for different deployments
5. **Keep secrets secure** and limit access to authorized personnel only


# Sales God - Setup Guide

This guide will help you set up the Sales God platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Chrome Browser** - For the extension
- **Git** - For cloning the repository

## Step 1: Database Setup

### 1.1 Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sales_god;

# Exit psql
\q
```

### 1.2 Configure Database Connection

The backend will automatically create tables when you run migrations.

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Required settings:
# - DB_PASSWORD: Your PostgreSQL password
# - JWT_SECRET: A secure random string

# Run database migrations
npm run migrate

# (Optional) Seed database with sample data
npm run seed

# Start the backend server
npm run dev
```

The backend API will start on `http://localhost:3000`

Test the API:
```bash
curl http://localhost:3000/api/health
```

## Step 3: Dashboard Setup

```bash
# Open a new terminal
# Navigate to dashboard directory
cd dashboard

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start the development server
npm run dev
```

The dashboard will open automatically at `http://localhost:3001`

## Step 4: Chrome Extension Setup

### 4.1 Generate Extension Icons

The extension needs icons in the `extension/icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use an online tool like [Favicon Generator](https://www.favicon-generator.org/) or use placeholder icons for testing.

### 4.2 Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension` folder from your project directory
5. The Sales God extension should now appear in your extensions list

### 4.3 Configure Extension

1. Click the Sales God extension icon in Chrome toolbar
2. Click **Settings** button
3. Enter your User ID (e.g., `john.doe@company.com`)
4. Verify API URL is set to `http://localhost:3000`
5. Click **Save Settings**
6. Click **Test Connection** to verify backend connectivity

## Step 5: Test the System

### 5.1 Create a Test User

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "name": "Test User",
    "userId": "test@company.com"
  }'
```

### 5.2 Test Recording Flow

1. Join any Google Meet call (or create a test meeting)
2. Click the Sales God extension icon
3. Click **Start Recording**
4. You should see a recording indicator on the Meet page
5. Speak for a minute (the Web Speech API will transcribe in real-time)
6. Click **Stop Recording**
7. Check the dashboard to see your recording and analysis

### 5.3 View Dashboard

1. Open the dashboard at `http://localhost:3001`
2. Navigate through different sections:
   - **Dashboard**: Overview and top performers
   - **Team Analytics**: Detailed team metrics
   - **Recordings**: All recorded calls
   - **Leaderboard**: Top performers ranking

## Troubleshooting

### Backend Issues

**Error: Database connection failed**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env` file
- Ensure database `sales_god` exists

**Error: Port 3000 already in use**
- Change PORT in `backend/.env`
- Update API URL in extension settings and dashboard `.env`

### Extension Issues

**Recording not starting**
- Check console for errors: Right-click extension → Inspect
- Verify you're on a Google Meet page
- Ensure microphone permissions are granted
- Check User ID is configured in settings

**Transcription not working**
- Web Speech API requires Chrome/Edge browser
- Ensure you're speaking clearly and loudly enough
- Check browser console for errors

**Upload failing**
- Verify backend is running
- Check API URL in extension settings
- Test connection using the Settings page

### Dashboard Issues

**Cannot connect to backend**
- Verify backend is running on correct port
- Check `VITE_API_URL` in dashboard `.env`
- Check CORS settings in backend

**No data showing**
- Ensure you've completed at least one recording
- Check browser console for API errors
- Verify database has data: `SELECT COUNT(*) FROM recordings;`

## Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Security Notes

⚠️ **Important**: This setup is for development only. For production:

1. **Use HTTPS** for all connections
2. **Set strong JWT_SECRET** in backend
3. **Enable proper authentication** in all routes
4. **Configure CORS** to allow only your domains
5. **Use environment-specific** configurations
6. **Enable rate limiting** and request validation
7. **Encrypt sensitive data** in database
8. **Regular security audits**

## Next Steps

1. **Customize Analysis**: Modify `backend/src/services/analysisService.js` to add custom metrics
2. **Add More Metrics**: Extend database schema for additional tracking
3. **Integrate AI**: Add OpenAI API for enhanced transcription and analysis
4. **Setup Notifications**: Add email/Slack notifications for key events
5. **Mobile App**: Build a mobile companion app
6. **Advanced Analytics**: Add predictive analytics and recommendations

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code documentation
3. Check browser/server console logs
4. Open an issue on GitHub (if applicable)

## License

MIT License - See LICENSE file for details


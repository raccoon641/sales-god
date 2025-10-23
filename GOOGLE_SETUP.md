# Google Cloud Speech-to-Text Setup Guide

This guide will help you set up Google Cloud Speech-to-Text API for automatic transcription.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project name: `sales-god` or similar
4. Click **Create**

## Step 2: Enable Speech-to-Text API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Cloud Speech-to-Text API"**
3. Click on it and click **Enable**

## Step 3: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Enter details:
   - **Name**: `sales-god-transcription`
   - **Description**: `Service account for Sales God transcription`
4. Click **Create and Continue**
5. Grant role: **Cloud Speech-to-Text API User**
6. Click **Continue** → **Done**

## Step 4: Create and Download Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create**
6. Save the downloaded JSON file securely

**Important**: Never commit this file to git!

## Step 5: Configure Backend

### Option 1: Environment Variable (Recommended)

```bash
# Add to backend/.env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

Or export in terminal:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

### Option 2: Place in Project

1. Create a `credentials` folder in backend:
   ```bash
   mkdir backend/credentials
   ```

2. Copy the JSON file there:
   ```bash
   cp ~/Downloads/service-account-key.json backend/credentials/google-credentials.json
   ```

3. Add to `.env`:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-credentials.json
   ```

4. Make sure `credentials/` is in `.gitignore`:
   ```bash
   echo "credentials/" >> backend/.gitignore
   ```

## Step 6: Restart Backend

```bash
# Stop the backend (Ctrl+C in the terminal)
# Then restart:
cd backend
npm run dev
```

You should see:
```
✅ Google Speech-to-Text client initialized
```

## Step 7: Test Transcription

1. Record a meeting using the Chrome extension
2. Watch the backend logs for:
   ```
   🔄 Starting transcription for recording: xxx
   ✅ Transcription saved for: xxx
   ✅ Analysis complete for: xxx
   ```
3. Refresh the dashboard to see the transcription and analysis!

---

## Pricing

Google Cloud Speech-to-Text pricing (as of 2024):

- **First 60 minutes per month**: FREE
- **After that**: $0.006 per 15 seconds (~$1.44 per hour)

**Example costs:**
- 100 30-minute calls/month = 50 hours = ~$72/month
- 50 15-minute calls/month = 12.5 hours = ~$18/month

💡 **Tip**: The first 60 minutes are free, great for testing!

---

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution**: Make sure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly.

```bash
# Check if variable is set
echo $GOOGLE_APPLICATION_CREDENTIALS

# Should show the path to your JSON file
```

### Error: "Permission denied"

**Solution**: Make sure the service account has the correct role:
1. Go to **IAM & Admin** → **IAM**
2. Find your service account
3. Add role: **Cloud Speech-to-Text API User**

### Error: "API not enabled"

**Solution**: Enable the Speech-to-Text API:
1. Go to **APIs & Services** → **Library**
2. Search for "Cloud Speech-to-Text API"
3. Click **Enable**

### Transcription not working

**Checklist**:
- [ ] API is enabled in Google Cloud
- [ ] Service account has correct role
- [ ] JSON key file exists and path is correct
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` is set
- [ ] Backend is restarted after setting credentials
- [ ] Audio file is uploaded successfully

Check backend logs for detailed error messages.

---

## Alternative: OpenAI Whisper

If you prefer OpenAI Whisper instead:

1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Modify `transcriptionService.js` to use Whisper API

OpenAI Whisper is often more accurate and handles multiple languages better.

---

## Without Google Credentials

If you don't set up Google Cloud credentials:
- ✅ Extension and dashboard will still work
- ✅ Audio will be recorded and uploaded
- ✅ Recordings will appear in dashboard
- ❌ No transcription text
- ❌ Placeholder analysis metrics only

You can always add Google credentials later and re-process old recordings.

---

## Need Help?

- [Google Cloud Speech-to-Text Docs](https://cloud.google.com/speech-to-text/docs)
- [Authentication Guide](https://cloud.google.com/docs/authentication/getting-started)
- Check `backend/src/services/transcriptionService.js` for code


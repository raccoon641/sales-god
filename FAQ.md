# Sales God - Frequently Asked Questions (FAQ)

## General Questions

### What is Sales God?
Sales God is an AI-powered sales coaching platform that records Google Meet calls, transcribes them in real-time, and provides intelligent analytics to help sales teams improve their performance.

### How much does it cost?
Sales God is open-source and free to use. You only pay for hosting costs if you deploy it yourself (typically $15-100/month depending on scale).

### Is my data private?
Yes! Since you host it yourself, all data stays in your infrastructure. No third parties have access to your recordings or transcriptions.

### What browsers are supported?
Currently, Chrome and Edge browsers are supported for the extension (Manifest V3). The dashboard works in all modern browsers.

## Installation & Setup

### Do I need to be technical to set it up?
Basic technical knowledge is helpful. If you can follow command-line instructions, you should be fine. We provide a quick-start script to automate most of the setup.

### What are the system requirements?
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Chrome or Edge browser
- 2GB RAM minimum
- 10GB storage minimum

### How long does setup take?
With the quick-start script: 10-15 minutes. Manual setup: 30-45 minutes.

### Can I deploy to cloud services?
Yes! We provide deployment guides for Heroku, AWS, Vercel, Netlify, and Docker. See DEPLOYMENT.md.

### Do I need a database?
Yes, PostgreSQL is required for storing recordings, transcriptions, and analytics.

## Chrome Extension

### Why isn't the extension recording?
Check:
1. You're on a Google Meet page
2. User ID is configured in settings
3. Backend API is running and accessible
4. Microphone permissions are granted

### Can I record other video platforms?
Currently only Google Meet is supported. Zoom, Teams, and other platforms could be added with modifications.

### Will other participants know I'm recording?
The extension doesn't notify other participants. You should inform participants as per your local laws and company policy.

### Does it work on mobile?
No, the Chrome extension only works on desktop Chrome/Edge. A mobile app is on the roadmap.

### Can I record without transcription?
Yes, but you'll miss out on the AI analysis features. The audio is still saved if configured.

## Transcription & Analysis

### How accurate is the transcription?
The Web Speech API is about 80-90% accurate in quiet environments with clear speech. Accuracy decreases with background noise.

### Can I edit transcriptions?
Currently, no. This feature could be added in the future.

### What languages are supported?
Currently English only. The Web Speech API supports multiple languages, so this can be extended.

### How does speaker identification work?
Basic speaker identification is implemented. Advanced diarization (distinguishing multiple speakers) is planned for future updates.

### What metrics are tracked?
- Talk ratio (rep vs prospect)
- Questions asked
- Filler words count
- Speaking pace
- Sentiment analysis
- Topic extraction
- Objection detection
- Next steps identification
- Overall score (0-100)

### How is the overall score calculated?
The score is based on multiple factors:
- Base score: 70
- Deductions for excessive filler words
- Bonus for asking questions
- Bonus for positive sentiment
- Bonus for establishing next steps

### Can I customize the metrics?
Yes! The analysis service is fully customizable. Edit `backend/src/services/analysisService.js` to add or modify metrics.

## Dashboard

### Who can access the dashboard?
Anyone with access to the URL can view the dashboard. In production, you should add authentication (see security section).

### Can I customize the dashboard?
Yes! The React codebase is fully customizable. Modify components in `dashboard/src/`.

### Can I export data?
Currently, no built-in export feature. You can query the database directly or add export functionality.

### Can I integrate with CRM?
Not out of the box, but the API can be extended to integrate with Salesforce, HubSpot, etc.

### Does it work on mobile devices?
The dashboard is mobile-responsive and works on smartphones and tablets.

## Performance & Scalability

### How many users can it support?
Depends on your infrastructure:
- Small (1-10 users): Basic VPS ($12/month)
- Medium (10-50 users): Better VPS or cloud ($50/month)
- Large (50+ users): Multiple servers with load balancing

### How much storage do I need?
Each hour of recording:
- Transcription: ~100KB
- Audio file: ~10-50MB (if stored)
- Metadata: ~10KB

For 100 calls/month: ~5GB storage needed.

### Can it handle real-time analysis?
Yes, transcription happens in real-time. Analysis runs when recording stops (takes 1-5 seconds).

### Will it slow down Google Meet?
No, the extension runs in the background and has minimal impact on Meet performance.

## Security & Privacy

### Is it secure?
The codebase includes basic security features:
- JWT authentication
- CORS protection
- Rate limiting
- Input validation

For production, you should implement additional security measures.

### Do you store sensitive data?
All data is stored in your database. You control what's stored and for how long.

### Is it GDPR compliant?
The architecture supports GDPR compliance, but you need to:
- Add consent mechanisms
- Implement data deletion
- Add data export
- Create privacy policy

### How do I handle recording consent?
You should:
1. Inform participants before recording
2. Get explicit consent
3. Follow local laws (one-party vs two-party consent)
4. Have clear privacy policies

### Can I delete recordings?
Yes, the dashboard includes a delete function (can be added). You can also delete from the database directly.

## Troubleshooting

### Backend won't start
Check:
1. PostgreSQL is running
2. Database exists and credentials are correct
3. Port 3000 is available
4. All dependencies are installed (`npm install`)

### Extension can't connect to backend
Check:
1. Backend is running
2. API URL is correct in extension settings
3. CORS is configured correctly
4. No firewall blocking connections

### Transcription not working
Check:
1. Microphone permissions granted
2. Chrome/Edge browser (not Firefox)
3. Speaking clearly and loud enough
4. No excessive background noise

### Dashboard not loading data
Check:
1. Backend API is running
2. VITE_API_URL is correct in dashboard `.env`
3. Browser console for errors
4. Database has data

### Recording fails to upload
Check:
1. Backend is accessible
2. API endpoint is correct
3. File size isn't too large
4. Check backend logs for errors

### Database errors
Check:
1. PostgreSQL is running
2. Migrations have been run
3. Database user has correct permissions
4. Database connection string is correct

## Development

### Can I contribute?
Yes! Fork the repo, make changes, and submit a pull request.

### What's the tech stack?
- **Extension**: JavaScript, Chrome APIs, Web Speech API
- **Backend**: Node.js, Express, PostgreSQL, Natural NLP
- **Dashboard**: React, TailwindCSS, Recharts, Vite

### How do I add new features?
1. Understand the architecture
2. Make changes to relevant components
3. Test thoroughly
4. Update documentation
5. Submit pull request

### Can I modify the analysis algorithm?
Yes! Edit `backend/src/services/analysisService.js` to customize metrics and scoring.

### How do I add new API endpoints?
1. Create route file in `backend/src/routes/`
2. Add to `server.js`
3. Update documentation

## Business Questions

### Can I use this for my company?
Yes! It's MIT licensed, free for commercial use.

### Can I white-label it?
Yes, you can rebrand and customize everything.

### Can I sell it as a service?
Yes, under the MIT license you can offer it as a SaaS product.

### Do you offer paid support?
This is an open-source project. Commercial support could be arranged separately.

### Can I hire you to customize it?
Potentially! Create an issue or contact the maintainers.

## Integrations

### Can it integrate with Salesforce?
Not currently, but the API can be extended to sync with Salesforce.

### What about Slack notifications?
Not built-in, but easy to add using Slack webhooks.

### Can I connect to Google Calendar?
Not currently, but could be added to automatically record scheduled meetings.

### Email notifications?
Not built-in, but can be added using nodemailer.

## Comparison Questions

### How does it compare to Gong?
**Sales God:**
- Open source & self-hosted
- Free (except hosting)
- Full control of data
- Customizable

**Gong:**
- Commercial SaaS
- $1000+/user/year
- More features
- Professional support

### What about Chorus.ai?
Similar comparison - Sales God is free and self-hosted, while Chorus is enterprise SaaS with more advanced features but high cost.

### Why not just use Zoom recording?
Zoom records video but doesn't provide:
- AI analysis
- Metrics tracking
- Team analytics
- Coaching insights
- Performance trends

## Future Features

### What's on the roadmap?
- Advanced speaker diarization
- OpenAI integration
- Mobile app
- More video platform support
- Real-time coaching
- CRM integrations
- Email summaries
- Advanced analytics

### When will [feature] be available?
This is a community-driven project. Features are added based on contributions and demand.

### Can I request a feature?
Yes! Create an issue on GitHub with your feature request.

### How can I help build features?
Fork the repo, implement the feature, and submit a pull request!

## Support

### Where do I get help?
1. Check this FAQ
2. Read SETUP.md and other docs
3. Check code comments
4. Search existing issues
5. Create a new issue with details

### How do I report bugs?
Create an issue on GitHub with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs
- Environment details

### Is there a community?
The project is new. Community will grow with adoption. Consider:
- GitHub Discussions
- Discord server (if created)
- Stack Overflow tags

### Can I get a demo?
Screenshots are in the README. For a live demo, deploy the quick-start locally.

## Legal

### What's the license?
MIT License - very permissive, allows commercial use.

### Do I need to give attribution?
Not required by MIT license, but appreciated!

### Can I remove your branding?
Yes, you can customize everything.

### Recording laws?
You're responsible for complying with:
- Local recording consent laws
- GDPR (if in EU)
- CCPA (if in California)
- Industry regulations
- Company policies

Always inform participants you're recording!

## Miscellaneous

### Why "Sales God"?
Because it helps you become a sales god! 💪

### Is this production-ready?
Yes, with proper security hardening and testing. The codebase is complete and functional.

### Can I use this for customer support?
Yes! It works for any Google Meet calls, not just sales.

### What about for training?
Absolutely! Great for training, quality assurance, and coaching.

### Can teachers use it?
Yes, works for online classes, tutoring, etc.

---

## Still have questions?

1. **Check the docs**: README.md, SETUP.md, FEATURES.md, DEPLOYMENT.md
2. **Check the code**: Well-commented and structured
3. **Create an issue**: Describe your question in detail
4. **Contribute**: Help improve the project!

**Remember**: This is open source - the code is the ultimate documentation! 🚀


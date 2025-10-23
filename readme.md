# Sales God - AI-Powered Sales Coaching Platform

A comprehensive sales coaching platform that records, transcribes, and analyzes Google Meet sales calls and product demos.

## 🎯 Features

- **Chrome Extension**: Records Google Meet audio and automatically transcribes conversations
- **AI Analysis**: Analyzes transcriptions for key metrics:
  - Talk time ratio (rep vs prospect)
  - Filler words detection
  - Sentiment analysis
  - Key topics and questions asked
  - Call duration and engagement metrics
  - Objection handling
  - Next steps mentioned
- **Admin Dashboard**: Real-time analytics for sales managers
  - Individual rep performance
  - Team comparisons
  - Call history and recordings
  - Performance trends

## 🏗️ Architecture

```
sales-god/
├── extension/          # Chrome extension for Google Meet
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── dashboard/         # React admin dashboard
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Chrome browser

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and API keys in .env
npm run migrate
npm run dev
```

### Extension Setup
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension` folder
4. Configure your user ID in the extension options

### Dashboard Setup
```bash
cd dashboard
npm install
npm start
```

## 🔧 Technologies

- **Extension**: JavaScript, Chrome APIs, Web Speech API
- **Backend**: Node.js, Express, PostgreSQL, OpenAI API
- **Dashboard**: React, TailwindCSS, Recharts
- **Analysis**: NLP, sentiment analysis, conversation intelligence

## 📊 Metrics Tracked

1. **Talk Ratio**: Percentage of time rep vs prospect speaks
2. **Filler Words**: Count of "um", "uh", "like", etc.
3. **Questions Asked**: Number and quality of questions
4. **Next Steps**: Whether clear next steps were established
5. **Sentiment**: Overall call sentiment and tone
6. **Engagement**: Interaction patterns and energy levels
7. **Key Topics**: Product features discussed, pain points identified
8. **Objections**: How objections were handled

## 🔐 Security

- User authentication with JWT
- Secure audio upload with encryption
- Role-based access control (Admin, Manager, Rep)
- GDPR compliant data handling

## 📝 License

MIT License - See LICENSE file for details

# 🏠 IDX Real Estate Platform

Full-stack property search application for California real estate listings with AI-powered chatbot assistance.

**Tech Stack:**
- Backend: Spring Boot (Java) + MySQL
- Frontend: React + TypeScript + Vite + Tailwind CSS
- AI: Anthropic Claude for intelligent Q&A

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.6+
- Node.js 18+ and npm
- MySQL database
- Anthropic API key (optional, for AI chatbot)

### Setup

1. **Configure Database & API Keys:**
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   # Edit application.properties with your database credentials
   
   # Optional: Add Anthropic API key for AI chatbot
   export ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
   ```

2. **Start Backend:**
   ```bash
   ./mvnw spring-boot:run
   # Backend runs on http://localhost:8080
   ```

3. **Start Frontend:**
   ```bash
   cd idx-frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## 📁 Project Structure

```
IDX Backend/
├── idx-frontend/          # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main component
│   │   ├── services/      # API service
│   │   └── types/         # TypeScript types
│   └── package.json
├── src/main/
│   ├── java/              # Spring Boot backend
│   │   └── com/idxexchange/idxbackend/
│   │       ├── controller/ # REST API
│   │       ├── service/   # Business logic
│   │       ├── repository/# Data access
│   │       └── model/     # Entity models
│   └── resources/
│       └── application.properties.example
└── pom.xml
```

## ✨ Features

### 🤖 AI Chatbot Assistant with Lead Qualification
- **Lead qualification through natural conversation**
- Automatically captures buyer preferences (budget, location, features)
- Context-aware responses using property database
- Smart follow-up questions based on user responses
- Beautiful floating UI with conversation history
- Logs qualified leads for follow-up
- **[Setup Guide →](./CHATBOT_SETUP_GUIDE.md)**
- **[Lead Qualification Guide →](./LEAD_QUALIFICATION_GUIDE.md)**

### 🔍 Smart Search
- Natural Language Processing for property searches
- Traditional filters (price, beds, baths, location)
- Grid and map view modes
- Interactive property map with markers

### 📊 Property Management
- Detailed property information
- Photo galleries
- Agent contact information
- Advanced filtering and sorting

## 🔌 API Endpoints

### Properties
- **GET `/properties`** - Search properties with filters
  - Query params: `city`, `state`, `zip`, `minPrice`, `maxPrice`, `beds`, `minBeds`, `baths`, `minBaths`, `page`, `size`, `sort`
  - Example: `http://localhost:8080/properties?city=Los Angeles&minPrice=300000&maxPrice=500000`

- **GET `/properties/{id}`** - Get property by ID

- **POST `/properties/nlp-search`** - Natural language property search
  - Body: Plain text query (e.g., "3 bedroom house with pool in LA under 500k")

- **POST `/properties/nlp-parse`** - Parse NLP query without search

### AI Chatbot
- **POST `/api/chatbot/chat`** - Send message to AI assistant
  - Body: `{ "role": "user", "content": "Your question", "conversationHistory": [...] }`
  - Returns: AI-generated response with suggestions

## ⚙️ Configuration

- **Database:** Edit `src/main/resources/application.properties` (not committed to Git)
- **API URL:** Configured in `idx-frontend/src/services/api.ts` (default: `http://localhost:8080`)
- **Anthropic API Key:** Set environment variable `ANTHROPIC_API_KEY` or add to `application.properties`
  - Get your key at: https://console.anthropic.com/settings/keys
  - **See [CHATBOT_SETUP_GUIDE.md](./CHATBOT_SETUP_GUIDE.md) for detailed setup**

## 📦 Deployment

Ready for production! Deploy in ~10 minutes.

**📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.**

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Backend → Render**
   - Create Web Service from your GitHub repo
   - Environment: Docker
   - Set env vars: 
     - `SPRING_DATASOURCE_URL`
     - `SPRING_DATASOURCE_USERNAME`
     - `SPRING_DATASOURCE_PASSWORD`
     - `ANTHROPIC_API_KEY` (for AI chatbot)
   - Deploy! Your URL: `https://your-app.onrender.com`

3. **Frontend → Vercel**
   - Import repo, root directory: `idx-frontend`
   - Set env var: `VITE_API_BASE_URL=https://your-backend.onrender.com`
   - Deploy! Your URL: `https://your-app.vercel.app`

4. **Update CORS**
   - In Render, set: `ALLOWED_ORIGINS=https://your-app.vercel.app`

**Cost:** Free tier available, $7/month for production (24/7)

## 🧱 Local development with Docker Compose

Start a local MySQL + backend stack for development and integration testing:

1. Build and start services:

```bash
docker compose up --build
```

2. Services:
- MySQL: accessible on `localhost:3306` (container name `db`).
- Backend: `http://localhost:8080`.

3. Stop and remove:

```bash
docker compose down -v
```

Notes:
- The compose file uses simple credentials for local dev (see `docker-compose.yml`).
- For production use a managed DB and secure credentials.

## 📚 Additional Documentation

- **[CHATBOT_SETUP_GUIDE.md](./CHATBOT_SETUP_GUIDE.md)** - Complete AI chatbot setup and usage guide
- **[LEAD_QUALIFICATION_GUIDE.md](./LEAD_QUALIFICATION_GUIDE.md)** - Lead qualification chatbot features
- **[NLP_SEARCH_FEATURE.md](./NLP_SEARCH_FEATURE.md)** - Natural language search implementation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[MAP_FEATURE_GUIDE.md](./MAP_FEATURE_GUIDE.md)** - Interactive map feature documentation
- **[PRODUCTION_CHATBOT_SETUP.md](./PRODUCTION_CHATBOT_SETUP.md)** - Production chatbot deployment

## 🎯 Key Features Summary

| Feature | Description | Status |
|---------|-------------|--------|
| 🤖 AI Chatbot | Natural language Q&A with Claude | ✅ Ready |
| 🔍 NLP Search | Smart property search | ✅ Ready |
| 🗺️ Map View | Interactive property map | ✅ Ready |
| 📱 Responsive UI | Mobile-friendly design | ✅ Ready |
| 🎨 Modern Design | Beautiful gradient UI | ✅ Ready |
| 🚀 Fast Search | Optimized queries | ✅ Ready |
| 📊 Rich Filters | Advanced filtering | ✅ Ready |
| 🏢 Agent Info | Contact information | ✅ Ready |

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - feel free to use this project for your own purposes.

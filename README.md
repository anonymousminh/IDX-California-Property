# 🏠 IDX Real Estate Platform

Full-stack property search application for California real estate listings.

**Tech Stack:**
- Backend: Spring Boot (Java) + MySQL
- Frontend: React + TypeScript + Vite + Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Java 25+
- Maven 3.6+
- Node.js 18+ and npm
- MySQL database

### Setup

1. **Configure Database:**
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   # Edit application.properties with your database credentials
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

## 🔌 API Endpoints

- **GET `/properties`** - Search properties with filters
  - Query params: `city`, `state`, `zip`, `minPrice`, `maxPrice`, `beds`, `minBeds`, `baths`, `minBaths`, `page`, `size`, `sort`
  - Example: `http://localhost:8080/properties?city=Los Angeles&minPrice=300000&maxPrice=500000`

- **GET `/properties/{id}`** - Get property by ID

## ⚙️ Configuration

- **Database:** Edit `src/main/resources/application.properties` (not committed to Git)
- **API URL:** Configured in `idx-frontend/src/services/api.ts` (default: `http://localhost:8080`)


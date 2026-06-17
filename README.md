# FSA Food Alerts Test Harness

A test harness for the Food Standards Agency (FSA) Food Alerts API, featuring a dark mode UI, comprehensive filters, and an API call log for debugging.

Project connected to [https://github.com/delphium226/FSAAPITest](https://github.com/delphium226/FSAAPITest).

## Features

- **Dark Mode UI**: Modern dark theme with clean card-based design
- **Split View Layout**: Alerts displayed on left, API call log on right
- **Comprehensive Filters**: Country, Alert Type, Hazard Category, Time Period, and dynamic Allergen filter
- **Time Period Filter**: Filter alerts from last 7 days, 30 days, 90 days, 6 months, or 1 year
- **API Call Log**: Real-time table showing all API calls with parameters and responses
- **Scotland-Focused**: Defaults to showing Scottish food alerts
- **Detailed Server Logging**: Timestamped logs with request/response tracking and FSA API timing
- **Pagination**: Load more functionality for browsing large result sets
- **CORS Proxy**: Express server proxies requests to avoid browser CORS issues

## Project Structure

```
FSAAPITest/
├── server/                 # Express.js proxy server
│   ├── package.json
│   └── server.js          # Proxy with detailed logging
└── client/                 # Vite + React frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css       # Dark mode styles
        ├── App.jsx         # Main app with split view layout
        └── components/
            ├── SearchForm.jsx      # Filter controls
            ├── ResultsDisplay.jsx  # Alert cards
            └── ApiCallLog.jsx      # API call history table
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Running the Application

You need to run both the server and client:

**Terminal 1 - Start the proxy server:**
```bash
cd server
npm start
```
Server runs on http://localhost:3001

**Terminal 2 - Start the React dev server:**
```bash
cd client
npm run dev
```
Client runs on http://localhost:5173

## API Endpoints (Proxy)

| Endpoint | Proxies To | Description |
|----------|------------|-------------|
| `/api/alerts` | `data.food.gov.uk/food-alerts/id` | Food alerts with filters |
| `/api/ref/:type` | `data.food.gov.uk/food-alerts/def/:type` | Reference data (allergens, hazards) |
| `/api/health` | - | Health check |

## Filter Options

- **Country**: Scotland (default), England, Wales, Northern Ireland, or All
- **Alert Type**: Allergy Alert, Product Recall (PRIN), Food Alert for Action (FAFA)
- **Hazard Category**: Microbiological, Chemical, Foreign Body, Allergens, Labelling
- **Time Period**: All Time, Last 7/30/90 Days, Last 6 Months, Last Year
- **Allergen**: Dynamic dropdown (appears when Allergy Alert is selected)

## Server Logging

The proxy server provides detailed logging with timestamps:

```
[2026-02-04T13:30:00.000Z] [REQUEST] GET /api/alerts?country=...
[2026-02-04T13:30:00.001Z] [FSA API] Outgoing request: https://data.food.gov.uk/...
[2026-02-04T13:30:00.500Z] [FSA API] Response: Status 200 | Duration: 499ms
[2026-02-04T13:30:00.501Z] [INFO] Alerts fetched successfully
[2026-02-04T13:30:00.502Z] [RESPONSE] Status: 200 | Duration: 502ms
```

Log levels: `[INFO]`, `[ERROR]`, `[REQUEST]`, `[RESPONSE]`, `[FSA API]`

## Technologies

- **Frontend**: React 18, Vite
- **Backend**: Express.js, node-fetch
- **Styling**: Custom CSS (no frameworks)
- **API**: Food Standards Agency Open Data API

## Deploying to Vercel (Free Hobby Tier)

This application is optimized to be deployed to Vercel for free using a combination of static hosting (for the frontend React app) and Serverless Functions (for the backend Express API proxy).

### Steps to Deploy:

1. **Push your code to GitHub / GitLab / Bitbucket.**
2. **Import project into Vercel:**
   - Go to your Vercel Dashboard and click **Add New** > **Project**.
   - Select the repository for this project.
3. **Configure the Project Settings:**
   - **Framework Preset**: Choose **Vite** or **Other**.
   - **Root Directory**: Keep as `./` (the repository root).
   - **Build Command**: Set to `npm run build` (this runs the root build script which installs client dependencies and runs `vite build`).
   - **Output Directory**: Override this setting to `client/dist`.
4. **Click Deploy.**

Once deployment is complete, Vercel will serve your React SPA and automatically route all `/api/*` endpoints to the serverless function under `/api/index.js` on the same domain.

## API Documentation

For detailed technical documentation about the FSA Food Alerts API, including endpoints, query parameters, response structures, and data codes, see [interfaceSpec.md](./interfaceSpec.md).

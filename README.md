# StockSense AI — Institutional Market Intelligence Workspace

StockSense AI is a real-time stock analysis application and intelligence command center. Built with React (TypeScript) on the frontend and an Express Node.js backend, it aggregates financial metrics, live news, and SEC regulatory filings to generate institutional-grade equity research reports and sentiment assessments.

## Key Features

- 🖥️ **Market Brain Dashboard**: Tracks live news headlines, filters price-sentiment anomalies, and indexes trending global symbols using Yahoo Finance.
- 📄 **Institutional Research Reports**: Generates formal research summaries including Executive Summaries, Margins, Free Cash Flow, Management Outlook, and Quarterly Financial History directly from live SEC filings (10-K, 10-Q, 8-K).
- 📈 **Dynamic Portfolio & Allocation**: Manage custom portfolios with weighting percentages and view live daily P&L session changes synchronized to local storage.
- 📋 **Interactive Watchlist**: Tracks custom tickers with detailed circular metrics, buy/sell indicators, and AI conviction ratings.
- ⚡ **Upcoming Market Events Calendar**: Filters and displays real-time earnings calendar events and schedules.

## Tech Stack

- **Frontend**: React (Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide icons)
- **Backend**: Node.js (Express, Cors, Yahoo Finance API wrapper)
- **AI Synthesis**: Unified AI pipeline with fallback:
  - **Groq (Primary)**: Llama 3.3 70B for high-speed, free-tier analysis
  - **Gemini (Fallback)**: Google Gemini 2.0/2.5 for robust secondary validation

---

## Setup & Running Locally

### 1. Clone & Prerequisites
Ensure you have Node.js installed on your machine.

### 2. Configure Environment Variables
Create a `.env` file inside the `server/` directory:
```env
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Backend Server
```bash
cd server
npm install
node index.js
```
The server will run on `http://localhost:3001`.

### 4. Run the Frontend Client
Open a separate terminal window:
```bash
# In the project root directory
npm install
npm run dev
```
The client will start up on `http://localhost:5173`.

---



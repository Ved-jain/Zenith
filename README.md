# Zenith

Zenith is a full-stack investment analytics platform with a warm-light aesthetic, designed for serious investors. It brings portfolio health, watchlists, stock details, order history, and trading analytics into one beautifully designed, unified workspace.

## Features

- **Atomic Order Execution**: Employs MongoDB transactions and optimistic locking to prevent race conditions during high-concurrency order placement.
- **Real-Time Portfolio Tracking**: Track your holdings, positions, and overall PNL with visually stunning, interactive charts.
- **Intelligent Watchlists**: Easily monitor targeted stocks and evaluate their performance over time.
- **Dynamic Analytics**: Insightful dashboards utilizing caching (Redis) for high-performance data retrieval on asset allocation and sector exposure.

## Tech Stack

- **Frontend**: React, React Router, Recharts, Material UI
- **Backend**: Node.js, Express, Mongoose, Passport (Authentication)
- **Database**: MongoDB (Transactions enabled)
- **Caching**: Redis
- **Design System**: Vanilla CSS with customized styling tokens

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Ved-jain/Zenith.git
cd Zenith
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Configure your `backend/.env` file based on `backend/.env.example`.
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
The application will launch on `http://localhost:3000`.

## Seed Data
To populate the database with realistic stock data:
```bash
cd backend
node scripts/seedStocks.js
```

## Disclaimer
Zenith is an educational and prototype project. Seeded data and analytics algorithms are mocked for demonstration purposes and do not reflect real-time market data.

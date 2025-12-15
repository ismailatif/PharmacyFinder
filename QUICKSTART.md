# Quick Start Guide

## Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the server:**
```bash
npm run dev
```

Server will run on: **http://localhost:5000** 🚀

## Test the API

Open your browser or use curl:

```bash
# Get API info
curl http://localhost:5000/api

# Get all pharmacies
curl http://localhost:5000/api/pharmacies?limit=10

# Get pharmacies in Casablanca
curl http://localhost:5000/api/pharmacies?city=Casablanca

# Find nearby pharmacies
curl "http://localhost:5000/api/pharmacies/nearby?lat=33.5731&lng=-7.5898&radius=5"

# Get all cities
curl http://localhost:5000/api/cities
```

## Frontend Integration (Optional)

To connect the frontend to the backend:

1. **Copy the environment file:**
```bash
cp .env.example .env.local
```

2. **The `.env.local` should contain:**
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Update your components to use the API service:**
```javascript
import { getPharmacies } from './services/api';

// In your component:
const response = await getPharmacies({ city: 'Casablanca' });
setPharmacies(response.data);
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/pharmacies` | Get all pharmacies (with filters) |
| `GET /api/pharmacies/:id` | Get single pharmacy |
| `GET /api/pharmacies/nearby` | Find nearby pharmacies |
| `GET /api/cities` | Get all cities |

### Query Parameters for `/api/pharmacies`:
- `city` - Filter by city
- `isOpen` - Filter by open status (true/false)
- `isOnDuty` - Filter on-duty pharmacies (true/false)
- `rating` - Minimum rating (number)
- `search` - Search by name or address
- `limit` - Results per page (default: 20)
- `offset` - Page offset (default: 0)

## Project Structure

```
project/
├── backend/               # Backend API
│   ├── server.js         # Main server
│   ├── controllers/      # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Error handling, logging
│   ├── utils/            # Helper functions
│   └── data/             # Pharmacy data (JSON)
│
├── src/                  # Frontend (React)
│   ├── services/         # API service layer
│   │   └── api.js        # Backend API calls
│   ├── components/       # React components
│   └── data/             # Local data (backup)
│
└── .env.local            # Frontend API configuration
```

## Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

That's it! 🎉

For detailed documentation, see `backend/README.md`

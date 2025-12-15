# Pharmacy Finder Backend

RESTful API backend for the Pharmacy Finder application built with Node.js and Express.

## Features

- ✅ Get all pharmacies with filtering and pagination
- ✅ Search pharmacies by name, city, status
- ✅ Find nearby pharmacies based on coordinates
- ✅ Get pharmacy details by ID
- ✅ List all cities with pharmacy counts
- ✅ CORS enabled for frontend integration
- ✅ Error handling middleware
- ✅ Request logging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```;

The server will start on `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Get All Pharmacies
```
GET /api/pharmacies
```

**Query Parameters:**
- `city` (string) - Filter by city name
- `isOpen` (boolean) - Filter by open status
- `isOnDuty` (boolean) - Filter on-duty pharmacies
- `rating` (number) - Minimum rating
- `search` (string) - Search by name or address
- `limit` (number) - Results per page (default: 20)
- `offset` (number) - Starting index (default: 0)

**Example:**
```bash
# Get all pharmacies in Casablanca
GET /api/pharmacies?city=Casablanca

# Get open pharmacies with rating >= 4.5
GET /api/pharmacies?isOpen=true&rating=4.5

# Search pharmacies
GET /api/pharmacies?search=pharmacy&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "total": 2022,
    "limit": 20,
    "offset": 0,
    "count": 20
  }
}
```

#### 2. Get Pharmacy by ID
```
GET /api/pharmacies/:id
```

**Example:**
```bash
GET /api/pharmacies/pharmacy-530761730
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pharmacy-530761730",
    "name": "Pharmacy 1",
    "nameAr": "صيدلية 1",
    ...
  }
}
```

#### 3. Get Nearby Pharmacies
```
GET /api/pharmacies/nearby
```

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lng` (number, required) - Longitude
- `radius` (number) - Search radius in km (default: 10)
- `limit` (number) - Maximum results (default: 50)

**Example:**
```bash
# Find pharmacies within 5km of coordinates
GET /api/pharmacies/nearby?lat=33.5731&lng=-7.5898&radius=5

# Find nearest 10 pharmacies
GET /api/pharmacies/nearby?lat=33.5731&lng=-7.5898&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pharmacy-123",
      "name": "Pharmacy ABC",
      "distance": 1.23,
      ...
    }
  ],
  "metadata": {
    "searchCenter": { "lat": 33.5731, "lng": -7.5898 },
    "radius": 5,
    "count": 15
  }
}
```

#### 4. Get All Cities
```
GET /api/cities
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Casablanca",
      "nameAr": "الدار البيضاء",
      "count": 850
    },
    ...
  ]
}
```

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── controllers/
│   └── pharmacyController.js  # Business logic
├── routes/
│   ├── pharmacies.js      # Pharmacy routes
│   └── index.js           # Route aggregator
├── middleware/
│   ├── errorHandler.js    # Error handling
│   └── logger.js          # Request logging
├── utils/
│   └── helpers.js         # Utility functions
└── data/
    ├── pharmacies.json    # Pharmacy data
    └── convertData.js     # Data conversion script
```

## Error Handling

All errors are handled centrally and return JSON responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

## CORS Configuration

CORS is enabled for the frontend URL specified in `.env`:
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:5173'
```

## Data

The pharmacy data is stored in `data/pharmacies.json` containing 2,022 pharmacies across 6 cities in Morocco.

## Future Enhancements

- [ ] MongoDB integration
- [ ] Authentication & authorization
- [ ] Rate limiting
- [ ] Input validation
- [ ] Caching layer (Redis)
- [ ] WebSocket for real-time updates
- [ ] Admin API for CRUD operations
- [ ] API documentation (Swagger/OpenAPI)

## License

ISC

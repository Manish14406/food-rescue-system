# FoodRescue Backend API (MongoDB)

Base URL: `http://localhost:3000`

## MongoDB setup in project folder

1. Install dependencies: `npm install`
2. Start MongoDB with project-local data folder:
   `npm run start:mongodb`
3. In another terminal run backend:
   `npm start`

Default values used by backend:
- `MONGODB_URI=mongodb://127.0.0.1:27017`
- `MONGODB_DB=foodrescue`
- `dbpath` for Mongo server: `./data/mongodb`

## Health
- `GET /api/health`

## Stats
- `GET /api/stats`

## Donations
- `GET /api/donations?search=&donorType=&status=`
- `GET /api/donations/:id`
- `POST /api/donations`

Request body:
```json
{
  "organizationName": "Grand Palace Hotel",
  "donorType": "Hotel",
  "contactName": "John Doe",
  "contactPhone": "+91 98765 43210",
  "foodType": "Mixed Cuisine (Indian & Continental)",
  "foodDescription": "Biryani, dal, paneer and sweets",
  "quantityKg": 50,
  "servings": 100,
  "area": "Connaught Place, New Delhi",
  "address": "Block A, Connaught Place",
  "pickupTime": "2026-04-08T15:30:00.000Z",
  "bestBefore": "2026-04-08T20:30:00.000Z"
}
```

- `POST /api/donations/:id/claim`

Request body:
```json
{
  "recipientOrg": "Hope Foundation NGO",
  "recipientLocation": "Nehru Place, New Delhi",
  "driverName": "Rajesh Kumar",
  "driverPhone": "+91 99887 66554",
  "estimatedMinutes": 45
}
```

## Deliveries
- `GET /api/deliveries?stage=`
- `PATCH /api/deliveries/:id/stage`

Request body:
```json
{
  "stage": "in_transit",
  "estimatedMinutes": 30
}
```

Allowed stage values:
- `pending`
- `picked_up`
- `in_transit`
- `delivered`

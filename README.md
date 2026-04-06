# Volta Energy Metering Portal

A simple API + dashboard for demonstrating the Natterbox CAI REST API tool.

## Quick Start (Local)

```
npm install
npm start
```

Dashboard: http://localhost:3000
API: POST http://localhost:3000/api/readings

## Deploy to Render (Free Tier)

1. Push this folder to a GitHub repo
2. Go to render.com, create a new Web Service
3. Connect the repo
4. Build command: npm install
5. Start command: npm start
6. Deploy

Your URL will be something like https://volta-energy-portal.onrender.com

## Deploy to Railway

1. Install Railway CLI: npm i -g @railway/cli
2. railway login
3. railway init
4. railway up
5. railway domain (to get your URL)

## CAI REST Tool Config

Once deployed, configure the CAI REST tool in Natterbox admin:

- Tool Name: Submit_Meter_Reading
- HTTP Method: POST
- Content Type: application/json
- API Endpoint: https://YOUR-URL/api/readings
- Authentication: NONE

Tool Parameters:
- account_id (String, Required): "The customer account number. A 6 digit number."
- reading (String, Required): "The meter reading. A number up to 6 digits."

## API Reference

### POST /api/readings
Submit a meter reading.

Request:
```json
{
  "account_id": "123456",
  "reading": 45278,
  "submitted_by": "AI Agent"
}
```

Response:
```json
{
  "status": "success",
  "reference": "MR-7742",
  "reading": 45278,
  "estimated_bill": 87.00,
  "message": "Meter reading submitted successfully"
}
```

### GET /api/readings
Get all readings (dashboard uses this).

### GET /api/readings/:account_id
Get readings for a specific account.

### DELETE /api/readings
Reset all demo data.

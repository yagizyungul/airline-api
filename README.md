# SE4458 - Airline Ticketing System API

**Student:** Yağız Yungul
**Course:** SE4458 Software Architecture & Design of Modern Large Scale Systems
**Midterm Project:** Group 1 - Airline Company API

---

## 🚀 Live URLs

- **API Swagger:** https://airline-api-yagiz.azurewebsites.net/api-docs
- **API Gateway:** http://airline-gateway-yagiz.azurewebsites.net

---

## 📋 Project Description

A RESTful airline ticketing system API built with Node.js and Express. The system allows airline staff to manage flights and passengers to search and book tickets.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (Neon Cloud)
- **Authentication:** JWT
- **Documentation:** Swagger UI (OpenAPI 3.0)
- **Hosting:** Azure App Service (F1 Free)
- **Gateway:** Custom API Gateway (based on southriver/ApiGateway2)

---

## 📌 API Endpoints

| Endpoint | Method | Auth | Paging | Description |
|---|---|---|---|---|
| /api/v1/auth/register | POST | No | No | Register a new user |
| /api/v1/auth/login | POST | No | No | Login and get JWT token |
| /api/v1/flights | POST | ✅ Yes | No | Add a new flight |
| /api/v1/flights/upload | POST | ✅ Yes | No | Add flights via CSV file |
| /api/v1/flights | GET | No | ✅ Yes (10) | Query available flights (3/day limit) |
| /api/v1/tickets | POST | ✅ Yes | No | Buy a ticket |
| /api/v1/checkin | POST | No | No | Check in a passenger |
| /api/v1/flights/:id/passengers | GET | ✅ Yes | ✅ Yes (10) | Get passenger list |

---

## 🗄️ Data Model (ER Diagram)
```
users
├── id (PK)
├── username
├── password_hash
├── role
└── created_at

flights
├── id (PK)
├── flight_number
├── date_from
├── date_to
├── airport_from
├── airport_to
├── duration
├── capacity
└── remaining_seats

tickets
├── id (PK)
├── ticket_number
├── flight_id (FK → flights)
├── user_id (FK → users)
├── purchase_date
└── status

passengers
├── id (PK)
├── passenger_name
├── ticket_id (FK → tickets)
├── flight_id (FK → flights)
├── seat_number
├── checked_in
└── check_in_date

query_logs
├── id (PK)
├── user_id (FK → users)
├── ip_address
├── query_date
└── query_count
```

---

## 🏗️ Architecture
```
Client (Swagger UI)
        ↓
API Gateway (airline-gateway-yagiz.azurewebsites.net)
  - Rate Limiting (Query Flight: 3/day)
  - Request routing
        ↓
Airline API (airline-api-yagiz.azurewebsites.net)
  - Controllers → Services → DTOs
  - JWT Authentication
        ↓
Neon PostgreSQL (Cloud Database)
```

---

## 📝 Assumptions

- Seat numbering is sequential (1, 2, 3...) based on check-in order
- Rate limiting (3 queries/day) is implemented both in the API service and API Gateway
- Round-trip search returns both outbound and return flights separately
- CSV format for bulk upload: `flightNumber,dateFrom,dateTo,airportFrom,airportTo,duration,capacity`
- JWT tokens expire after 24 hours

---

## ⚡ Load Test Results

### Test Endpoints
1. `GET /api/v1/flights` - Query available flights
2. `POST /api/v1/auth/login` - User authentication

### Results

| Scenario | Virtual Users | Duration | Avg Response | p95 | Req/s | Error Rate |
|---|---|---|---|---|---|---|
| Normal Load | 20 | 30s | 672ms | 2.15s | 11.3 | 33.69% |
| Peak Load | 50 | 30s | 2.86s | 6.94s | 11.4 | 50% |
| Stress Load | 100 | 30s | 5.94s | 30.62s | 1.76 | 92.45% |

### Screenshots

**Normal Load (20 VUs):**
![Normal Load](load-test-results/yirmikisilik.png)

**Peak Load (50 VUs):**
![Peak Load](load-test-results/elli-kisilik.png)

**Stress Load (100 VUs):**
![Stress Load](load-test-results/yüzkisilik.png)

### Analysis

The API performed well under normal load (20 VUs) with an average response time of 672ms. Under peak load (50 VUs), response times increased significantly to 2.86s average, indicating the F1 Free tier's CPU limitations. Under stress load (100 VUs), the system showed severe degradation with 92% error rate and average response times exceeding 5 seconds. The main bottleneck is the Azure F1 Free tier which has shared CPU resources. To improve scalability, upgrading to a paid tier with dedicated CPU, implementing Redis caching for flight queries, and adding horizontal scaling would significantly improve performance under high load.

---

## 🎥 Demo Video

[Watch Demo Video](https://drive.google.com/your-video-link-here)

---

## 🔗 Resources

- [GitHub Repository](https://github.com/yagizyungul/airline-api)
- [Live Swagger UI](https://airline-api-yagiz.azurewebsites.net/api-docs)
- [API Gateway](http://airline-gateway-yagiz.azurewebsites.net)

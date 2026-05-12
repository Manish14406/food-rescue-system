# FoodRescue - NGO-Centric Food Redistribution Platform

FoodRescue is a full-stack platform designed to help NGOs manage the collection and distribution of surplus food. It bridges the gap between donors (restaurants, hotels, events) and needy centers (orphanages, shelters, community kitchens).

## 🚀 Key Features

- **NGO Admin Dashboard**: A centralized control room for NGO staff to manage logistics.
- **Donation Management**: Businesses can easily list surplus food with hygiene confirmations.
- **Support Requests**: Verified orphanages and shelters can register their daily or emergency food needs.
- **Intelligent Matching**: NGO admins can match specific donations to specific needy centers based on quantity and urgency.
- **Real-time Tracking**: Monitor the delivery status from "Assigned" to "Picked Up" to "Delivered".
- **Secure Authentication**: Hashed password protection for administrative access.

## 🛠️ Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: Vanilla CSS (Custom Design System)
- **Backend**: FastAPI (Python)
- **Database**: SQLite with Asynchronous support (aiosqlite)
- **Security**: PBKDF2-SHA256 password hashing

## 📋 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js (v18+)
- npm

### Quick Start
The project includes a universal startup script that installs dependencies for both frontend and backend and launches the servers concurrently.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/FoodRescue-Food-Waste-Management-and-Redistribution.git
   cd FoodRescue-Food-Waste-Management-and-Redistribution
   ```

2. **Run the platform**:
   ```bash
   python start.py
   ```

3. **Access the App**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## 🔐 Admin Credentials (Default)

- **Email**: `admin@foodrescue.org`
- **Password**: `admin123`

## 📂 Project Structure

```text
├── backend/
│   ├── main.py          # FastAPI API Endpoints
│   ├── database.py      # Database logic & hashing
│   ├── schema.sql       # Database structure
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/             # React components & pages
│   ├── public/          # Static assets
│   ├── index.html
│   └── package.json     # JS dependencies
└── start.py             # Universal startup script
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

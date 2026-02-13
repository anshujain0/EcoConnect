# 🌱 EcoConnect - AI Sustainability Platform

> Turn your waste into environmental impact using AI

![EcoConnect](https://img.shields.io/badge/EcoConnect-AI%20Powered-3A987D?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

## ✨ Features
- 🤖 **AI Image Analysis** - Gemini Vision API identifies waste materials
- ♻️ **Smart Recommendations** - Sell, Donate, Recycle, or Dispose
- 📍 **Nearby Facilities** - Find local recyclers, NGOs, scrap dealers
- 💰 **Value Estimation** - Get estimated resale value in ₹
- ⭐ **Feedback System** - Rate and review recommendations

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| AI | Google Gemini Vision API |
| Maps | OpenStreetMap (Overpass API) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Installation

**Backend:**
```bash
cd backend
npm install
# Create .env file with your keys
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## 📱 How It Works
1. **Upload** a photo of your waste item
2. **AI analyzes** the material and condition
3. **Answer** 4 quick questions
4. **Get** personalized recommendations
5. **Find** nearby facilities to recycle or donate

## 🌍 Impact
- Reduces landfill waste
- Connects users with recyclers
- Promotes circular economy
- Makes sustainability accessible

---
Made with 💚 for a greener planet
# ChessVerse

ChessVerse is a real-time multiplayer chess game built using **WebSockets** for seamless communication between players. The project is divided into two main parts:

- **backend1**: Handles game logic and communication using WebSockets.
- **frontend**: Built with **React.js**, **Tailwind CSS**, and **chess.js** for an interactive UI and game mechanics.

---

## Features

- Real-time chess gameplay with WebSocket communication
- Interactive UI using React.js and Tailwind CSS
- Chess game logic powered by chess.js
- Smooth player moves and updates

---

## Tech Stack

### **Frontend**
- React.js
- Tailwind CSS
- chess.js
- WebSockets (for real-time updates)

### **Backend**
- Node.js
- WebSockets
- chess.js

---

## Installation & Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/harshsrivastava05/chessverse.git
cd chessverse
```

### **2. Backend Setup**
```bash
cd backend
npm install
npm run dev  # Start WebSocket server
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
npm start  # Start React app
```

---

## Usage

1. Run the WebSocket server first (`node index.ts` in `backend1` directory).
2. Start the frontend (`npm start` in `frontend` directory).
3. Open the browser and start playing chess in real-time!


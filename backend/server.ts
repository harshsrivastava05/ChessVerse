import { WebSocketServer } from 'ws';
import { GameManager } from './wss/GameManager';

const port = 8080;

const gameManager = new GameManager();

const wss = new WebSocketServer({ port });

wss.on('connection', function connection(ws) {
  gameManager.addUser(ws);

  ws.on('disconnect', () => gameManager.removeUser(ws));
});

console.log(`WebSocket server started on port ${port}`);

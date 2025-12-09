import { WebSocket } from "ws";
import { INIT_GAME, MOVE, RESIGN } from "./Messages";
import { Game } from "./Game";

export class GameManager { 
  private games: Game[];
  private pendingUsers: WebSocket | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.pendingUsers = null;
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
    
    if (this.pendingUsers === socket) {
        this.pendingUsers = null;
    }

    const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
    
    if (game) {
       
        const opponent = game.player1 === socket ? game.player2 : game.player1;
        if (this.users.includes(opponent)) {
             const { OPPONENT_DISCONNECTED } = require("./Messages");
             opponent.send(JSON.stringify({
                 type: OPPONENT_DISCONNECTED,
                 payload: {
                     message: "Opponent disconnected"
                 }
             }));
        }
        
        this.games = this.games.filter(g => g !== game);
    }
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      try {
          const message = JSON.parse(data.toString());

          if (message.type === INIT_GAME) {
            if (this.pendingUsers) {
              const game = new Game(this.pendingUsers, socket);
              this.games.push(game);
              this.pendingUsers = null;
            } else {
              this.pendingUsers = socket;
            }
          }

          if (message.type === MOVE) {
            const game = this.games.find(
              (game) => game.player1 === socket || game.player2 === socket
            );
            if (game) {
              game.makeMove(socket, message.payload.move);
              if (game.board.isGameOver()) {
                  this.games = this.games.filter(g => g !== game);
              }
            }
          }

          if (message.type === RESIGN) {
            console.log("Resign request received");
            const game = this.games.find(
              (game) => game.player1 === socket || game.player2 === socket
            );
            if (game) {
              console.log("Game found, processing resignation");
              game.resign(socket);
              this.games = this.games.filter(g => g !== game);
            } else {
              console.log("Game not found for resigning user");
            }
          }
      } catch (e) {
          console.error("Error handling message:", e);
      }
    });
  }
}


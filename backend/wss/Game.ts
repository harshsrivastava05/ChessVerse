import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_ALERT, GAME_OVER, INIT_GAME, MOVE } from "./Messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  private startTime: Date;
  private movecount = 0;
  private player1Time = 600; // 10 minutes in seconds
  private player2Time = 600;
  private timer: NodeJS.Timeout | null = null;
  private lastMoveTime: Date;
  private player1Name: string;
  private player2Name: string;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.lastMoveTime = new Date();
    this.player1Name = this.generateRandomName();
    this.player2Name = this.generateRandomName();

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
          whitePlayerName: this.player1Name,
          blackPlayerName: this.player2Name
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
          whitePlayerName: this.player1Name,
          blackPlayerName: this.player2Name
        },
      })
    );
    
    // Start timer for White (player1)
    this.startTimer();
  }

  private generateRandomName(): string {
    const adjectives = ["Swift", "Grand", "Silent", "Bold", "Clever", "Brave", "Calm", "Eager", "Happy", "Jolly", "Kind", "Lively", "Proud", "Silly", "Witty"];
    const nouns = ["Pawn", "Knight", "Bishop", "Rook", "Queen", "King", "Tiger", "Eagle", "Wolf", "Bear", "Lion", "Hawk", "Fox", "Owl", "Shark"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 100);
    return `${randomAdjective} ${randomNoun} #${randomNumber}`;
  }

  
  startTimer() {
      if (this.timer) clearInterval(this.timer);
      
      this.timer = setInterval(() => {
          if (this.board.turn() === 'w') {
              this.player1Time--;
              if (this.player1Time <= 0) {
                  this.endGame("black", "timeout");
              }
          } else {
              this.player2Time--;
              if (this.player2Time <= 0) {
                  this.endGame("white", "timeout");
              }
          }
      }, 1000);
  }
  
  endGame(winner: string, reason: string) {
      if (this.timer) clearInterval(this.timer);
      
      const payload = {
          winner,
          reason
      };
      
      this.player1.send(JSON.stringify({ type: GAME_OVER, payload }));
      this.player2.send(JSON.stringify({ type: GAME_OVER, payload }));
  }

  resign(player: WebSocket) {
    const winner = this.player1 === player ? "black" : "white";
    const reason = "resignation";
    this.endGame(winner, reason);
  }

  makeMove(
    player: WebSocket,
    move: {
      from: string;
      to: string;
      promotion?: string;
    }
  ) {
    // Validate turn using chess.js board state
    // turn() returns 'w' or 'b'
    if (this.board.turn() === 'w' && player !== this.player1) {
        return;
    }
    if (this.board.turn() === 'b' && player !== this.player2) {
        return;
    }

    try {
      this.board.move(move);
    } catch (e) {
      console.log(e);
      player.send(JSON.stringify({
        type: GAME_ALERT,
        payload: {
             message: "Invalid move"
        }
      }));
      return;
    }

    // Check for game over
    if (this.board.isGameOver()) {
      // Determine result
      let winner = "";
      let reason = "";
      
      if (this.board.isCheckmate()) {
          winner = this.board.turn() === "w" ? "black" : "white";
          reason = "checkmate";
      } else {
          winner = "draw";
          if (this.board.isDraw()) reason = "draw";
          if (this.board.isStalemate()) reason = "stalemate";
          if (this.board.isThreefoldRepetition()) reason = "threefold_repetition";
          if (this.board.isInsufficientMaterial()) reason = "insufficient_material";
      }
      
      this.endGame(winner, reason);
      return;
    }

    // Broadcast move to both players
    const moveMsg = JSON.stringify({
        type: MOVE,
        payload: {
            move,
            player1Time: this.player1Time,
            player2Time: this.player2Time
        },
    });
    
    this.player1.send(moveMsg);
    this.player2.send(moveMsg);
    
    this.movecount++;
    
    // Timer keeps running, but state flips automatically because board.turn() flips.
    // However, to be precise and safeguard against drift, we could sync time here,
    // but a simple decrement interval is usually fine for a basic implementation.
    // Ideally we reset the interval to handle the discrete second tick perfectly 
    // or just let it flow. letting it flow is simpler.
  }
}

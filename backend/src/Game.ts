import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_ALERT, GAME_OVER, INIT_GAME, MOVE } from "./Messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  private startTime: Date;
  private movecount = 0;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
        },
      })
    );
  }

  makeMove(
    player: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    const isWhiteTurn = this.movecount % 2 === 0;
    const currentPlayer = isWhiteTurn ? this.player1 : this.player2;

    if (player !== currentPlayer) {
      console.log("Not your turn!");
      player.send(
        JSON.stringify({
          type: GAME_ALERT,
          payload: "Not your turn!",
        })
      );
      return;
    }
    

    try {
      this.board.move(move);
      this.movecount++; // Move count updates here

      // console.log("Move count after move:", this.movecount);
    } catch (e) {
      console.log(e);
      return;
    }

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      return;
    }

    const nextPlayer = isWhiteTurn ? this.player2 : this.player1;
    nextPlayer.send(
      JSON.stringify({
        type: MOVE,
        payload: move,
      })
    );
  }
}

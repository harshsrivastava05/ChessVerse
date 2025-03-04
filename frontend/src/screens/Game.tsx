import { useSockets } from "../hooks/useSockets";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const GAME_ALERT = "game_alert";

export const Game = () => {
  const socket = useSockets();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case INIT_GAME:
          // setChess(new Chess());
          setBoard(chess.board());
          console.log("Init Game", data);
          setStarted(true);
          break;
        case MOVE:
          const move = data.payload;
          chess.move(move);
          setBoard(chess.board());
          console.log(move);
          console.log("Move", data);
          break;
        case GAME_OVER:
          console.log("Game Over", data);
          break;
        case GAME_ALERT:
          console.log("Game Alert", data);
          return;

        default:
          break;
      }
    };
  }, [socket]);

  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 w-full flex justify-center">
            {socket && (
              <ChessBoard
                chess={chess}
                board={board}
                socket={socket}
                setBoard={setBoard}
              />
            )}
          </div>
          <div className="col-span-2 bg-slate-900 h-full w-full flex items-center justify-center">
           {!started && <Button
              onClick={() => {
                socket?.send(
                  JSON.stringify({
                    type: INIT_GAME,
                  })
                );
              }}
            >
              Play
            </Button>}
          </div>
        </div>
      </div>
    </div>
  );
};

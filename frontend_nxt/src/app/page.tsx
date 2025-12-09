"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { useSockets } from "@/hooks/useSocket";
import { ChessBoard } from "@/components/ChessBoard";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { GameOverModal } from "@/components/GameOverModal";
import { INIT_GAME, MOVE, GAME_OVER, GAME_ALERT, OPPONENT_DISCONNECTED, RESIGN } from "@/lib/constants";

export default function Game() {
  const socket = useSockets();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // Game State
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
  const [whitePlayerName, setWhitePlayerName] = useState<string>("White Player");
  const [blackPlayerName, setBlackPlayerName] = useState<string>("Black Player");
  const [result, setResult] = useState<{ winner: string, reason: string } | null>(null);

  // Timers (in seconds)
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  // Timer Tick
  useEffect(() => {
    if (!started || result) return;

    const timer = setInterval(() => {
      if (chess.turn() === 'w') {
        setWhiteTime(t => Math.max(0, t - 1));
      } else {
        setBlackTime(t => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [chess, started, result]);

  // Socket Handlers
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case INIT_GAME:
          setBoard(chess.board());
          console.log("Init Game", data);
          setStarted(true);
          setWaiting(false);
          setPlayerColor(data.payload.color);
          setWhitePlayerName(data.payload.whitePlayerName);
          setBlackPlayerName(data.payload.blackPlayerName);
          break;
        case MOVE:
          const move = data.payload.move;

          // Check if the move we received is the one we just made (optimistic update)
          // We look at the last move in history and see if it patches the incoming move.
          const history = chess.history({ verbose: true });
          const lastMove = history[history.length - 1];

          if (lastMove && lastMove.from === move.from && lastMove.to === move.to) {
            // console.log("Move already applied locally, skipping re-apply.");
          } else {
            try {
              chess.move(move);
              setBoard(chess.board());
              console.log("Move applied:", move);
            } catch (e) {
              console.error("Invalid move received from server:", move, e);
            }
          }

          // Sync times
          if (data.payload.player1Time) setWhiteTime(data.payload.player1Time);
          if (data.payload.player2Time) setBlackTime(data.payload.player2Time);
          break;
        case GAME_OVER:
          console.log("Game Over", data);
          setResult(data.payload);
          setStarted(false);
          setWaiting(false);
          break;
        case OPPONENT_DISCONNECTED:
          // If game started, show win. If waiting, just stop waiting.
          if (started) {
            setResult({ winner: playerColor === 'white' ? 'white' : 'black', reason: 'Opponent Disconnected' });
          }
          setStarted(false);
          setWaiting(false);
          break;
        case GAME_ALERT:
          const alertMsg = data.payload.message;
          if (alertMsg) alert(alertMsg); // Simple alert for now
          break;
        default:
          break;
      }
    };

  }, [socket, chess, playerColor, started]);

  // Reset state if socket disconnects - handling the "stuck in waiting" issue
  useEffect(() => {
    if (!socket) {
      setWaiting(false);
      setStarted(false);
      setPlayerColor(null);
    }
  }, [socket]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!socket) return <div className="flex justify-center items-center h-screen bg-slate-950"><Loader /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full lg:h-[calc(100vh-3rem)] grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Panel: Game Area */}
        <div className="col-span-1 lg:col-span-3 flex flex-col h-full bg-slate-900/50 rounded-3xl border border-slate-800/60 shadow-2xl backdrop-blur-sm overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none"></div>

          {/* Top Bar: Opponent */}
          <div className="p-4 bg-slate-900/80 border-b border-slate-800/50 flex justify-between items-center z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-inner">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-200 leading-tight">
                  {playerColor === 'white' ? blackPlayerName : whitePlayerName}
                </h3>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Opponent</p>
              </div>
            </div>
            <div className={`text-3xl font-mono font-bold ${chess.turn() === (playerColor === 'white' ? 'b' : 'w') ? "text-white" : "text-slate-600"}`}>
              {playerColor === 'white' ? formatTime(blackTime) : formatTime(whiteTime)}
            </div>
          </div>

          {/* Middle: Chess Board - Dynamic Scaling */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative z-0">
            <div className="relative h-full w-full max-w-full flex items-center justify-center">
              {/* We constrain the board to be SQUARE and fit within the container */}
              <div className="aspect-square h-full max-h-full shadow-2xl rounded-lg overflow-hidden">
                <ChessBoard
                  chess={chess}
                  board={board}
                  socket={socket}
                  setBoard={setBoard}
                  playerColor={playerColor}
                  turn={chess.turn()}
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar: Player (You) */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800/50 flex justify-between items-center z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center shadow-inner ring-1 ring-emerald-500/30">
                <span className="text-xl">😎</span>
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">
                  {playerColor === 'white' ? whitePlayerName : blackPlayerName} <span className="text-slate-500 font-normal text-xs">(You)</span>
                </h3>
                <p className={`text-[10px] uppercase tracking-wider font-semibold ${playerColor ? "text-emerald-400" : "text-amber-500"}`}>
                  {playerColor ? `Playing as ${playerColor}` : "Spectator"}
                </p>
              </div>
            </div>
            <div className={`text-3xl font-mono font-bold ${chess.turn() === (playerColor === 'white' ? 'w' : 'b') ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "text-slate-600"}`}>
              {playerColor === 'white' ? formatTime(whiteTime) : formatTime(blackTime)}
            </div>
          </div>
        </div>

        {/* Right Panel: Controls */}
        <div className="col-span-1 lg:h-full flex flex-col bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="mb-8 relative z-10">
            <h1 className="text-3xl font-black italic tracking-tighter text-white mb-1">CHESS<span className="text-emerald-500">VERSE</span></h1>
            <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
          </div>

          <div className="flex-1 flex flex-col justify-center relative z-10 space-y-4">
            {!started && !result && (
              <Button
                className="w-full py-6 text-lg font-bold shadow-lg shadow-emerald-500/10 border border-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 transition-all uppercase tracking-widest"
                onClick={() => {
                  socket.send(JSON.stringify({ type: INIT_GAME }));
                  setWaiting(true);
                }}
              >
                {!waiting ? "Find Match" : "Searching..."}
              </Button>
            )}

            {started && (
              <>
                <div className={`p-4 border rounded-xl text-center transition-all duration-300 ${chess.turn() === (playerColor === 'white' ? 'w' : 'b')
                  ? "bg-emerald-900/20 border-emerald-500/30"
                  : "bg-slate-800/30 border-slate-700"
                  }`}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Status</div>
                  <div className={`text-xl font-black ${chess.turn() === (playerColor === 'white' ? 'w' : 'b') ? "text-emerald-400" : "text-white"}`}>
                    {chess.turn() === (playerColor === 'white' ? 'w' : 'b') ? "YOUR TURN" : "OPPONENT'S TURN"}
                  </div>
                </div>

                <Button
                  variant="danger"
                  className="w-full py-4 text-sm font-bold uppercase tracking-wider border border-red-900/50 hover:bg-red-900/50 transition-all"
                  onClick={() => {
                    socket.send(JSON.stringify({ type: RESIGN }));
                  }}
                >
                  Resign Game
                </Button>
              </>
            )}
            {waiting && <div className="text-center text-slate-500 text-sm animate-pulse">Waiting for opponent...</div>}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-600 font-mono">SERVER STATUS: <span className="text-emerald-500">ONLINE</span></span>
          </div>
        </div>

        {/* Modal */}
        {result && (
          <GameOverModal
            winner={result.winner}
            reason={result.reason}
            onClose={() => {
              setResult(null);
              setStarted(false);
              setChess(new Chess());
              setBoard(chess.board());
              setWhiteTime(600);
              setBlackTime(600);
            }}
          />
        )}
      </div>
    </div>
  );
}

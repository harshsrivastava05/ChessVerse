"use client";

import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../lib/constants";

export const ChessBoard = ({
    board,
    socket,
    setBoard,
    chess,
    playerColor,
    turn,
}: {
    chess: any;
    setBoard: any;
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
    playerColor: 'white' | 'black' | null;
    turn: 'w' | 'b';
}) => {
    const [from, setFrom] = useState<Square | null>(null);

    return (
        <div className="w-full h-full border border-slate-800/60 rounded-lg overflow-hidden shadow-2xl relative bg-slate-900/50 backdrop-blur-sm ring-1 ring-white/5">
            {/* Board Grid */}
            {board.map((row, i) => {
                return (
                    <div key={i} className="flex h-[12.5%]">
                        {row.map((square, j) => {
                            const squareRepresentation = (String.fromCharCode(97 + (j % 8)) +
                                "" +
                                (8 - i)) as Square;

                            const isSelected = from === squareRepresentation;
                            const isDark = (i + j) % 2 === 1;

                            // Futuristic Theme
                            const baseColor = isDark ? "bg-slate-800/80" : "bg-slate-700/30";
                            const highlightColor = isSelected ? "bg-emerald-500/40 ring-inset ring-2 ring-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.5)]" : "";

                            return (
                                <div
                                    key={j}
                                    onClick={() => {
                                        // Validation: Can only interact if it's my turn
                                        const isMyTurn = (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');

                                        if (!isMyTurn) return;

                                        if (!from) {
                                            // Can only select my own pieces
                                            if (square && square.color === (playerColor === 'white' ? 'w' : 'b')) {
                                                setFrom(squareRepresentation);
                                            }
                                        } else {
                                            // Deselect if clicking same square
                                            if (from === squareRepresentation) {
                                                setFrom(null);
                                                return;
                                            }

                                            socket.send(
                                                JSON.stringify({
                                                    type: MOVE,
                                                    payload: {
                                                        move: {
                                                            from,
                                                            to: squareRepresentation,
                                                        },
                                                    },
                                                })
                                            );

                                            setFrom(null);
                                            try {
                                                chess.move({
                                                    from,
                                                    to: squareRepresentation,
                                                });
                                                setBoard(chess.board());
                                            } catch (e) {
                                                console.log("Invalid move local", e);
                                            }
                                        }
                                    }}
                                    className={`w-[12.5%] h-full flex items-center justify-center relative cursor-is-pointer hover:brightness-110 transition-all ${baseColor} ${highlightColor}`}
                                >
                                    {/* Rank/File Notation */}
                                    {j === 0 && <span className={`absolute top-0 left-0.5 text-[10px] sm:text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-500"}`}>{8 - i}</span>}
                                    {i === 7 && <span className={`absolute bottom-0 right-0.5 text-[10px] sm:text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-500"}`}>{String.fromCharCode(97 + j)}</span>}

                                    <div className="h-full w-full flex items-center justify-center p-0.5 sm:p-1 relative z-10">
                                        {square ? (
                                            <img
                                                className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-100"
                                                src={`/${square?.color === "b"
                                                    ? square?.type
                                                    : `${square?.type?.toUpperCase()} copy`
                                                    }.png`}
                                                alt={`${square?.color} ${square?.type}`}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

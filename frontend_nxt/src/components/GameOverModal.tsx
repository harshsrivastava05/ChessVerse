import { useEffect, useState } from "react";

interface GameOverModalProps {
    winner: string;
    reason: string;
    onClose: () => void;
}

export const GameOverModal = ({ winner, reason, onClose }: GameOverModalProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    const getReasonText = (r: string) => {
        switch (r) {
            case "timeout": return "Time's up!";
            case "checkmate": return "Checkmate!";
            case "stalemate": return "Stalemate";
            case "threefold_repetition": return "Threefold Repetition";
            case "insufficient_material": return "Insufficient Material";
            case "draw": return "Draw";
            default: return r;
        }
    };

    const isDraw = winner === "draw" || reason === "stalemate" || reason === "threefold_repetition" || reason === "insufficient_material";

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
            <div className={`bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl transform transition-all duration-300 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        {isDraw ? "Game Drawn" : "Game Over"}
                    </h2>
                    <p className="text-gray-300 mb-6 text-lg">
                        {isDraw ? (
                            <span>It's a draw by <span className="text-yellow-400 font-semibold">{getReasonText(reason)}</span></span>
                        ) : (
                            <span>
                                <span className="capitalize font-bold text-white">{winner}</span> won by <span className="text-yellow-400 font-semibold">{getReasonText(reason)}</span>
                            </span>
                        )}
                    </p>

                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-blue-500/20"
                    >
                        Play Again
                    </button>

                </div>
            </div>
        </div>
    );
};

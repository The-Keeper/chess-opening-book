import { Chessground } from 'svelte-chessground';
import { Chess, SQUARES } from 'chess.js';
import type { Square, Move } from 'chess.js';

// Find all legal moves
export function toDests(chess: Chess) {
    const dests = new Map<Square, Square[]>();
    SQUARES.forEach((s) => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length)
            dests.set(
                s,
                ms.map((m) => m.to)
            );
    });
    return dests;
}
// Play a move and toggle whose turn it is
export function playOtherSide(chessground: Chessground, chess: Chess) {
    return (orig: string, dest: string) => {
        let move = chess.move({ from: orig, to: dest });
        console.log(move);
        const color = chess.turn() == 'w' ? 'white' : 'black';
        chessground.set({
            turnColor: color,
            fen: move.after,
            movable: {
                color: color,
                dests: toDests(chess),
            }
        });
    };
}

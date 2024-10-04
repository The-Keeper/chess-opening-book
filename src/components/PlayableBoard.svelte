<script lang="ts">
	import { Chessground } from 'svelte-chessground';
    import { Chess, SQUARES } from 'chess.js';
    import type { Square } from 'chess.js'
	import { onMount } from 'svelte';
	import {toDests, playOtherSide} from '$lib/util';

	export let fen: string | undefined = undefined;
	let chess = new Chess(fen);
	let chessground: Chessground;
	$: fen = chess.fen();

	let showPromotionDialog = false;
	let promotionDialog: HTMLDialogElement;
	let promotionSquare = '';
	$: if (promotionDialog && showPromotionDialog) promotionDialog.showModal();


	const promotePawn = (figure: string) => () => {
		showPromotionDialog = false;
		let move = chess.moves({verbose: true}).filter(move => move.promotion == figure).at(0);

		if (move) {
			makeMove(move.from, promotionSquare, move.promotion);
			promotionSquare = ''
		}

	}

	function makeMove(from: string, to: string, promotion?: string) { 
		// after move accepted
		const move = chess.move({from, to, promotion});
		const fen = move.after;
		const color = chess.turn() == 'w' ? 'white' : 'black';
		const dests = toDests(chess);
		chessground.set({
			turnColor: color,
			fen,
			movable: {
				color,
				dests
			}
		});	
	}

	function playerMadeMove(chessground: Chessground, chess: Chess) {
        return (orig: string, dest: string, metadata: any) => {
            // console.log(orig, dest, metadata)
            // console.log(chess.get(orig as Square), chess.moves({ square: orig as Square, verbose: true }));

			const possibleMoves = chess.moves({ square: orig as Square, verbose: true }).filter(move => move.to == dest);
			if (possibleMoves.length > 0 && possibleMoves[0].promotion) {
				promotionSquare = dest;
				showPromotionDialog = true;
				chessground.stop();
				return;
			}

			// after move accepted
			const move = chess.move({from: orig, to: dest});
			const fen = move.after;
			const color = chess.turn() == 'w' ? 'white' : 'black';
			const dests = toDests(chess);
            chessground.set({
				turnColor: color,
				fen,
				movable: {
					color,
					dests
				}
			});
		}
	}

	let config = {
		movable: {
			color: 'white' as "white" | "black",
			free: false,
			dests: toDests(chess)
		}
	};

	onMount(async () => {
		chessground.set({
			fen: chess.fen(),
			movable: { events: { after: playerMadeMove(chessground, chess) } }
		});
	});

</script>

<div class="container" id="board">
	<Chessground bind:this={chessground} {config} {fen} />
	{#if showPromotionDialog}
		<div class="modal">
			{#each ['q', 'n', 'r', 'b'] as figure}
				<button on:click={ promotePawn(figure) }>{ figure }</button>
			{/each}
		</div>
	{/if}
</div>


<style>
	.container {
		position: relative;
		width: 400px;
		height: 400px;
	}

	.modal {
		display: flex; /* or inline-flex */
		flex-direction: column;
		position: absolute; /* Stay in place */
		z-index: 100; /* Sit on top */
		/* left: 0; */
		top: 0;
	}
</style>

<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Chess } from 'chess.js';
	import { onMount } from 'svelte';
	import {toDests, playOtherSide} from '$lib/util';
	import { parse } from '@mliebelt/pgn-parser';
	import type { PgnOptions, ParseTree } from '@mliebelt/pgn-parser';


	const chess = new Chess();

	let repertoire = new Chess();

	$: moveNumber = chess.moveNumber();
	let parse_options = undefined as unknown as PgnOptions;  
	$: parsed = parse(pgnToLoad, parse_options) as ParseTree[];

	let chessground: Chessground;

	let config = {
		movable: {
			color: 'white' as "white" | "black",
			free: false,
			dests: toDests(chess)
		}
	};

	onMount(async () => {
		chessground.set({
			movable: { events: { after: playOtherSide(chessground, chess) } }
		});
	});


	type GameTree = {
		parent: GameTree,
		fen: string,
		children: GameTree[]
	};


	function makeMoveInto( logic: Chess, gt: GameTree, pt: any, sequence = false ) {
		const notation = pt?.notation?.notation;
		console.log('MOVE', notation);
		// logic.move(notation);
		// console.log( logic.turn(), logic.fen() );
		if (pt.variations) {
			pt.variations.forEach((variation: any) => {
				variation.forEach((move: any) => {
					makeMoveInto(logic, gt, move, false);
				});
		});
		}
		// if (!sequence) {
		// 	logic.undo();
		// }
		console.log(notation);
	}

	function buildTree() {
		let result = {} as GameTree;
		let logic = new Chess()
		result.fen = logic.fen();
		if (parsed.length) {
			let game = parsed[0] as ParseTree;
			console.log(game);

			for (const move of game.moves) {
				const notation = move.notation.notation;
				
				makeMoveInto(logic, result, move, true);
				console.log('next prime move');
			}
		}
	}

	let pgnToLoad = `1. e4 (1. d4 Nf6) 1... e5 2. Nf3 (2. Bc4 f6 3. Nf3 (3. Qh5+ g6 4. Qh3)) (2. d4 exd4) 2... Nc6 3. Bb5`
</script>

<div class="container" id="board">
	<Chessground bind:this={chessground} {config} />
</div>
<button on:click={buildTree}>log</button>
<textarea bind:value={pgnToLoad}></textarea>

{#each parsed as game, game_idx}
<div class="container-fluid">
	{#each game.moves as move, move_idx}
		<button on:click={() => console.log(move)} >
			{ move.notation.notation }
		</button>
	{/each}
</div>
{/each}


<style>
	.container {
		width: 400px;
		height: 400px;
	}
</style>

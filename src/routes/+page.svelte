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


	function makeMoveInto( logic: Chess, gt: GameTree, pt: any ) {
		const notation = pt?.notation?.notation;
		// logic.move(notation);
		// console.log( logic.turn(), logic.fen() );
		// logic.undo()

		console.log(notation);

		if (pt.variations) {
			pt.variations.forEach((variation: any) => {
			makeMoveInto(logic, gt, variation);
		});
		}
	}

	function buildTree() {
		let result = {} as GameTree;
		let logic = new Chess()
		result.fen = logic.fen();
		if (parsed.length) {
			let game = parsed[0] as ParseTree;
			console.log(game);
			console.log(result.fen)
			game.moves.forEach(move => {
				const notation = move.notation.notation;
				makeMoveInto(logic, result, move);
			});
		}
	}

	let pgnToLoad = `1. e4 e5 (1... Bg6 2. Bf4 ) (1... d5 2. exd5) *`
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

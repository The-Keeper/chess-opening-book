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

	type GameStateNode = {
		id: number,
		parentId: number | null,

		move: string | null; // move that reached that position from parent
		fen: string;
	}

	type GameVariationsData = Array<GameStateNode>

	function addVariationToRepertoire( repertoire: GameVariationsData, logic: Chess, variation: any[], fromNode: GameStateNode ) {
		console.log('BEFORE', logic.fen(), fromNode)
		for (let i = 0; i < variation.length; i++) {
			const move = variation[i];
			const notation = move?.notation?.notation;

			move.variations.forEach((move_var: any[]) => {
				addVariationToRepertoire(repertoire, logic, move_var, fromNode)
			});

			logic.move(notation)

			let newNode: GameStateNode = { fen: logic.fen(), id: repertoire.length, parentId: fromNode.id, move: notation } 

			repertoire.push(newNode);

		}
		for (let i = 0; i < variation.length; i++) {
			logic.undo();
		}



		console.log('AFTER', logic.fen())

	}

	
	function buildTree() {
	 	let repertoire: GameVariationsData = [];
	 	let logic = new Chess();
        let startingPosition: GameStateNode = { fen: logic.fen(), parentId: null, id: 0, move: null }

		repertoire.push(startingPosition);

		if (parsed.length) {
			let game = parsed[0] as ParseTree;
			console.log(game);

			addVariationToRepertoire(repertoire, logic, game.moves, startingPosition);
			console.log(repertoire);
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

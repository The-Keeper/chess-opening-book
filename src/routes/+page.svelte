<script lang="ts">
	import { Chess } from 'chess.js';
	import { parse } from '@mliebelt/pgn-parser';
	import type { PgnOptions, ParseTree } from '@mliebelt/pgn-parser';
	import PlayableBoard from '../components/PlayableBoard.svelte';
	import { DirectedGraph } from 'graphology';
	import Graph from '../components/Graph.svelte';

	let repertoire: DirectedGraph = $state(new DirectedGraph())

	let pgnToLoad = $state(`1. e4 (1. d4 Nf6) 1... e5 2. Nf3 (2. Bc4 f6 3. Nf3 (3. Qh5+ g6 4. Qh3)) (2. d4 exd4) 2... Nc6 3. Bb5`);



	let parse_options = undefined as unknown as PgnOptions;  
	let parsed = $derived(parse(pgnToLoad, parse_options) as ParseTree[]);
	type GameStateNode = {
		id: number,

		fen: string;
	}

	type GameMoveEdge = {
		notation: string,
		from_key: string,
		to_key: string
	}

	type ChessRepertoire = {
		id: string,
		side: 'w' | 'b',
		states: Map<string, GameStateNode>;
		moves: GameMoveEdge[]
	}

	function addVariationToRepertoire( repertoire: DirectedGraph, logic: Chess, variation: any[] ) {
		for (let i = 0; i < variation.length; i++) {
			const move = variation[i];
			const notation = String(move?.notation?.notation);

			move.variations.forEach((move_var: any[]) => {
				addVariationToRepertoire(repertoire, logic, move_var)
			});

			let old_position_key = keyFromPosition(logic);
			let move_data = logic.move(notation);
			let { from, to, piece, flags } = move_data;
			const position_key = keyFromPosition(logic);
			repertoire.mergeNode(position_key, { fen: logic.fen(), label: position_key });
			repertoire.mergeEdge(old_position_key, position_key, { label: notation, forceLabel: true, move: notation, from, to, piece, flags })

			// console.log({parentId});

		}
		for (let i = 0; i < variation.length; i++) {
			// console.log('UNDO');
			logic.undo();
		}
	}

	function addPositionToRepertoire(position: Chess, repertoire: ChessRepertoire) {
		const key = keyFromPosition(position);

		if (repertoire.states.has(key)) {
			return key;
		}

		let state = { fen: position.fen(), id: repertoire.states.size } 
		repertoire.states.set(key, state)
		return key;

	}

	function keyFromPosition(position: Chess) {
		let key = position.fen();
		const parts = key.split(' ');
		return parts.slice(0, 4).join(' ');
	}
	
	function buildRepertoire(repertoire: DirectedGraph, game: ParseTree, initialPosition?: string) {
	 	let logic = new Chess(initialPosition);

		 const position_key = keyFromPosition(logic);
		repertoire.mergeNode(position_key, { fen: logic.fen() });

		addVariationToRepertoire(repertoire, logic, game.moves);

		return repertoire;
	}

	function handleLogClick() {
		if (parsed.length) {
			let game = parsed[0] as ParseTree;
			console.log(game);

			repertoire = buildRepertoire(repertoire, game);
			console.log(repertoire);
		}
	}

</script>

<PlayableBoard></PlayableBoard>
<Graph graph={repertoire}></Graph>
<button onclick={handleLogClick}>log</button>
<textarea bind:value={pgnToLoad}></textarea>

{#each parsed as game, game_idx}
<div class="container-fluid">
	{#each game.moves as move, move_idx}
		<button onclick={() => console.log(move)} >
			{ move.notation.notation }
		</button>
	{/each}
</div>
{/each}

<script lang="ts">
	import { Chess } from 'chess.js';
	import { parse } from '@mliebelt/pgn-parser';
	import type { PgnOptions, ParseTree } from '@mliebelt/pgn-parser';
	import PlayableBoard from '../components/PlayableBoard.svelte';

	let repertoire: ChessRepertoire = { 
		id: '',
		side: 'w',
		states: new Map(), 
		moves: [] 
	};

	let parse_options = undefined as unknown as PgnOptions;  
	$: parsed = parse(pgnToLoad, parse_options) as ParseTree[];
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

	function addVariationToRepertoire( repertoire: ChessRepertoire, logic: Chess, variation: any[] ) {

		for (let i = 0; i < variation.length; i++) {
			const move = variation[i];
			const notation = String(move?.notation?.notation);

			move.variations.forEach((move_var: any[]) => {
				addVariationToRepertoire(repertoire, logic, move_var)
			});

			let oldStateKey = keyFromPosition(logic);
			logic.move(notation);
			let newStateKey = addPositionToRepertoire(logic, repertoire);


			
			let edge: GameMoveEdge = { from_key: oldStateKey, to_key: newStateKey, notation }
			repertoire.moves.push(edge);

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
	
	function buildRepertoire(repertoire: ChessRepertoire, game: ParseTree, initialPosition?: string) {
	 	repertoire = { ...repertoire, states: new Map(), moves: [] }  
	 	let logic = new Chess(initialPosition);

		addPositionToRepertoire(logic, repertoire);
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

	let pgnToLoad = `1. e4 (1. d4 Nf6) 1... e5 2. Nf3 (2. Bc4 f6 3. Nf3 (3. Qh5+ g6 4. Qh3)) (2. d4 exd4) 2... Nc6 3. Bb5`
</script>

<PlayableBoard></PlayableBoard>
<button on:click={handleLogClick}>log</button>
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

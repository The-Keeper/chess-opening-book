<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Chess } from 'chess.js';
	import { onMount } from 'svelte';
	import {toDests, playOtherSide} from '$lib/util';
	import { parse } from '@mliebelt/pgn-parser';
	import type { PgnOptions } from '@mliebelt/pgn-parser';


	const chess = new Chess();

	$: moveNumber = chess.moveNumber();
	let parsed = {}

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

	let pgnToLoad = "";
	function loadPgn() {
		let options = undefined as unknown as PgnOptions;  
	 	parsed = parse(pgnToLoad, options);
		console.log(parsed);
	}
</script>

<div class="container" id="board">
	<Chessground bind:this={chessground} {config} />
</div>
<textarea bind:value={pgnToLoad}></textarea>
<button on:click={loadPgn}> Load</button>
<p>
	{ parsed }
</p>

<style>
	.container {
		width: 400px;
		height: 400px;
	}
</style>

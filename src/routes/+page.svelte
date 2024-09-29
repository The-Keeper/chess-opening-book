<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Chess } from 'chess.js';
	import { onMount } from 'svelte';
	import {toDests, playOtherSide} from '$lib/util';


	const chess = new Chess();

	$: moveNumber = chess.moveNumber();

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
</script>

<div class="container" id="board">
	<Chessground bind:this={chessground} {config} />
</div>
<p>
	It's move {moveNumber}.
</p>

<style>
	.container {
		width: 400px;
		height: 400px;
	}
</style>

<script lang="ts">
	import Sigma from 'sigma';
	import Graph from 'graphology';
	import { onMount } from 'svelte';
    import circular from 'graphology-layout/circular';
    import { random } from 'graphology-layout';
    import forceLayout from 'graphology-layout-force';
    import drawEdgeLabel from 'sigma/rendering/canvas/edge-label';
    import noverlap from 'graphology-layout-noverlap';
    import forceAtlas2 from 'graphology-layout-forceatlas2';

    export let graph: Graph;

    let renderer: Sigma;
    onMount(() => {
        const container = document.getElementById('sigma-container');

        if (container) {
            random.assign(graph);

            renderer = new Sigma(graph, container, { allowInvalidContainer: true });
        }
    })

    function renderGraph() {
        circular.assign(graph);
        renderer.refresh()    
    }

</script>

<h1>Sigma graph exemple</h1>
<div id="sigma-container"></div>

<button onclick={ renderGraph }>render</button>

<style>
	#sigma-container {
		width: 550px;
		height: 450px;
	}
</style>

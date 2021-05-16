<script>
	//Goals of project: learning to use github
	//Learn to use stores
	//Learn to do reactive content
	import Clicker from "./Clickerbutton.svelte";
	import Gold from "./stores/GoldStore.js";

</script>

<main>
	<h1>Gold: {$Gold}</h1>
	<Clicker />
</main>
<script>
	//Goals of project: learning to use github
	//Learn to use stores
	//Learn to do reactive content
	import Clicker from "./Clickerbutton.svelte";
	import Gold from "./stores/GoldStore.js";
	import Boss from "./Boss.svelte";
	import Xpbar from "./Player.svelte"

</script>

<main>
	<h1 style='text-align: left;'>Gold: {$Gold}</h1>
	<Boss />
	<Clicker />
	<Xpbar />
</main>
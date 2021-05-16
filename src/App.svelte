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
	<article>
	<div class= "grid">
		<h1 style = "color: hsl(50, 100%, 40%)" class="fattext gold">Gold: {$Gold}</h1>
		<p></p>
		<button>Store</button>
	</div>

	<Boss />
	<Clicker />
	<Xpbar />
	</article>
</main>
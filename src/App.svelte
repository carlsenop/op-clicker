<script>
	//Goals of project: learning to use github
	//Learn to use stores
	//Learn to do reactive content
	import Clicker from "./Clickerbutton.svelte";
	import Gold from "./stores/GoldStore.js";
	import Boss from "./Boss.svelte";
	import Xpbar from "./Player.svelte";
	import Bosslevel from "./misc/BossLevel.svelte";
	import BuyDmg from "./Buydmg.svelte";

</script>



<body>
	
<main class = "backy">
	<article>
	<div class= "grid">
		<h1 style = "color: hsl(50, 100%, 60%)" class="fattext gold">Gold: {$Gold}</h1>
		<Bosslevel />
		<BuyDmg />
	</div>
	<Boss />
	<Clicker />
	<Xpbar />
	</article>
</main>
</body>

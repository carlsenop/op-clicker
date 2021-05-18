<script>
	//Goals of project: learning to use github
	//Learn to use stores
	//Learn to do reactive content
	import Clicker from "./Clickerbutton.svelte";
	import Gold from "./stores/GoldStore.js";
	import Xpbar from "./Player.svelte";
	import BuyDmg from "./Buydmg.svelte";
	import { Level, ClickDmg, AutoDmg, BossLevel, BossHP} from "./stores/StatsStore";

</script>

 <body>	
	<main class = "backy">
		<section class="grid">
			<div class="fattext gold">Gold: {$Gold}</div>
			<div class="fattext bosstext">
				Carls Level: {$BossLevel} HP: {$BossHP}</div>
			<div><BuyDmg /></div>		
		</section>
			<div><Clicker /><div>
		<section class="bottomgrid">
			<div class="fattext green">Level: {$Level}</div>
			<div class="lesstext green"> click dmg: {$ClickDmg} <br> auto dmg: {$AutoDmg} </div>
		</section>
			<div><Xpbar /></div>
	</main>
</body>

<style>
	.green {
    color:rgb(0, 255, 76);
}
</style>
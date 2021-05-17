<script>
    import { Cost, AutoDmg, BossHP }  from "./stores/StatsStore.js";
    import Gold from "./stores/GoldStore.js";
    import { onMount } from "svelte";

    let NotAffordable = true;

    function makeAffordable() {
        NotAffordable = false;
    }
    
    function buyDmg() {
        $Gold += -$Cost;
        $Cost = Math.ceil($Cost ** 1.1)
        NotAffordable = true;
        $AutoDmg += 1;
    }

    onMount(() => {
        setInterval(() => {
            $BossHP -= $AutoDmg;
            $Gold += $AutoDmg;}, 1000);
    });

    Gold.subscribe(value => {
        if (value >= $Cost) {
        makeAffordable();
        }
    }); 
</script>

<button class ="shop"
    disabled={NotAffordable} 
    on:click = "{buyDmg}">
    Buy 1 DMG!<br>Cost: {$Cost}
    </button>

<style>

</style>
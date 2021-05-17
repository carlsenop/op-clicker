<script>

    import Gold from "./stores/GoldStore.js";
    import { ClickDmg, BossHP, BossDeath, AutoDmg } from "./stores/StatsStore.js";

    let visable = false;

    function Clicked() {
        $Gold += + $ClickDmg;
        $BossHP = $BossHP - $ClickDmg;
    }
    function setVisable() {
        visable = true;
        setTimeout(function() {visable = false;}, 300)
    }

</script>


<div>

    {#if $BossDeath}
        {setVisable()}
    {/if}

    {#if visable}
        <img class ="bossimg" src="bosshit.png" alt="boss" on:click = {Clicked}>
    {:else}
        <img class ="bossimg" src="boss.png" alt="boss" on:click = {Clicked}>
    {/if}

</div>

<style>

    

</style>
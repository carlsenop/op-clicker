<script>

    import Gold from "./stores/GoldStore.js";
    import { ClickDmg, BossHP, BossDeath } from "./stores/StatsStore.js";

    let visable = false;
    let m = { x: 0, y: 0 };
    let left = "{m.x}.px"

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
        <img class ="bossimg" src="bosshit.png" alt="boss" on:click = {Clicked}
        on:mousemove="{e => m = { x: e.clientX, y: e.clientY }}">
    {:else}
        <img class ="bossimg" src="boss.png" alt="boss" on:click = {Clicked}
     on:mousemove="{e => m = { x: e.clientX, y: e.clientY }}">
    {/if}

</div>

<style>

    

</style>
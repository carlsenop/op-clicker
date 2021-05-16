<script>
import { writable } from "svelte/store";

    import { Experience, BossHP, BossDeath } from "./stores/StatsStore.js";
    let BossLevel = 1;

    function BossUp(){
        BossLevel += 1;
    }

    function Death() {
        $BossHP = (BossLevel ** 2) + 10;
        $Experience += 50;
        $BossDeath = true;
    }

</script>

{#if $BossHP <= 0}
    {BossUp()}
    {Death()}
{/if}

<h1>Level: {BossLevel}</h1>
<img src="boss.png" alt="boss">
<h1>HP of Boss: {$BossHP}</h1>



<style>
    img {
        width: 50%;
    }
</style>
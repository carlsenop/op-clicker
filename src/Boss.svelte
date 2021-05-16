<script>
    import { Experience, BossHP, BossDeath } from "./stores/StatsStore.js";
    import { tweened } from 'svelte/motion';
    
    const progress = tweened(0);
    let BossLevel = 1;

    function BossUp(){
        BossLevel += 1;
    }

    function Death() {
        $BossHP = (BossLevel ** 2) + 10;
        $Experience += 50;
        $BossDeath = true;
    }
//<img src="boss.png" alt="boss">
//<style>
//    img {
//        width: 50%;
//    }
//</style>

</script>

{#if $BossHP <= 0}
    {BossUp()}
    {Death()}
{/if}

<h1 class = "fattext">Carls Level: {BossLevel}</h1>
<h3>Boss HP: {$BossHP}</h3>

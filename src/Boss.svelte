<script>
    import { Experience, BossHP, BossDeath, BossLevel, AutoDmg } from "./stores/StatsStore.js";

    function BossUp(){ 
        $BossLevel += 1;
    }

    function Death() {
        $BossHP = ($BossLevel ** 2) + 10;
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



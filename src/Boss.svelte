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

    BossHP.subscribe(value => {
        if (value <= 0) {
        BossUp();
        Death();
        }
    });

</script>


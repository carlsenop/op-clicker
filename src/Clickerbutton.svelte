<script>

    import Gold from "./stores/GoldStore.js";
    import { ClickDmg, BossHP, BossDeath, BossLevel, Experience } from "./stores/StatsStore.js";

    let visable = false;

    function Clicked() {
        $Gold += + $ClickDmg;
        $BossHP = $BossHP - $ClickDmg;
    }
    function setVisable() {
        visable = true;
        setTimeout(function() {visable = false;}, 300)
    }

    BossDeath.subscribe(value => {
        if (value) {
            setVisable();
        }
    }); 


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


<div>
    <img class="bossimg" src="{ visable ? 'bosshit.png' : 'boss.png' }" alt="boss" on:click = {Clicked}>
</div>

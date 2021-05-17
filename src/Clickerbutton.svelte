<script>

    import Gold from "./stores/GoldStore.js";
    import { ClickDmg, BossHP, BossDeath } from "./stores/StatsStore.js";

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

</script>


<div>
    <img class="bossimg" src="{ visable ? 'bosshit.png' : 'boss.png' }" alt="boss" on:click = {Clicked}>

</div>

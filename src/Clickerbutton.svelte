<script>
import Gold from "./stores/GoldStore.js";
import { ClickDmg, BossHP } from "./stores/StatsStore.js";

function Clicked() {
    $Gold += + $ClickDmg;
    $BossHP = $BossHP - $ClickDmg;
}

</script>


<button on:click = {Clicked} >Click for gold!</button>
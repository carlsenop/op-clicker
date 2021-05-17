<script>
    import { Cost, AutoDmg, BossHP }  from "./stores/StatsStore.js";
    import Gold from "./stores/GoldStore.js";

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
    function startAutodmg() {
        setInterval(() => {($BossHP -= $AutoDmg)}, 1000);
        setInterval(() => {($Gold += $AutoDmg)}, 1000);
    }
</script>

{#if ($Gold >= $Cost) && (NotAffordable)}
    {makeAffordable()}
{/if}

<button 
    disabled={NotAffordable} 
    on:click = "{buyDmg}"
    on:click|once="{startAutodmg}">
    Buy 1 DMG!<br>Cost: {$Cost}
    </button>
<script>
    import { Experience, Level, ClickDmg, BossDeath,  } from "./stores/StatsStore.js";
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import  {writable } from 'svelte/store';

    const Progress = tweened(0);
    let RequiredXp = (100);
    let XpLeft = (100);
    $: XpLeft = (RequiredXp - $Experience);
    

    function LevelUp() {
        $Level += 1;
        $ClickDmg += + 1;
        $Experience = 0;
        {CalcReqXp()}
    }

    function CalcReqXp() {
        RequiredXp = (Math.ceil(RequiredXp ** 1.1));

    }
    function please() {
        $BossDeath = false;
        $Progress = (((RequiredXp - XpLeft) / RequiredXp) * 100)
        if ($Progress >= 100)
            $Progress = 0;
    }

</script>

{#if $Experience  >= RequiredXp}
    {LevelUp()}
{/if}

{#if $BossDeath}
    {please()}
{/if}

<div>
    <h1>Level: {$Level}</h1>
</div>
<div class="progress-container">
    <div class ="progress-bar" style="width: {$Progress}%;">
 
    </div>
</div>

<style>
    .progress-container {
        margin-left: 10%;
        margin-right: 10%;
        border: solid rgb(194, 194, 194) 5px;
    }
    .progress-bar {
        height: 30px;
        background-color: rgb(77, 199, 55);

    }
</style>
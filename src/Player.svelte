<script>
    import { Experience, Level, ClickDmg, BossDeath, AutoDmg  } from "./stores/StatsStore.js";
    import { tweened } from 'svelte/motion';

    const Progress = tweened(0);
    let RequiredXp = 100;
    $: XpLeft = RequiredXp - $Experience;
    

    function LevelUp() {
        $Level += 1;
        $ClickDmg += 1;
        $Experience = 0;
        CalcReqXp()
    }

    function CalcReqXp() {
        RequiredXp = RequiredXp ** 1.1;

    }
    function please() {
        $BossDeath = false;
        $Progress = (((RequiredXp - XpLeft) / RequiredXp) * 100)
        console.log($Progress);
        if ($Progress >= 100) 
            $Progress = 0;
    }

    Experience.subscribe(value => {
        if (value >= RequiredXp) {
            LevelUp();
        }
    }); 

</script>

{#if $BossDeath}
    {please()}
{/if}



<div class="progress-container">
    <div class ="progress-bar" style="width: {$Progress}%;">
    
    </div>
 </div>

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

<article style = "line-height: 0%">
    <div class= "grid">
        <p></p>
        <h1 style = "color: hsl(111 73% 45%) "class ="semifattext">Level: {$Level}</h1>
        <box style = "font-family: impact; border-style: solid; padding: 5px; color: green"> 
            <p>Click Dmg: {$ClickDmg}</p> 
            <p>Auto Dmg: {$AutoDmg}</p>
        </box>
	</div>
    <div class="progress-container">
        <div class ="progress-bar" style="width: {$Progress}%;">
    
        </div>
    </div>
</article>

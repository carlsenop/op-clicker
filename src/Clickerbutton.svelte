<script>
import Gold from "./stores/GoldStore.js";

export function Clicked() {
    $Gold += +1;
}

</script>


<button on:click = {Clicked} >Click for gold!</button>
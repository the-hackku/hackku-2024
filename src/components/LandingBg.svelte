<script>
	import '../global.css';
  import Sun from './assets/sun.svelte';
  import Clouds from './assets/clouds.svelte';
  import Ground from './assets/ground.svelte'
  import Ducks from './assets/ducks.svelte'
  import Flowers from './assets/flowers.svelte';
</script>

<div class="full-width">
  <div class="sky">
    <Sun />
    <Clouds />
  </div> 
  <Ground />
  <Ducks />
  <Flowers />
</div>

<style>
  .full-width {
    width: 100vw;
    max-width: 100%;
    z-index: -10;
    margin: 0;
  }
  .sky {
    position: absolute;
    top: 0px;
  }
</style>
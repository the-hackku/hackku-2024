<script>
	import '../global.css';
  import Nav from './Nav.svelte';
  import NavMobile from './NavMobile.svelte';
  import LandingBg from './LandingBg.svelte';
  import LandingBgMobile from './LandingBgMobile.svelte';

  let threshold = 840
	let innerWidth
	$: smallScreen = innerWidth < threshold
</script>

<svelte:window bind:innerWidth />

<div>
  <div class="landing" id="landing">
    {#if smallScreen}
      <LandingBgMobile />
      <NavMobile />
      <div class="landing-text-mobile-container" id="landing-text">
        <h4>APRIL 12 - 14, 2024</h4>
        <div class="divided-title">
          <h1>Hack</h1> 
          <h1>KU24</h1>
        </div>
        <h4>The University of Kansas</h4>
      </div>
		{:else}
      <LandingBg />
      <Nav />
      <div class="landing-text-container" id="landing-text">
        <h4>APRIL 12 - 14, 2024</h4>
        <h1>HackKU24</h1> 
        <h4>The University of Kansas</h4>
      </div>
		{/if}
  </div>
</div>

<style>
  .landing {
    width: 100vw;
    height: 100vh;
    max-width: 100%;
    background-color: var(--blue-lt);
  }
  .divided-title {
    text-align: center;
  }
  .landing-text-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 60vh;
  }  
  .landing-text-mobile-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-content: center;
    width: 100vw;
    height: 80vh;
  }
</style>
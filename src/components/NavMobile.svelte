<script>
	import '../global.css';
	import Hamburger from './assets/hamburger.svelte'
	import { fade, fly } from 'svelte/transition'

	let hamburgerExpanded = false
	
  let links = [
		{ display: "HACKERDOC", action: () => window.open("https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74", "_blank")},
		{ display: "ABOUT", action: () => scrollToID("about")},
		{ display: "FAQ", action: () => scrollToID("faq")},
		{ display: "SPONSORS", action: () => scrollToID("sponsors")},
		{ display: "CONTACT", action: () => scrollToID("contact")},
    { display: "REGISTER NOW!", action: () => window.open("https://forms.gle/Sck3FsitxKgNQMpP8", "_blank")}, 
	]
  const scrollToID = (id) => {
    window.scrollTo({
      top: document.getElementById(id).offsetTop,
      behavior: 'smooth'
    });
  }
</script>

<div>
  {#if hamburgerExpanded}
		<div on:click={() => hamburgerExpanded = false} transition:fade class="link-list">
			{#each links as link}
				<div on:click={link.action}><h4 class="nav-link turn-red">{link.display}</h4></div>
			{/each}
		</div>
	{:else}
		<div transition:fly>
			<div class="hamburger" on:click={() => hamburgerExpanded = !hamburgerExpanded}>
				<Hamburger />
			</div>
		</div>
	{/if}
</div>

<style>
.link-list {
	position: fixed;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	gap: 2rem;
	width: 100vw;
	height: 100vh;
	z-index: 20;
	background-color: var(--blue-lt);
}
.nav-link {
	-webkit-transition: color 0.5s, font-size 0.5s;
  transition: color 0.5s, font-size 0.5s;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer
}
.nav-link:hover {
	font-size: 3.3rem;
}
.hamburger {
	height: 4rem;
	z-index: 1000;
	position: fixed;
	cursor: pointer;
	top: 2rem;
	left: 2rem;
	cursor: pointer;
}
</style>
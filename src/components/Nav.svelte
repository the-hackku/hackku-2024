<script>
	import '../global.css';

  let links = [
		{ display: "HACKERDOC", action: () => window.open("https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74", "_blank")},
		{ display: "ABOUT", action: () => scrollToID("about")},
		{ display: "FAQ", action: () => scrollToID("faq")},
		{ display: "SPONSORS", action: () => scrollToID("sponsors")},
		{ display: "CONTACT", action: () => scrollToID("contact")},
    { display: "REGISTER NOW!", action: () => window.open("https://forms.gle/VxKryAnMaGowQkMj6", "_blank")}, 
	]
  const scrollToID = (id) => {
    window.scrollTo({
      top: document.getElementById(id).offsetTop,
      behavior: 'smooth'
    });
  }
</script>

<div>
  <div class="navbar" id="nav">
    {#each links as link}
      <p><a class="nav-link turn-red" href="/" onclick="return false;" on:click={link.action}>{link.display}</a></p>
    {/each}
  </div>
</div>

<style>
  .navbar {
    position: relative;
    width: 100vw;
    height: 6.2rem;
    display: flex;
    gap: 5rem;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .nav-link {
    -webkit-transition: color 0.5s, font-size 0.5s;
    transition: color 0.5s, font-size 0.5s;
    text-decoration: none;
    color: var(--off-black);
  }
  .nav-link:hover {
    font-size: 2.2rem;
  }
</style>
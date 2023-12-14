<script>
	import './global.css';
	import Landing from './components/Landing.svelte';
	import About from './components/About.svelte'
	import Faq from './components/Faq.svelte'
	import Sponsors from './components/Sponsors.svelte'
	import Contact from './components/Contact.svelte'
	import Footer from './components/Footer.svelte'
</script>

<main>
	<div class="site-container">
		<Landing />
		<About />
		<Faq />
		<Sponsors />
		<Contact />
		<Footer />
	</div>
	<a id="mlh-trust-badge" style="display:block;max-width:100px;min-width:60px;position:fixed;right:50px;top:0;width:10%;z-index:0" href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=yellow" target="_blank"><img src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-yellow.svg" alt="Major League Hacking 2024 Hackathon Season" style="width:100%"></a>
</main>

<style>
	
</style>

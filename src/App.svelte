<script>
	import Heart from './components/Heart.svelte'
	import { fade, fly } from 'svelte/transition'
	import NavBarLogo from './components/HackKU.svelte'
	import RegisterButton from './components/RegisterButton.svelte'
	import MemberButton from './components/MemberButton.svelte'
	import { onMount } from 'svelte';
	import './tw.css'
  import HackerDocs from './HackerDocs.svelte';

	let members = {
		"zoe": {
			display: "Zoe Kulphongpatana",
			title: "Director",
			link: "https://www.linkedin.com/in/kulphongpatana/",
		},
		"james":{
			display: "James Hurd",
			title: "Vice Director",
			link: "jameshurd.net",
		},
		"firangiz": {
			display: "Firangiz Ganbarli",
			title: "Logistics",
			link: "https://www.linkedin.com/in/firangizganbarli/",
		},
		"jerusha": {
			display: "Jerusha Rowden",
			title: "Swag",
			link: "https://www.linkedin.com/in/jerusha-rowden/", 
		},
		"skyler": {
			display: "Skyler Bosch",
			title: "Sponsorship",
			link: "https://www.linkedin.com/in/skyler-bosch-37393a159/", 
		},
		"raven": {
			display: "Raven Duong",
			title: "Logistics",
			link: "", 
		},
		"michelle": {
			display: "Michelle Chen",
			title: "Finance",
			link: "https://www.linkedin.com/in/michelle-chen3", 
		},
		"shayna": {
			display: "Shayna Weinstein",
			title: "Sponsorship",
			link: "", 
		},
		"mikaela": {
			display: "Mikaela Navarro",
			title: "Food",
			link: "", 
		},
		"sungin": {
			display: "Sungin Huh",
			title: "Food",
			link: "https://www.linkedin.com/in/sungin-huh-730b97173/", 
		},
		"ameera": {
			display: "Ameera Alhajeri",
			title: "Marketing",
			link: "https://www.linkedin.com/in/ameera-alhajri-740273255", 
		},
		"tej": {
			display: "Tej Gumaste",
			title: "Tech",
			link: "", 
		},
		"raj": {
			display: "Raj Kaura",
			title: "Tech",
			link: "", 
		}
	}
	let links = [
		{ display: "ABOUT", action: () => scrollToID("about")},
		{ display: "FAQ", action: () => scrollToID("faq")},
		{ display: "SPONSORS", action: () => scrollToID("sponsors")},
		{ display: "PRIZES", action: () => scrollToID("prizes")},
		{ display: "MEET THE TEAM", action: () => scrollToID("contact")},
		{ display: "REGISTER NOW!", action: () => window.open("https://forms.gle/KwRNWYcxXyqf3EdZ7", "_blank")}
	]
	const scrollToID = (id) => {
		window.scrollTo({
			top: document.getElementById(id).offsetTop - 60,
			behavior: 'smooth'
		})
	}
	let hamburgerExpanded = false

	let innerHeight
	let innerWidth
	let scrollY

	$: smallScreen = innerWidth < 750
	$: hamburgerExpanded = hamburgerExpanded && smallScreen

	onMount(() => {
		let acc = document.getElementsByClassName("accordion");
		let i;
		
		for (i = 0; i < acc.length; i++) {
			acc[i].addEventListener("click", function() {
				this.classList.toggle("active");
				let panel = this.nextElementSibling;
				if (panel.style.display === "block") {
					panel.style.display = "none";
				} else {
					panel.style.display = "block";
				}
			});
		}
	})
</script>

<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	/* COLORS */
	:root {
		--background: #F3F7E1;
		--background-accent: #EDF1C0;
		--header: #F37A63;
		--accent1: #F4AD9A;
		--body-text: #7085C1;
		--accent2: #92A0CA;
		--accent3: #BFC6D5;
		--accent4: #CED4DA;
	}

	/* BODY */
	main {
		margin: 0;
	}
	.section {
		background-color: var(--background);
		position: relative;
		padding: 4rem 8rem 4rem 8rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* FONTS */
	.title {
		font-family: 'Modak';
		font-size: 12em;
		font-weight: 400;
		color: var(--header)
	}
	header {
		font-family: 'Modak';
		font-size: 4.5em;
		font-weight: 400;
		color: var(--header);
	}
	h2 {
		font-family: 'PT Sans';
		font-size: 2.25em;
		font-weight: 700;
		color: var(--body-text);
	}
	.body-text {
		font-family: 'PT Sans';
		font-size: 1.5em;
		font-weight: 400;
		color: var(--body-text);
	}
	.caption {
		font-family: 'PT Sans';
		font-size: 1.25em;
		font-weight: 400;
		color: var(--body-text);
	}

	/* REM SETTINGS */
	html {
    font-size: 8px;
	}
	@media only screen and (min-width: 720px) {
		html {
			font-size: 10px;
		}
	}
	@media only screen and (min-width: 960px) {
		html {
			font-size: 12px;
		}
	}
	@media only screen and (min-width: 1240px) {
		html {
			font-size: 14px;
		}
	}

	/* SVGS */
	svg {
		height: 100%;
	}

	/* LINKS */
	.linkCont {
		display: flex;
		justify-content: end;
		flex-grow: 1;
	}
	.link {
		cursor: pointer;
		transition: .2s;
		height: 4rem;
	}
	.link:hover {
		padding: 0 4rem 0 4rem;
		color: var(--background);
		background-color: var(--accent1);
	}

	/* HAMBURGER */
	.hamburgerMenu {
		height: 2em;
	}
	.hamburgerMenu svg{
		height: 100%;
	}

	/* NAV */
	.navbar {
		display: flex; 
		align-items:center;
		position: fixed;
		top: 4rem;
		left: 8rem;
		right: 8rem;
		z-index: 100000;
	}
	.right-nav {
		display: flex;
		justify-content: right;
		align-items: center;
		column-gap: 2.25rem;
		height: 4rem;
		padding-right: 2rem;
		border: 0.1875rem solid var(--body-text);
		border-left: none;
		background-color: var(--background);
	}
	.left-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 4rem;
		border: 0.1875rem solid var(--body-text); 
		margin: none;
		padding: 0 3.5rem 0 3.5rem;
		background-color: var(--body-text);
		color: var(--background);
	}
	
	/* HOME */
	#home {
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		flex-direction: column;
		gap: 1.75rem;
		min-height: 100vh;
	}
	.sub-container {
		display: flex;
		min-width: 85vw;
		align-items: flex-end;
		justify-content: space-between;
	}
	.fishbowl-image {
		height: 19rem;
	}

	/* FAQ */
	.qanda-container {
		display: flex;
		justify-content: center;
		flex-direction: column;
		width: 600px;
		max-width: 80%;
		justify-content: space-around;
		margin: auto;
	}

	/* ACCORDIAN */
	.accordion {
		background-color: var(--background);
		font-family: 'PT Sans';
		color: var(--body-text);
		cursor: pointer;
		padding: 18px;
		text-align: left;
		border: none;
		outline: none;
		transition: 0.4s;
		font-size: 1em;
		color: var(--body-text);
		font-weight: 400;
	}
	/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
	.active, .accordion:hover {
		background-color: var(--background);
	}
	/* Style the accordion panel. Note: hidden by default */
	.panel {
		padding: 0 18px;
		background-color: var(--background);
		display: none;
		overflow: hidden;
		font-size: 1em;
		color: var(--header);
		font-weight: 400;
	}
	.accordion:after {
		content: '\02795'; /* Unicode character for "plus" sign (+) */
		font-size: 13px;
		color: var(--body-text) !important;
		float: right;
		margin-left: 5px;
	}
	.active:after {
		content: "\2796"; /* Unicode character for "minus" sign (-) */
		color: var(--body-text) !important;
	}

	/* SPONSORS */
	.sponsors {
		max-width: 70vw;
		margin: auto;
		display: flex;
		justify-content: space-around;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		gap: 5%;
	}
	.sponsor-image {
		width: 250px;
		margin-top: 4%;
	}

	.team {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	@keyframes backgroundScroll {
		from {
			background-position-x: 0%;
		}
		to {
			background-position-x: 100%;
		}
	}
</style>

<svelte:window bind:innerHeight bind:innerWidth bind:scrollY />

<main class="text-base sm:text-xl relative">

	<!-- {#if hamburgerExpanded}
		<div on:click={() => hamburgerExpanded = false} transition:fade class="fixed z-20 top-0 left-0 w-screen h-screen flex flex-col p-4 gap-2 justify-between bg-[#f2f2dd]">
			<div class="h-12 flex justify-between items-center my-2">
				<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 662.23 139.69"><defs><style>.navBarLogoSvg{fill:#e8000d;}</style></defs><path class="navBarLogoSvg" d="M126.44,12.56H74.25a2,2,0,0,0-2,2V26a2,2,0,0,0,1.63,2l10.6,2V65.07H43.79V29.8L55.48,28a2,2,0,0,0,1.69-2V14.56a2,2,0,0,0-2-2H2.33a2,2,0,0,0-2,2V26a2,2,0,0,0,1.64,2l10.1,1.83v91.82L1.73,123A2,2,0,0,0,0,125v10.76a2,2,0,0,0,2,2H55.17a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.62-1.41V82.94H84.48v38.51L74,123a2,2,0,0,0-1.71,2v10.76a2,2,0,0,0,2,2h52.19a2,2,0,0,0,2-2V125a2,2,0,0,0-1.73-2l-10.34-1.4V29.77l10.41-1.83a2,2,0,0,0,1.66-2V14.56A2,2,0,0,0,126.44,12.56Zm-2,11.73L114,26.12a2,2,0,0,0-1.65,2v95.25a2,2,0,0,0,1.73,2l10.34,1.4v7H76.25v-7l10.52-1.55a2,2,0,0,0,1.71-2V80.94a2,2,0,0,0-2-2H41.79a2,2,0,0,0-2,2v42.4a2,2,0,0,0,1.76,2l11.62,1.42v7H4v-7l10.34-1.4a2,2,0,0,0,1.73-2V28.09a2,2,0,0,0-1.65-2L4.33,24.3V16.56H53.17v7.71L41.48,26.12a2,2,0,0,0-1.69,2v39a2,2,0,0,0,2,2H86.48a2,2,0,0,0,2-2V28.26a2,2,0,0,0-1.63-2l-10.6-2V16.56h48.19Z"/><path class="navBarLogoSvg" d="M190.2,88.72c-8.87,0-15.62,1.67-20,5A16,16,0,0,0,163.25,107c0,5.34,1.25,9.6,3.7,12.67a12.82,12.82,0,0,0,10.53,4.82,17.45,17.45,0,0,0,7.39-1.9h0a26.41,26.41,0,0,0,6.7-4.51,2,2,0,0,0,.63-1.46V90.72A2,2,0,0,0,190.2,88.72Zm-2,27a23.29,23.29,0,0,1-5,3.25,13.59,13.59,0,0,1-5.67,1.51,8.89,8.89,0,0,1-7.41-3.32c-1.87-2.34-2.82-5.76-2.82-10.17a12.06,12.06,0,0,1,5.31-10.14c3.4-2.53,8.65-3.92,15.64-4.14Z"/><path class="navBarLogoSvg" d="M223.64,123h-6.48V76.53c0-8.5-1.13-15.36-3.36-20.38a22.64,22.64,0,0,0-11.59-11.61c-5.19-2.39-12.36-3.6-21.3-3.6a68.42,68.42,0,0,0-17.72,2.27,73.21,73.21,0,0,0-14.51,5.37,53.64,53.64,0,0,0-8.83,5.36,2,2,0,0,0-.54,2.41l5.54,11.74a2,2,0,0,0,2.63,1,103.66,103.66,0,0,1,12.88-4.88,48.14,48.14,0,0,1,13.7-1.79c4.12,0,7.22.5,9.22,1.5A7.27,7.27,0,0,1,187,68a25,25,0,0,1,1.17,8.58v1.29c-15.22.31-27.78,3-37.33,8-10.4,5.46-15.67,13.47-15.67,23.79a31.18,31.18,0,0,0,3.94,15.93A26.93,26.93,0,0,0,149.88,136a31.37,31.37,0,0,0,14.88,3.58,34,34,0,0,0,16.8-4.09,45.13,45.13,0,0,0,8-5.58c.15,3.61,1,6.08,2.7,7.54s4.81,2.29,9.55,2.29a99.17,99.17,0,0,0,11.66-.83c4.57-.56,8.05-1.1,10.62-1.66a2,2,0,0,0,1.58-2V125A2,2,0,0,0,223.64,123Zm-2,10.64c-2.26.42-5.17.85-8.68,1.28a95.69,95.69,0,0,1-11.18.8c-4.91,0-6.47-.9-6.91-1.3s-1.36-1.77-1.36-5.67V125a2,2,0,0,0-3.54-1.28A36.68,36.68,0,0,1,179.61,132a30.11,30.11,0,0,1-14.85,3.58,27.37,27.37,0,0,1-13-3.11,23,23,0,0,1-9.16-8.87,27.13,27.13,0,0,1-3.4-13.91c0-8.84,4.42-15.47,13.53-20.25,9.39-4.93,22-7.49,37.49-7.6a2,2,0,0,0,2-2V76.53a28.66,28.66,0,0,0-1.43-10,11.3,11.3,0,0,0-5.71-6.21c-2.58-1.29-6.18-1.92-11-1.92a52.21,52.21,0,0,0-14.85,2,102.94,102.94,0,0,0-11.58,4.27l-4-8.5a63.07,63.07,0,0,1,6.89-4,69.12,69.12,0,0,1,13.71-5.07,64.43,64.43,0,0,1,16.69-2.13c8.36,0,15,1.09,19.63,3.24a18.52,18.52,0,0,1,9.61,9.59c2,4.51,3,10.82,3,18.76V125a2,2,0,0,0,2,2h6.48Z"/><path class="navBarLogoSvg" d="M303.41,114.35a2,2,0,0,0-1.23-1.08,2,2,0,0,0-1.63.21,39.82,39.82,0,0,1-21.14,5.9c-5.5,0-9.77-2.59-13.05-7.93-3.43-5.58-5.17-13.81-5.17-24.48,0-11.23,1.36-19.28,4.06-23.95,2.51-4.38,5.87-6.5,10.25-6.5a12.29,12.29,0,0,1,4.54.74,2.14,2.14,0,0,1,1.5,1.61l4.24,18.76a2,2,0,0,0,2,1.55H304.2a2,2,0,0,0,2-1.92l1.14-29.52a2,2,0,0,0-1.72-2.06c-.37,0-1.61-.3-5.55-1.39a86.84,86.84,0,0,0-10.44-2.59,69.52,69.52,0,0,0-12.17-.93A51.33,51.33,0,0,0,252,47a43.58,43.58,0,0,0-17.25,17.68c-4,7.54-6.11,16.42-6.11,26.39,0,14.55,3.72,26.37,11.07,35.12s18.7,13.36,33.5,13.36A48.85,48.85,0,0,0,294,135.18c6.29-2.91,10.71-5.87,13.53-9a2,2,0,0,0,.33-2.17Zm-11.14,17.2a44.93,44.93,0,0,1-19,4c-13.56,0-23.8-4-30.44-11.93s-10.13-19-10.13-32.55c0-9.3,1.89-17.54,5.63-24.5A39.71,39.71,0,0,1,254,50.47a47.42,47.42,0,0,1,23.49-5.7,65.39,65.39,0,0,1,11.46.87,84.51,84.51,0,0,1,10,2.48c2.06.57,3.42.93,4.34,1.15l-1,25.91H289.33L285.44,58a6.15,6.15,0,0,0-3.89-4.42,16.13,16.13,0,0,0-6.05-1c-5.85,0-10.47,2.86-13.72,8.5-3.09,5.36-4.59,13.85-4.59,25.95,0,11.42,1.94,20.36,5.76,26.57,4,6.53,9.55,9.84,16.46,9.84A43.81,43.81,0,0,0,300.69,118l2.92,6.38C301.13,126.81,297.33,129.21,292.27,131.55Z"/><path class="navBarLogoSvg" d="M541.29,123l-7.5-1.72c-.49-.36-1.7-1.5-3.88-5-2-3.25-5-8.44-9-15.43-6-10.52-11.12-19.14-15.31-25.62a80.69,80.69,0,0,0-11-14L522.13,30l13.65-2.17a2,2,0,0,0,1.68-2V14.56a2,2,0,0,0-2-2H489a2,2,0,0,0-2,2V26a2,2,0,0,0,1.66,2l9.91,1.72L464.4,73.19V29.91l10.44-2a2,2,0,0,0,1.63-2V14.56a2,2,0,0,0-2-2H422.11a2,2,0,0,0-2,2V26a2,2,0,0,0,1.65,2l10.91,2v91.51L421.83,123a1.54,1.54,0,0,1-3,0l-7.53-1.3L385.63,74.8l16.05-15.31,12.76-2a2,2,0,0,0,1.69-2V45.22a2,2,0,0,0-2-2H369.77a2,2,0,0,0-2,2V55.49a2,2,0,0,0,1.7,2l8.26,1.23L353.5,84.22l.16-2.51V5.42a2,2,0,0,0-.83-1.62L348.11.38A2,2,0,0,0,346.93,0h-.73L313.75,3.93a2,2,0,0,0-1.76,2v10a2,2,0,0,0,1.62,2l9.47,1.81V121.8l-7.29,1.2a2,2,0,0,0-1.68,2v10.76a2,2,0,0,0,2,2H361a2,2,0,0,0,2-2V125a2,2,0,0,0-1.7-2l-7.76-1.2v-8.64l-.29-7.47,10.65-11.05,13.71,27.42-4.77,1a2,2,0,0,0-1.61,2v10.76a2,2,0,0,0,2,2h45.34a2,2,0,0,1,3.58,0h53.82a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.77-1.41V96.36l11-12.67c3.62,5.43,8.55,14.65,14.69,27.5,4.56,9,8,15.6,10.33,19.59,2.76,4.81,5.06,6.95,7.44,6.95h32.94a2,2,0,0,0,2-2V125A2,2,0,0,0,541.29,123ZM416.53,133.73H375.19v-7.12l5.73-1.15a2,2,0,0,0,1.4-2.85L366.17,90.32a2,2,0,0,0-3.23-.5l-13.21,13.7a2,2,0,0,0-.56,1.47l.33,8.24V123.5a2,2,0,0,0,1.69,2l7.77,1.2v7H318.11v-7.06l7.29-1.19a2,2,0,0,0,1.68-2V18a2,2,0,0,0-1.63-2L316,14.21V7.69L346.32,4l3.34,2.42V81.53l-.48,7.93a2,2,0,0,0,1.2,2,2,2,0,0,0,2.24-.45l30.66-32.3a2,2,0,0,0,.44-2,2,2,0,0,0-1.59-1.33l-10.36-1.54V47.22h40.36v6.57l-11.69,1.85a2,2,0,0,0-1.07.53L381.76,73a2,2,0,0,0-.38,2.41l26.91,49.09a2,2,0,0,0,1.42,1l6.82,1.18Z"/><path class="navBarLogoSvg" d="M660.23,12.56H617.82a2,2,0,0,0-2,2V26a2,2,0,0,0,1.68,2l12.35,2V89.09c0,11-1.91,19.66-5.66,25.78-3.61,5.89-9.16,8.75-17,8.75-15.88,0-23.6-11.4-23.6-34.86V30.09l12-2.15a2,2,0,0,0,1.65-2V14.56a2,2,0,0,0-2-2H542.64a2,2,0,0,0-2,2V26a2,2,0,0,0,1.56,2l8.55,1.94V86.48c0,17.88,4.43,31.25,13.16,39.76h0c8.72,8.49,21.92,12.8,39.23,12.8,14.72,0,26.57-4.22,35.23-12.55s13.09-21.42,13.09-38.87V29.88l9.18-1.95a2,2,0,0,0,1.59-2V14.56A2,2,0,0,0,660.23,12.56Z"/></svg>
				<div class="font-sans font-bold text-3xl scale-x-125 cursor-pointer" style="color:var(--header)">X</div>
			</div>
			{#each links as link}
				<div on:click={link.action} class="hover:bg-[#e8000d] hover:text-[#f2f2dd] cursor-pointer flex-grow flex justify-center items-center">{link.display}</div>
			{/each}
		</div>
	{/if}
	<div id="navbar" transition:fade="{{duration: 200}}">
		<div id="navBarLogo">
			<svg class="link" on:click={() => scrollToID("home")} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 662.23 139.69"><defs><style>.navBarLogoSvg{fill:#e8000d;}</style></defs><path class="navBarLogoSvg" d="M126.44,12.56H74.25a2,2,0,0,0-2,2V26a2,2,0,0,0,1.63,2l10.6,2V65.07H43.79V29.8L55.48,28a2,2,0,0,0,1.69-2V14.56a2,2,0,0,0-2-2H2.33a2,2,0,0,0-2,2V26a2,2,0,0,0,1.64,2l10.1,1.83v91.82L1.73,123A2,2,0,0,0,0,125v10.76a2,2,0,0,0,2,2H55.17a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.62-1.41V82.94H84.48v38.51L74,123a2,2,0,0,0-1.71,2v10.76a2,2,0,0,0,2,2h52.19a2,2,0,0,0,2-2V125a2,2,0,0,0-1.73-2l-10.34-1.4V29.77l10.41-1.83a2,2,0,0,0,1.66-2V14.56A2,2,0,0,0,126.44,12.56Zm-2,11.73L114,26.12a2,2,0,0,0-1.65,2v95.25a2,2,0,0,0,1.73,2l10.34,1.4v7H76.25v-7l10.52-1.55a2,2,0,0,0,1.71-2V80.94a2,2,0,0,0-2-2H41.79a2,2,0,0,0-2,2v42.4a2,2,0,0,0,1.76,2l11.62,1.42v7H4v-7l10.34-1.4a2,2,0,0,0,1.73-2V28.09a2,2,0,0,0-1.65-2L4.33,24.3V16.56H53.17v7.71L41.48,26.12a2,2,0,0,0-1.69,2v39a2,2,0,0,0,2,2H86.48a2,2,0,0,0,2-2V28.26a2,2,0,0,0-1.63-2l-10.6-2V16.56h48.19Z"/><path class="navBarLogoSvg" d="M190.2,88.72c-8.87,0-15.62,1.67-20,5A16,16,0,0,0,163.25,107c0,5.34,1.25,9.6,3.7,12.67a12.82,12.82,0,0,0,10.53,4.82,17.45,17.45,0,0,0,7.39-1.9h0a26.41,26.41,0,0,0,6.7-4.51,2,2,0,0,0,.63-1.46V90.72A2,2,0,0,0,190.2,88.72Zm-2,27a23.29,23.29,0,0,1-5,3.25,13.59,13.59,0,0,1-5.67,1.51,8.89,8.89,0,0,1-7.41-3.32c-1.87-2.34-2.82-5.76-2.82-10.17a12.06,12.06,0,0,1,5.31-10.14c3.4-2.53,8.65-3.92,15.64-4.14Z"/><path class="navBarLogoSvg" d="M223.64,123h-6.48V76.53c0-8.5-1.13-15.36-3.36-20.38a22.64,22.64,0,0,0-11.59-11.61c-5.19-2.39-12.36-3.6-21.3-3.6a68.42,68.42,0,0,0-17.72,2.27,73.21,73.21,0,0,0-14.51,5.37,53.64,53.64,0,0,0-8.83,5.36,2,2,0,0,0-.54,2.41l5.54,11.74a2,2,0,0,0,2.63,1,103.66,103.66,0,0,1,12.88-4.88,48.14,48.14,0,0,1,13.7-1.79c4.12,0,7.22.5,9.22,1.5A7.27,7.27,0,0,1,187,68a25,25,0,0,1,1.17,8.58v1.29c-15.22.31-27.78,3-37.33,8-10.4,5.46-15.67,13.47-15.67,23.79a31.18,31.18,0,0,0,3.94,15.93A26.93,26.93,0,0,0,149.88,136a31.37,31.37,0,0,0,14.88,3.58,34,34,0,0,0,16.8-4.09,45.13,45.13,0,0,0,8-5.58c.15,3.61,1,6.08,2.7,7.54s4.81,2.29,9.55,2.29a99.17,99.17,0,0,0,11.66-.83c4.57-.56,8.05-1.1,10.62-1.66a2,2,0,0,0,1.58-2V125A2,2,0,0,0,223.64,123Zm-2,10.64c-2.26.42-5.17.85-8.68,1.28a95.69,95.69,0,0,1-11.18.8c-4.91,0-6.47-.9-6.91-1.3s-1.36-1.77-1.36-5.67V125a2,2,0,0,0-3.54-1.28A36.68,36.68,0,0,1,179.61,132a30.11,30.11,0,0,1-14.85,3.58,27.37,27.37,0,0,1-13-3.11,23,23,0,0,1-9.16-8.87,27.13,27.13,0,0,1-3.4-13.91c0-8.84,4.42-15.47,13.53-20.25,9.39-4.93,22-7.49,37.49-7.6a2,2,0,0,0,2-2V76.53a28.66,28.66,0,0,0-1.43-10,11.3,11.3,0,0,0-5.71-6.21c-2.58-1.29-6.18-1.92-11-1.92a52.21,52.21,0,0,0-14.85,2,102.94,102.94,0,0,0-11.58,4.27l-4-8.5a63.07,63.07,0,0,1,6.89-4,69.12,69.12,0,0,1,13.71-5.07,64.43,64.43,0,0,1,16.69-2.13c8.36,0,15,1.09,19.63,3.24a18.52,18.52,0,0,1,9.61,9.59c2,4.51,3,10.82,3,18.76V125a2,2,0,0,0,2,2h6.48Z"/><path class="navBarLogoSvg" d="M303.41,114.35a2,2,0,0,0-1.23-1.08,2,2,0,0,0-1.63.21,39.82,39.82,0,0,1-21.14,5.9c-5.5,0-9.77-2.59-13.05-7.93-3.43-5.58-5.17-13.81-5.17-24.48,0-11.23,1.36-19.28,4.06-23.95,2.51-4.38,5.87-6.5,10.25-6.5a12.29,12.29,0,0,1,4.54.74,2.14,2.14,0,0,1,1.5,1.61l4.24,18.76a2,2,0,0,0,2,1.55H304.2a2,2,0,0,0,2-1.92l1.14-29.52a2,2,0,0,0-1.72-2.06c-.37,0-1.61-.3-5.55-1.39a86.84,86.84,0,0,0-10.44-2.59,69.52,69.52,0,0,0-12.17-.93A51.33,51.33,0,0,0,252,47a43.58,43.58,0,0,0-17.25,17.68c-4,7.54-6.11,16.42-6.11,26.39,0,14.55,3.72,26.37,11.07,35.12s18.7,13.36,33.5,13.36A48.85,48.85,0,0,0,294,135.18c6.29-2.91,10.71-5.87,13.53-9a2,2,0,0,0,.33-2.17Zm-11.14,17.2a44.93,44.93,0,0,1-19,4c-13.56,0-23.8-4-30.44-11.93s-10.13-19-10.13-32.55c0-9.3,1.89-17.54,5.63-24.5A39.71,39.71,0,0,1,254,50.47a47.42,47.42,0,0,1,23.49-5.7,65.39,65.39,0,0,1,11.46.87,84.51,84.51,0,0,1,10,2.48c2.06.57,3.42.93,4.34,1.15l-1,25.91H289.33L285.44,58a6.15,6.15,0,0,0-3.89-4.42,16.13,16.13,0,0,0-6.05-1c-5.85,0-10.47,2.86-13.72,8.5-3.09,5.36-4.59,13.85-4.59,25.95,0,11.42,1.94,20.36,5.76,26.57,4,6.53,9.55,9.84,16.46,9.84A43.81,43.81,0,0,0,300.69,118l2.92,6.38C301.13,126.81,297.33,129.21,292.27,131.55Z"/><path class="navBarLogoSvg" d="M541.29,123l-7.5-1.72c-.49-.36-1.7-1.5-3.88-5-2-3.25-5-8.44-9-15.43-6-10.52-11.12-19.14-15.31-25.62a80.69,80.69,0,0,0-11-14L522.13,30l13.65-2.17a2,2,0,0,0,1.68-2V14.56a2,2,0,0,0-2-2H489a2,2,0,0,0-2,2V26a2,2,0,0,0,1.66,2l9.91,1.72L464.4,73.19V29.91l10.44-2a2,2,0,0,0,1.63-2V14.56a2,2,0,0,0-2-2H422.11a2,2,0,0,0-2,2V26a2,2,0,0,0,1.65,2l10.91,2v91.51L421.83,123a1.54,1.54,0,0,1-3,0l-7.53-1.3L385.63,74.8l16.05-15.31,12.76-2a2,2,0,0,0,1.69-2V45.22a2,2,0,0,0-2-2H369.77a2,2,0,0,0-2,2V55.49a2,2,0,0,0,1.7,2l8.26,1.23L353.5,84.22l.16-2.51V5.42a2,2,0,0,0-.83-1.62L348.11.38A2,2,0,0,0,346.93,0h-.73L313.75,3.93a2,2,0,0,0-1.76,2v10a2,2,0,0,0,1.62,2l9.47,1.81V121.8l-7.29,1.2a2,2,0,0,0-1.68,2v10.76a2,2,0,0,0,2,2H361a2,2,0,0,0,2-2V125a2,2,0,0,0-1.7-2l-7.76-1.2v-8.64l-.29-7.47,10.65-11.05,13.71,27.42-4.77,1a2,2,0,0,0-1.61,2v10.76a2,2,0,0,0,2,2h45.34a2,2,0,0,1,3.58,0h53.82a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.77-1.41V96.36l11-12.67c3.62,5.43,8.55,14.65,14.69,27.5,4.56,9,8,15.6,10.33,19.59,2.76,4.81,5.06,6.95,7.44,6.95h32.94a2,2,0,0,0,2-2V125A2,2,0,0,0,541.29,123ZM416.53,133.73H375.19v-7.12l5.73-1.15a2,2,0,0,0,1.4-2.85L366.17,90.32a2,2,0,0,0-3.23-.5l-13.21,13.7a2,2,0,0,0-.56,1.47l.33,8.24V123.5a2,2,0,0,0,1.69,2l7.77,1.2v7H318.11v-7.06l7.29-1.19a2,2,0,0,0,1.68-2V18a2,2,0,0,0-1.63-2L316,14.21V7.69L346.32,4l3.34,2.42V81.53l-.48,7.93a2,2,0,0,0,1.2,2,2,2,0,0,0,2.24-.45l30.66-32.3a2,2,0,0,0,.44-2,2,2,0,0,0-1.59-1.33l-10.36-1.54V47.22h40.36v6.57l-11.69,1.85a2,2,0,0,0-1.07.53L381.76,73a2,2,0,0,0-.38,2.41l26.91,49.09a2,2,0,0,0,1.42,1l6.82,1.18Z"/><path class="navBarLogoSvg" d="M660.23,12.56H617.82a2,2,0,0,0-2,2V26a2,2,0,0,0,1.68,2l12.35,2V89.09c0,11-1.91,19.66-5.66,25.78-3.61,5.89-9.16,8.75-17,8.75-15.88,0-23.6-11.4-23.6-34.86V30.09l12-2.15a2,2,0,0,0,1.65-2V14.56a2,2,0,0,0-2-2H542.64a2,2,0,0,0-2,2V26a2,2,0,0,0,1.56,2l8.55,1.94V86.48c0,17.88,4.43,31.25,13.16,39.76h0c8.72,8.49,21.92,12.8,39.23,12.8,14.72,0,26.57-4.22,35.23-12.55s13.09-21.42,13.09-38.87V29.88l9.18-1.95a2,2,0,0,0,1.59-2V14.56A2,2,0,0,0,660.23,12.56Z"/></svg>
		</div>
		{#if !smallScreen}
			<div class="linkCont" transition:fly>
				{#each links as link}
					{#if link.display == "register now!"}
						<div class="link caption" on:click={link.action}>{link.display}</div>
					{:else}
						<div class="link caption" on:click={link.action}>{link.display}</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="linkCont" transition:fly>
				<div class="hamburgerMenu cursor-pointer" on:click={() => hamburgerExpanded = !hamburgerExpanded}>
					<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><defs><style>.hamburgerMenuSvg{fill:none;stroke:#e8000d;stroke-linecap:round;stroke-miterlimit:10;stroke-width:4px;}</style></defs><line class="hamburgerMenuSvg" x1="6.36" y1="9.61" x2="47.33" y2="9.61"/><line class="hamburgerMenuSvg" x1="6.52" y1="27" x2="47.48" y2="27"/><line class="hamburgerMenuSvg" x1="6.67" y1="44.39" x2="47.64" y2="44.39"/></svg>
				</div>
			{/if}
		</div>

	{/if} -->
	<div class="section" id="home">
		<div class="navbar">
			<nav class="left-nav body-text link">
				HACKERDOCS
			</nav>
			<nav style="display:inline-block; flex: 1">
				<ul class="right-nav body-text">
					<li><a class="link" href=#about>ABOUT</a></li>
					<li><a class="link" href=#faq>FAQ</a></li>
					<li><a class="link" href=#sponsors>SPONSORS</a></li>
					<li><a class="link" href=#prizes>PRIZES</a></li>
					<li><a class="link" href=#contact>CONTACT</a></li>
					<li style="color:var(--header)"><a class="link" href="https://forms.gle/KwRNWYcxXyqf3EdZ7" target="_blank">REGISTER NOW!</a></li>
				</ul>
			</nav>
		</div>
		<div style="line-height:250%">
			<p class="title">HackKU23!</p> 
			<br>
			<h2>UNIVERSITY OF KANSAS</h2>
		</div>
		<br>
		<div class="sub-container">
			<div>
				<p class="body-text">HACKATHON</p>
				<br>
				<h2>4.14.2023 - 4.16.2023</h2>
			</div>
			<div>
				<img src="./fishbowl.png" class="fishbowl-image" alt="Fish Bowl">
			</div>
		</div>
	</div>

	<div class="section" id="about">
		<div class="header">
			What is HackKU?
		</div>
		<br>
		<div class="paragraph" id="about" style="width: 45%">
			HackKU is an annual 36-hour hackathon hosted by the University of Kansas, where students can have the opportunity to innovate new ideas, discover different paths, and push the boundaries of technology. Work with teams of up to four people to create unique solutions to real-world problems. Projects can range from web applications and video games to drones and fitness devices.
			<br>
			<br>
			<a href="https://forms.gle/KwRNWYcxXyqf3EdZ7">
				<div id="RegisterButtonCont">
					<RegisterButton>register now</RegisterButton>
				</div>
			</a>
		</div>
	</div>
	<div class="section" id="faq">
		<div class="header">
			FAQ
		</div>
		<br>
		<div class="qanda-container">
			<button class="accordion">What is HackKU?</button>
			<div class="panel">
				<p>The annual 36-hour hackathon hosted by students at the University of Kansas.</p>
			</div>
			<button class="accordion">When is HackKU?</button>
			<div class="panel">
				<p>HackKU will run from 5:00 pm April 8 until 12:00 pm April 10 in the Engineering Complex at the University of Kansas.</p>
			</div>
			<button class="accordion">Who can participate in HackKU?</button>
			<div class="panel">
				<p>HackKU is open to all college and university students, both undergraduate and graduate. Unfortunately, high school students may not participate in HackKU.</p>
			</div>
			<button class="accordion">What is the cost?</button>
			<div class="panel">
				<p>Nothing! It’s free to participate. Meals, drinks, and snacks are provided.</p>
			</div>
			<button class="accordion">Is coding experience required?</button>
			<div class="panel">
				<p>No! All students who want to learn about coding, technology, design, and building new things are welcome. If you’re a beginner, this is the perfect opportunity to learn something new!</p>
			</div>
			<button class="accordion">What should I bring?</button>
			<div class="panel">
				<p>
					<b>Hardware:</b> Bring your hacking device and any accessories it requires.<br>
					<b>Sleeping:</b> Feel free to bring a sleeping bag, pillows, and/or blankets.<br>
					<b>Personal Hygiene:</b> Showers will be provided. Bring a bath towel and personal hygiene products.<br>
					<b>Photo ID:</b> You must bring a photo ID with you to check in, and the name on the ID must match the name entered during registration.<br>
				</p>
			</div>
			<button class="accordion">Are meals provided?</button>
			<div class="panel">
				<p>Yes. You will be able to access food with a badge and ticket given during registration.</p>
			</div>
			<button class="accordion">As an MLH-affiliated event, all participants will be expected to follow the MLH Code of Conduct.<br>What does this mean?</button>
			<div class="panel">
				<a href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf" class="link">Read the MLH Code of Conduct here!</a>
			</div>
			<button class="accordion">I’m stuck. How do I get help?</button>
			<div class="panel">
				<p>There will be a lot of different ways to get help. We will have mentors, both students, and engineers from industry, in the #mentoring channel on Discord</p>
			</div>
			<button class="accordion">What if I need to contact the organizers?</button>
			<div class="panel">
				<p>Message us in the #ask-the-organizers channel! There will always be a couple of organizers online that will be able to answer questions. For urgent event-related problems, please go to LEEP2 1415A, or reach out to any HackKU organizer. </p>
			</div>
		</div>
	</div>
	<div class="section" id="sponsors">
		<div class="header">
			Sponsors
		</div>
		<br>
		<br>
		<br>
		<div>
			<ul style="list-style: none;">
				<li class="subheader">Peta Tier
					<p>Coming soon!</p>
				</li>
				<br>
				<br>
				<br>
				<br>
				<li class="subheader">Tera Tier
					<p>Coming soon!</p>
				</li>
				<br>
				<br>
				<br>
				<br>
				<li class="subheader">Giga Tier
					<p>Coming soon!</p>
				</li>
				<br>
				<br>
				<br>
				<br>
				<li class="subheader">Mega Tier
					<p>Coming soon!</p>
				</li>
				<br>
				<br>
				<br>
				<br>
				<li class="subheader">In-Kind Tier
					<p>Coming soon!</p>
				</li>
			</ul>
		</div>
	</div>
	<div class="section" id="prizes">
		<div class="header">
			Prizes
		</div>
		<br>
		<div class="qanda-container">
			<button class="accordion">General Track Prizes</button>
			<div class="panel">
				<p>Coming soon!</p>
			</div>
			<button class="accordion">Secret Track Prizes</button>
			<div class="panel">
				<p>Coming soon!</p>
			</div>
			<button class="accordion">Blockchain Prize</button>
			<div class="panel">
				<p>Coming soon!</p>
			</div>
			<button class="accordion">Trivia Prize</button>
			<div class="panel">
				<p>Coming soon!</p>
			</div>
			<button class="accordion">Hackers' Choice Prize</button>
			<div class="panel">
				<p>Coming soon!</p>
			</div>
			<button class="accordion">MLH-sponsored prizes</button>
			<div class="panel">
				<p>Coming soon!</p>
			</div>
		</div>
	</div>
	<div class="section" id="contact" style="min-height: 65vh">
		<div class="header">
			Meet the Team
		</div>
		<br>
		<div class="team">
			<div id="zoe">
				<img id="zoe" src="zoe.png" alt="HackKU Director">
			</div>
			<div id="group">
				<img id="group" src="group.png" alt="HackKU Organizers">
			</div>
		</div>
		<br>
		<br>
		<div class="flex flex-col items-center">
			<Heart></Heart>
			<div class="caption inline text-center">
				Made with love by the HackKU team
			</div>
		</div>
	</div>
</main>
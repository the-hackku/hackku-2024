<script>
	import Heart from './components/Heart.svelte'
	import { fade, fly } from 'svelte/transition'
	import NavBarLogo from './components/HackKU.svelte'
	import RegisterButton from './components/RegisterButton.svelte'
	export let name;

	name = "Jerusha"

	let links = [
		{ display: "about", href: "about"},
		{ display: "schedule", href: "schedule"},
		{ display: "faq", href: "faq"},
		{ display: "sponsors", href: "sponsors"},
		{ display: "contact us", href: "contact"},
		{ display: "register now!", href: "Register.svelte"}
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

	$: smallScreen = innerWidth < 550

	let selectedDay = "friday"
	let schedule = {
		friday: [
			{
				time: "5:00",
				event: "Opening Ceremonies",
				location: "Eaton 2"
			},
			{
				time: "5:00",
				event: "Opening Ceremonies",
				location: "Eaton 2"
			},
			{
				time: "5:00",
				event: "Opening Ceremonies",
				location: "Eaton 2"
			},
			{
				time: "5:00",
				event: "Opening Ceremonies",
				location: "Eaton 2"
			}
		],
		saturday: [
			{
				time: "5:00",
				event: "Opening Ceremonies",
				location: "Eaton 2"
			},
			{
				time: "5:00",
				event: "Opening Ceremonies",
				location: "Eaton 2"
			},
			{
				time: "5:00",
				event: "Opening Ceremonies",
				location: "Eaton 2"
			}
		],
		sunday: [
			{
				time: "5:00",
				event: "Closing Ceremonies",
				location: "Eaton 3"
			},
			{
				time: "5:00",
				event: "Closing Ceremonies",
				location: "Eaton 3"
			},
			{
				time: "5:00",
				event: "Closing Ceremonies",
				location: "Eaton 3"
			}
		]
	}

</script>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;400i&display=swap');

	main {
		margin: 0;
		font-family: 'Merriweather', 'serif';
		font-size: 1.5em;
	}

	.section {
		min-height: 100vh;
		background-color: #f2f2dd;
		position: relative;
		padding: 64px;
		overflow: hidden;
	}

	.header {
		font-size: 2em;
		color: #e8000d;
		font-weight: 600;
	}

	.subheader {
		font-size: 1.2em;
		color: #e8000d;
		font-weight: 400;
		text-align: center;
	}

	.paragraph {
		font-size: 1.2em;
		color: #0051ba;
		font-weight: 400;
	}

	.caption {
		font-size: 0.75em;
		color: #e8000d;
		font-weight: 400;
	}

	#MainLogo {
		max-width: 90vw;
		padding: 1em 0;
		width: 900px;
	}

	#Dates {
		color: #e8000d;
		font-size: 2em;
		font-weight: 700;
	}

	#blueChecker {
		background: repeating-conic-gradient(#0051ba 0% 25%, #f2f2dd 0% 50%) 50% / 40px 200px;
		width: 100%;
		height: 20px;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 40;
		animation: backgroundScroll 100s infinite linear;
	}
	#redChecker {
		background: repeating-conic-gradient(#e8000d 0% 25%, #f2f2dd 0% 50%) 50% / 40px 200px;
		width: 100%;
		height: 20px;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 40;
		animation: backgroundScroll 100s infinite linear;
		animation-direction: reverse;
	}

	#main-pattern {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto 40px;
	}
	
	.pattern-image {
			margin: 20px 10px;
	}

	#main-pattern img {
			width: 100%;
			max-width: 150px;
	}

	#navbar {
		position: fixed;
		padding: 10px;
		top: 20px;
		left: 0px;
		right: 0px;
		display: flex;
		justify-content: between;
		background-color: #f2f2dd;
		z-index: 500;
		height: 50px;
	}

	#navBarLogo {
		height: 100%;
		flex-grow: 1;
	}

	#navBarLogo svg {
		height: 100%;
	}

	.linkCont {
		display: flex;
		justify-content: end;
		flex-grow: 1;
	}

	.link {
		cursor: pointer;
		color: #e8000d;
		transition: .2s;
		padding: 10px 20px 0px;
		height: 100%;
		display: flex;
		justify-content: center;
		justify-items: center;
		text-decoration: none;
	}

	.link:hover {
		color: #f2f2dd;
		background-color: #e8000d;
	}

	.hamburgerMenu {
		height: 2em;
	}
	.hamburgerMenu svg{
		height: 100%;
	}

	#home {
		display: flex;
		flex-direction: column;
	}

	#RegisterButtonCont {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		justify-items: end;
	}

	.laptop-mascot {
		width: 60%;
		position: absolute;
		top: 0%;
		left: 45%;
	}

	#scheduleCont {
		display: flex;
		align-items: stretch;
		justify-content: flex-start;
		flex-wrap: wrap;
	}

	#schedule {

	}

	#schedule-tab-bar {
		display: flex;
	}

	#schedule-body {
		border: solid 3px #e8000d;
		border-radius: 0 .5em .5em .5em;
		padding: 2em;
		color: #0051ba;
		display: grid;
		grid-template-columns: 60px 2fr 1fr;
		grid-template-rows: repeat(20, 40px);
		max-width: 95vw;
		width: 750px;
		height: 385px;
	}

	.schedule-tab {
		border: solid 3px #e8000d;
		color: #e8000d;
		border-radius: .5em .5em 0 0 ;
		padding: .5em 2em;
		cursor: pointer;
	}

	#schedule-tab-bar .selected {
		background-color: #e8000d;
		color: #f2f2dd;
	}

	#stickyNote {
		max-width: 200px;
	}
	#stickyNote svg {
		width: 100%
	}

	table, td {
		border: solid 3px #e8000d;
		border-collapse: collapse;
		font-size: 1em;
		color: #0051ba;
		font-weight: 400;
	}

	.housekeeping {
		width: 100%;
		margin-left: 100px;
	}

	.question {
		font-size: 1em;
		color: #0051ba;
		font-weight: 600;
	}

	.answer {
		font-size: 1em;
		color: #e8000d;
		font-weight: 400;
	}

	.qanda {
		display: flex;
		align-items: stretch;
		justify-content: space-around;
		flex-wrap: wrap;
		padding-right: 0;
		padding-left: 0;
	}

	.sponsors {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
	}

	.sponsor-image {
		width: 300px;
	}

	.team-members {
  	display: flex;
		text-align: center;
	}

	.individual-members {
		display: flex;
		flex-wrap: wrap;
	}

	.portraits {
		width: 200px;
	}

	.made-with-love {
		text-align: center;
		justify-content: center;
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

<main>
	<div id="blueChecker" />
	<div id="redChecker" />
	{#if scrollY > innerHeight}
		<div id="navbar" transition:fade="{{duration: 200}}">
			<div id="navBarLogo">
				<svg class="link" on:click={() => scrollToID("home")} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 662.23 139.69"><defs><style>.navBarLogoSvg{fill:#e8000d;}</style></defs><path class="navBarLogoSvg" d="M126.44,12.56H74.25a2,2,0,0,0-2,2V26a2,2,0,0,0,1.63,2l10.6,2V65.07H43.79V29.8L55.48,28a2,2,0,0,0,1.69-2V14.56a2,2,0,0,0-2-2H2.33a2,2,0,0,0-2,2V26a2,2,0,0,0,1.64,2l10.1,1.83v91.82L1.73,123A2,2,0,0,0,0,125v10.76a2,2,0,0,0,2,2H55.17a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.62-1.41V82.94H84.48v38.51L74,123a2,2,0,0,0-1.71,2v10.76a2,2,0,0,0,2,2h52.19a2,2,0,0,0,2-2V125a2,2,0,0,0-1.73-2l-10.34-1.4V29.77l10.41-1.83a2,2,0,0,0,1.66-2V14.56A2,2,0,0,0,126.44,12.56Zm-2,11.73L114,26.12a2,2,0,0,0-1.65,2v95.25a2,2,0,0,0,1.73,2l10.34,1.4v7H76.25v-7l10.52-1.55a2,2,0,0,0,1.71-2V80.94a2,2,0,0,0-2-2H41.79a2,2,0,0,0-2,2v42.4a2,2,0,0,0,1.76,2l11.62,1.42v7H4v-7l10.34-1.4a2,2,0,0,0,1.73-2V28.09a2,2,0,0,0-1.65-2L4.33,24.3V16.56H53.17v7.71L41.48,26.12a2,2,0,0,0-1.69,2v39a2,2,0,0,0,2,2H86.48a2,2,0,0,0,2-2V28.26a2,2,0,0,0-1.63-2l-10.6-2V16.56h48.19Z"/><path class="navBarLogoSvg" d="M190.2,88.72c-8.87,0-15.62,1.67-20,5A16,16,0,0,0,163.25,107c0,5.34,1.25,9.6,3.7,12.67a12.82,12.82,0,0,0,10.53,4.82,17.45,17.45,0,0,0,7.39-1.9h0a26.41,26.41,0,0,0,6.7-4.51,2,2,0,0,0,.63-1.46V90.72A2,2,0,0,0,190.2,88.72Zm-2,27a23.29,23.29,0,0,1-5,3.25,13.59,13.59,0,0,1-5.67,1.51,8.89,8.89,0,0,1-7.41-3.32c-1.87-2.34-2.82-5.76-2.82-10.17a12.06,12.06,0,0,1,5.31-10.14c3.4-2.53,8.65-3.92,15.64-4.14Z"/><path class="navBarLogoSvg" d="M223.64,123h-6.48V76.53c0-8.5-1.13-15.36-3.36-20.38a22.64,22.64,0,0,0-11.59-11.61c-5.19-2.39-12.36-3.6-21.3-3.6a68.42,68.42,0,0,0-17.72,2.27,73.21,73.21,0,0,0-14.51,5.37,53.64,53.64,0,0,0-8.83,5.36,2,2,0,0,0-.54,2.41l5.54,11.74a2,2,0,0,0,2.63,1,103.66,103.66,0,0,1,12.88-4.88,48.14,48.14,0,0,1,13.7-1.79c4.12,0,7.22.5,9.22,1.5A7.27,7.27,0,0,1,187,68a25,25,0,0,1,1.17,8.58v1.29c-15.22.31-27.78,3-37.33,8-10.4,5.46-15.67,13.47-15.67,23.79a31.18,31.18,0,0,0,3.94,15.93A26.93,26.93,0,0,0,149.88,136a31.37,31.37,0,0,0,14.88,3.58,34,34,0,0,0,16.8-4.09,45.13,45.13,0,0,0,8-5.58c.15,3.61,1,6.08,2.7,7.54s4.81,2.29,9.55,2.29a99.17,99.17,0,0,0,11.66-.83c4.57-.56,8.05-1.1,10.62-1.66a2,2,0,0,0,1.58-2V125A2,2,0,0,0,223.64,123Zm-2,10.64c-2.26.42-5.17.85-8.68,1.28a95.69,95.69,0,0,1-11.18.8c-4.91,0-6.47-.9-6.91-1.3s-1.36-1.77-1.36-5.67V125a2,2,0,0,0-3.54-1.28A36.68,36.68,0,0,1,179.61,132a30.11,30.11,0,0,1-14.85,3.58,27.37,27.37,0,0,1-13-3.11,23,23,0,0,1-9.16-8.87,27.13,27.13,0,0,1-3.4-13.91c0-8.84,4.42-15.47,13.53-20.25,9.39-4.93,22-7.49,37.49-7.6a2,2,0,0,0,2-2V76.53a28.66,28.66,0,0,0-1.43-10,11.3,11.3,0,0,0-5.71-6.21c-2.58-1.29-6.18-1.92-11-1.92a52.21,52.21,0,0,0-14.85,2,102.94,102.94,0,0,0-11.58,4.27l-4-8.5a63.07,63.07,0,0,1,6.89-4,69.12,69.12,0,0,1,13.71-5.07,64.43,64.43,0,0,1,16.69-2.13c8.36,0,15,1.09,19.63,3.24a18.52,18.52,0,0,1,9.61,9.59c2,4.51,3,10.82,3,18.76V125a2,2,0,0,0,2,2h6.48Z"/><path class="navBarLogoSvg" d="M303.41,114.35a2,2,0,0,0-1.23-1.08,2,2,0,0,0-1.63.21,39.82,39.82,0,0,1-21.14,5.9c-5.5,0-9.77-2.59-13.05-7.93-3.43-5.58-5.17-13.81-5.17-24.48,0-11.23,1.36-19.28,4.06-23.95,2.51-4.38,5.87-6.5,10.25-6.5a12.29,12.29,0,0,1,4.54.74,2.14,2.14,0,0,1,1.5,1.61l4.24,18.76a2,2,0,0,0,2,1.55H304.2a2,2,0,0,0,2-1.92l1.14-29.52a2,2,0,0,0-1.72-2.06c-.37,0-1.61-.3-5.55-1.39a86.84,86.84,0,0,0-10.44-2.59,69.52,69.52,0,0,0-12.17-.93A51.33,51.33,0,0,0,252,47a43.58,43.58,0,0,0-17.25,17.68c-4,7.54-6.11,16.42-6.11,26.39,0,14.55,3.72,26.37,11.07,35.12s18.7,13.36,33.5,13.36A48.85,48.85,0,0,0,294,135.18c6.29-2.91,10.71-5.87,13.53-9a2,2,0,0,0,.33-2.17Zm-11.14,17.2a44.93,44.93,0,0,1-19,4c-13.56,0-23.8-4-30.44-11.93s-10.13-19-10.13-32.55c0-9.3,1.89-17.54,5.63-24.5A39.71,39.71,0,0,1,254,50.47a47.42,47.42,0,0,1,23.49-5.7,65.39,65.39,0,0,1,11.46.87,84.51,84.51,0,0,1,10,2.48c2.06.57,3.42.93,4.34,1.15l-1,25.91H289.33L285.44,58a6.15,6.15,0,0,0-3.89-4.42,16.13,16.13,0,0,0-6.05-1c-5.85,0-10.47,2.86-13.72,8.5-3.09,5.36-4.59,13.85-4.59,25.95,0,11.42,1.94,20.36,5.76,26.57,4,6.53,9.55,9.84,16.46,9.84A43.81,43.81,0,0,0,300.69,118l2.92,6.38C301.13,126.81,297.33,129.21,292.27,131.55Z"/><path class="navBarLogoSvg" d="M541.29,123l-7.5-1.72c-.49-.36-1.7-1.5-3.88-5-2-3.25-5-8.44-9-15.43-6-10.52-11.12-19.14-15.31-25.62a80.69,80.69,0,0,0-11-14L522.13,30l13.65-2.17a2,2,0,0,0,1.68-2V14.56a2,2,0,0,0-2-2H489a2,2,0,0,0-2,2V26a2,2,0,0,0,1.66,2l9.91,1.72L464.4,73.19V29.91l10.44-2a2,2,0,0,0,1.63-2V14.56a2,2,0,0,0-2-2H422.11a2,2,0,0,0-2,2V26a2,2,0,0,0,1.65,2l10.91,2v91.51L421.83,123a1.54,1.54,0,0,1-3,0l-7.53-1.3L385.63,74.8l16.05-15.31,12.76-2a2,2,0,0,0,1.69-2V45.22a2,2,0,0,0-2-2H369.77a2,2,0,0,0-2,2V55.49a2,2,0,0,0,1.7,2l8.26,1.23L353.5,84.22l.16-2.51V5.42a2,2,0,0,0-.83-1.62L348.11.38A2,2,0,0,0,346.93,0h-.73L313.75,3.93a2,2,0,0,0-1.76,2v10a2,2,0,0,0,1.62,2l9.47,1.81V121.8l-7.29,1.2a2,2,0,0,0-1.68,2v10.76a2,2,0,0,0,2,2H361a2,2,0,0,0,2-2V125a2,2,0,0,0-1.7-2l-7.76-1.2v-8.64l-.29-7.47,10.65-11.05,13.71,27.42-4.77,1a2,2,0,0,0-1.61,2v10.76a2,2,0,0,0,2,2h45.34a2,2,0,0,1,3.58,0h53.82a2,2,0,0,0,2-2V125a2,2,0,0,0-1.76-2l-11.77-1.41V96.36l11-12.67c3.62,5.43,8.55,14.65,14.69,27.5,4.56,9,8,15.6,10.33,19.59,2.76,4.81,5.06,6.95,7.44,6.95h32.94a2,2,0,0,0,2-2V125A2,2,0,0,0,541.29,123ZM416.53,133.73H375.19v-7.12l5.73-1.15a2,2,0,0,0,1.4-2.85L366.17,90.32a2,2,0,0,0-3.23-.5l-13.21,13.7a2,2,0,0,0-.56,1.47l.33,8.24V123.5a2,2,0,0,0,1.69,2l7.77,1.2v7H318.11v-7.06l7.29-1.19a2,2,0,0,0,1.68-2V18a2,2,0,0,0-1.63-2L316,14.21V7.69L346.32,4l3.34,2.42V81.53l-.48,7.93a2,2,0,0,0,1.2,2,2,2,0,0,0,2.24-.45l30.66-32.3a2,2,0,0,0,.44-2,2,2,0,0,0-1.59-1.33l-10.36-1.54V47.22h40.36v6.57l-11.69,1.85a2,2,0,0,0-1.07.53L381.76,73a2,2,0,0,0-.38,2.41l26.91,49.09a2,2,0,0,0,1.42,1l6.82,1.18Z"/><path class="navBarLogoSvg" d="M660.23,12.56H617.82a2,2,0,0,0-2,2V26a2,2,0,0,0,1.68,2l12.35,2V89.09c0,11-1.91,19.66-5.66,25.78-3.61,5.89-9.16,8.75-17,8.75-15.88,0-23.6-11.4-23.6-34.86V30.09l12-2.15a2,2,0,0,0,1.65-2V14.56a2,2,0,0,0-2-2H542.64a2,2,0,0,0-2,2V26a2,2,0,0,0,1.56,2l8.55,1.94V86.48c0,17.88,4.43,31.25,13.16,39.76h0c8.72,8.49,21.92,12.8,39.23,12.8,14.72,0,26.57-4.22,35.23-12.55s13.09-21.42,13.09-38.87V29.88l9.18-1.95a2,2,0,0,0,1.59-2V14.56A2,2,0,0,0,660.23,12.56Z"/></svg>
			</div>
			{#if !smallScreen}
				<div class="linkCont" transition:fly>
					{#each links as link}
						{#if link.display == "register now!"}
							<a href="Register.svelte" style="text-decoration: none">
								<div class="link" style="color: #0051ba" on:click={() => scrollToID(link.href)}>{link.display}</div>
							</a>
						{:else}
							<div class="link" on:click={() => scrollToID(link.href)}>{link.display}</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="linkCont" transition:fly>
					<div class="hamburgerMenu">
						<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><defs><style>.hamburgerMenuSvg{fill:none;stroke:#e8000d;stroke-linecap:round;stroke-miterlimit:10;stroke-width:4px;}</style></defs><line class="hamburgerMenuSvg" x1="6.36" y1="9.61" x2="47.33" y2="9.61"/><line class="hamburgerMenuSvg" x1="6.52" y1="27" x2="47.48" y2="27"/><line class="hamburgerMenuSvg" x1="6.67" y1="44.39" x2="47.64" y2="44.39"/></svg>
					</div>
				</div>
			{/if}
		</div>

	{/if}
	<div class="section" id="home">
		<div id="MainLogo">
			<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 903.59 150.45"><defs><style>.mainLogoSvg{fill:#e8000d;}</style></defs><path class="mainLogoSvg" d="M126.44,23.32H74.25a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.63,2l10.6,2V75.84H43.79V40.57l11.69-1.86a2,2,0,0,0,1.69-2V25.32a2,2,0,0,0-2-2H2.33a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.64,2l10.1,1.82v91.82l-10.34,1.4a2,2,0,0,0-1.73,2V146.5a2,2,0,0,0,2,2H55.17a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.76-2l-11.62-1.42V93.7H84.48v38.51L74,133.75a2,2,0,0,0-1.71,2V146.5a2,2,0,0,0,2,2h52.19a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.73-2l-10.34-1.4V40.54l10.41-1.83a2,2,0,0,0,1.66-2V25.32A2,2,0,0,0,126.44,23.32Zm-2,11.74L114,36.89a2,2,0,0,0-1.65,2V134.1a2,2,0,0,0,1.73,2l10.34,1.4v7H76.25v-7l10.52-1.54a2,2,0,0,0,1.71-2V91.7a2,2,0,0,0-2-2H41.79a2,2,0,0,0-2,2v42.4a2,2,0,0,0,1.76,2l11.62,1.41v7H4v-7l10.34-1.4a2,2,0,0,0,1.73-2V38.86a2,2,0,0,0-1.65-2L4.33,35.07V27.32H53.17V35L41.48,36.88a2,2,0,0,0-1.69,2v39a2,2,0,0,0,2,2H86.48a2,2,0,0,0,2-2V39a2,2,0,0,0-1.63-2l-10.6-2V27.32h48.19Z"/><path class="mainLogoSvg" d="M190.2,99.48c-8.87,0-15.62,1.67-20,5a16,16,0,0,0-6.92,13.34c0,5.34,1.25,9.61,3.7,12.67a12.83,12.83,0,0,0,10.53,4.83,17.32,17.32,0,0,0,7.39-1.91h0a26.65,26.65,0,0,0,6.7-4.5,2,2,0,0,0,.63-1.46V101.48A2,2,0,0,0,190.2,99.48Zm-2,27a22.56,22.56,0,0,1-5,3.25,13.47,13.47,0,0,1-5.67,1.52,8.9,8.9,0,0,1-7.41-3.33c-1.87-2.34-2.82-5.76-2.82-10.17a12.06,12.06,0,0,1,5.31-10.14c3.4-2.53,8.65-3.92,15.64-4.13Z"/><path class="mainLogoSvg" d="M223.64,133.73h-6.48V87.3c0-8.51-1.13-15.36-3.36-20.39a22.62,22.62,0,0,0-11.59-11.6c-5.19-2.4-12.36-3.61-21.3-3.61A68.42,68.42,0,0,0,163.19,54a73.84,73.84,0,0,0-14.51,5.37,53.64,53.64,0,0,0-8.83,5.36,2,2,0,0,0-.54,2.41l5.54,11.74a2,2,0,0,0,2.63,1,103.66,103.66,0,0,1,12.88-4.88,48.14,48.14,0,0,1,13.7-1.79c4.12,0,7.22.5,9.22,1.5A7.33,7.33,0,0,1,187,78.71a25.11,25.11,0,0,1,1.17,8.59v1.28c-15.22.32-27.78,3-37.33,8-10.4,5.46-15.67,13.46-15.67,23.78a31.18,31.18,0,0,0,3.94,15.93,26.93,26.93,0,0,0,10.74,10.38,31.25,31.25,0,0,0,14.88,3.58,33.9,33.9,0,0,0,16.8-4.09,45.13,45.13,0,0,0,8-5.58c.15,3.61,1,6.08,2.7,7.54s4.81,2.29,9.55,2.29a97.05,97.05,0,0,0,11.66-.83c4.57-.56,8.05-1.1,10.62-1.66a2,2,0,0,0,1.58-2V135.73A2,2,0,0,0,223.64,133.73Zm-2,10.64c-2.26.42-5.17.85-8.68,1.28a93.54,93.54,0,0,1-11.18.8c-4.91,0-6.47-.9-6.91-1.29s-1.36-1.78-1.36-5.68v-3.75a2,2,0,0,0-2-2,2,2,0,0,0-1.54.72,36.68,36.68,0,0,1-10.36,8.26,30,30,0,0,1-14.85,3.58,27.26,27.26,0,0,1-13-3.11,23,23,0,0,1-9.16-8.86,27.19,27.19,0,0,1-3.4-13.92c0-8.84,4.42-15.46,13.53-20.24,9.39-4.94,22-7.5,37.49-7.6a2,2,0,0,0,2-2V87.3a28.63,28.63,0,0,0-1.43-10,11.28,11.28,0,0,0-5.71-6.22c-2.58-1.29-6.18-1.92-11-1.92a52.21,52.21,0,0,0-14.85,2,104.93,104.93,0,0,0-11.58,4.27l-4-8.5a63.07,63.07,0,0,1,6.89-4,69.75,69.75,0,0,1,13.71-5.07,64.86,64.86,0,0,1,16.69-2.13c8.36,0,15,1.09,19.63,3.24a18.5,18.5,0,0,1,9.61,9.6c2,4.5,3,10.81,3,18.76v48.43a2,2,0,0,0,2,2h6.48Z"/><path class="mainLogoSvg" d="M303.41,125.12a2,2,0,0,0-2.86-.88,39.83,39.83,0,0,1-21.14,5.91c-5.5,0-9.77-2.6-13.05-7.94-3.43-5.57-5.17-13.81-5.17-24.48,0-11.22,1.36-19.28,4.06-24,2.51-4.38,5.87-6.5,10.25-6.5A12.08,12.08,0,0,1,280,68a2.12,2.12,0,0,1,1.5,1.6l4.24,18.76a2,2,0,0,0,2,1.56H304.2a2,2,0,0,0,2-1.92l1.14-29.52a2,2,0,0,0-1.72-2.06c-.37-.05-1.61-.31-5.55-1.4a88.78,88.78,0,0,0-10.44-2.59,70.59,70.59,0,0,0-12.17-.92A51.23,51.23,0,0,0,252,57.75a43.5,43.5,0,0,0-17.25,17.67c-4,7.55-6.11,16.43-6.11,26.39,0,14.56,3.72,26.37,11.07,35.13s18.7,13.35,33.5,13.35A49,49,0,0,0,294,146c6.29-2.92,10.71-5.88,13.53-9a2,2,0,0,0,.33-2.16Zm-11.14,17.2a45.07,45.07,0,0,1-19,4c-13.56,0-23.8-4-30.44-11.92s-10.13-19-10.13-32.56c0-9.3,1.89-17.54,5.63-24.49A39.67,39.67,0,0,1,254,61.23a47.41,47.41,0,0,1,23.49-5.69,66.47,66.47,0,0,1,11.46.86,82.71,82.71,0,0,1,10,2.49c2.06.57,3.42.92,4.34,1.15l-1,25.91H289.33l-3.89-17.21a6.19,6.19,0,0,0-3.89-4.42,16.13,16.13,0,0,0-6.05-1c-5.85,0-10.47,2.86-13.72,8.5-3.09,5.36-4.59,13.85-4.59,26,0,11.42,1.94,20.36,5.76,26.57,4,6.53,9.55,9.85,16.46,9.85a43.82,43.82,0,0,0,21.28-5.37l2.92,6.39C301.13,137.57,297.33,140,292.27,142.32Z"/><path class="mainLogoSvg" d="M541.29,133.78l-7.5-1.72c-.49-.35-1.7-1.49-3.88-5-2-3.26-5-8.45-9-15.43-6-10.53-11.12-19.15-15.31-25.63a81.08,81.08,0,0,0-11-14l27.59-31.27,13.65-2.17a2,2,0,0,0,1.68-2V25.32a2,2,0,0,0-2-2H489a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.66,2l9.91,1.71L464.4,84V40.68l10.44-2a2,2,0,0,0,1.63-2V25.32a2,2,0,0,0-2-2H422.11a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.65,2l10.91,2v91.52l-10.84,1.54a1.54,1.54,0,0,1-3,0l-7.53-1.3-25.71-46.9,16.05-15.3,12.76-2a2,2,0,0,0,1.69-2V56a2,2,0,0,0-2-2H369.77a2,2,0,0,0-2,2V66.26a2,2,0,0,0,1.7,2l8.26,1.22L353.5,95l.16-2.51V16.19a2,2,0,0,0-.83-1.62l-4.72-3.43a2.1,2.1,0,0,0-1.18-.38h-.49l-.24,0-32.45,3.91a2,2,0,0,0-1.76,2v10a2,2,0,0,0,1.62,2l9.47,1.81V132.57l-7.29,1.19a2,2,0,0,0-1.68,2V146.5a2,2,0,0,0,2,2H361a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.7-2l-7.76-1.21v-8.64l-.29-7.46,10.65-11,13.71,27.42-4.77,1a2,2,0,0,0-1.61,2V146.5a2,2,0,0,0,2,2h45.34a2,2,0,0,1,3.58,0h53.82a2,2,0,0,0,2-2V135.73a2,2,0,0,0-1.76-2l-11.77-1.42v-25.2l11-12.68c3.62,5.43,8.55,14.65,14.69,27.51,4.56,9,8,15.6,10.33,19.58,2.76,4.81,5.06,7,7.44,7h32.94a2,2,0,0,0,2-2V135.73A2,2,0,0,0,541.29,133.78ZM416.53,144.5H375.19v-7.13l5.73-1.14a2.05,2.05,0,0,0,1.41-1.09,2,2,0,0,0,0-1.77l-16.15-32.29a2,2,0,0,0-3.23-.49l-13.21,13.7a2,2,0,0,0-.56,1.46l.33,8.24v10.28a2,2,0,0,0,1.69,2l7.77,1.21v7.05H318.11v-7.07l7.29-1.19a2,2,0,0,0,1.68-2V28.75a2,2,0,0,0-1.63-2L316,25V18.45l30.33-3.66,3.34,2.42V92.29l-.48,7.93a2,2,0,0,0,3.44,1.5l30.66-32.29a2,2,0,0,0-1.15-3.36l-10.36-1.54V58h40.36v6.57L400.44,66.4a2.09,2.09,0,0,0-1.07.53l-17.61,16.8a2,2,0,0,0-.38,2.41l26.91,49.09a2.06,2.06,0,0,0,1.42,1l6.82,1.18Z"/><path class="mainLogoSvg" d="M660.23,23.32H617.82a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.68,2l12.35,2V99.85c0,11-1.91,19.67-5.66,25.79-3.61,5.88-9.16,8.75-17,8.75-15.88,0-23.6-11.41-23.6-34.86V40.86l12-2.15a2,2,0,0,0,1.65-2V25.32a2,2,0,0,0-2-2H542.64a2,2,0,0,0-2,2V36.74a2,2,0,0,0,1.56,1.95l8.55,1.93V97.24c0,17.88,4.43,31.26,13.16,39.76h0c8.72,8.5,21.92,12.8,39.23,12.8,14.72,0,26.57-4.22,35.23-12.54s13.09-21.43,13.09-38.87V40.64l9.18-2a2,2,0,0,0,1.59-1.95V25.32A2,2,0,0,0,660.23,23.32Z"/><path class="mainLogoSvg" d="M756.84,115.34l-11.25-2.28a2,2,0,0,0-2.18,1.06l-6,11.9-36.32,3.36a144.75,144.75,0,0,0,20.82-17A126.51,126.51,0,0,0,743.1,85.44c5.42-9.46,8.17-18.27,8.17-26.2C751.27,48,747.6,38.8,740.36,32S723,21.85,710.13,21.85a55.73,55.73,0,0,0-44.67,21.69,2,2,0,0,0,.13,2.53l8.64,9.62a2,2,0,0,0,1.41.66,1.92,1.92,0,0,0,1.46-.56c2.79-2.67,5.1-4.74,6.88-6.15a27.27,27.27,0,0,1,6.75-3.71,25.53,25.53,0,0,1,9.45-1.65c5.52,0,9.93,1.57,13.5,4.79s5.21,7.77,5.21,14.09c0,7.78-2.44,16.24-7.26,25.14a117.94,117.94,0,0,1-19.32,25.9h0a140.22,140.22,0,0,1-25.17,20.66,2,2,0,0,0-.79,2.42l3.92,9.95a2,2,0,0,0,1.86,1.27H752a2,2,0,0,0,2-1.7l4.4-29.2A2,2,0,0,0,756.84,115.34Z"/><path class="mainLogoSvg" d="M854.7,115.34l-11.26-2.28a2,2,0,0,0-2.18,1.06l-6,11.9-36.31,3.36a144.67,144.67,0,0,0,20.81-17A126.2,126.2,0,0,0,841,85.44c5.42-9.46,8.17-18.27,8.17-26.2,0-11.28-3.67-20.44-10.9-27.22S820.84,21.85,808,21.85a55.73,55.73,0,0,0-44.66,21.69,2,2,0,0,0,.12,2.53l8.64,9.62a2,2,0,0,0,1.42.66,2,2,0,0,0,1.46-.56c2.78-2.67,5.09-4.74,6.87-6.15a27.27,27.27,0,0,1,6.75-3.71A25.53,25.53,0,0,1,798,44.28c5.52,0,9.94,1.57,13.5,4.79s5.22,7.77,5.22,14.09c0,7.78-2.45,16.24-7.26,25.14a118,118,0,0,1-19.33,25.9h0A140.16,140.16,0,0,1,765,134.86a2,2,0,0,0-.79,2.42l3.91,9.95A2,2,0,0,0,770,148.5H849.9a2,2,0,0,0,2-1.7l4.41-29.2A2,2,0,0,0,854.7,115.34Z"/><path class="mainLogoSvg" d="M877.46,106.42h16a2,2,0,0,0,2-1.86l7-102.42a2,2,0,0,0-.53-1.51A2,2,0,0,0,900.45,0H870.28a2,2,0,0,0-2,2.14l7.17,102.42A2,2,0,0,0,877.46,106.42Z"/><path class="mainLogoSvg" d="M899.11,122.18c-3-3.05-7-4.59-12-4.59a19,19,0,0,0-12.81,4.64,15.47,15.47,0,0,0-5.5,12.2,14.29,14.29,0,0,0,4.9,11,15.94,15.94,0,0,0,11,4.35c5.57,0,10.15-1.47,13.61-4.38s5.35-7.13,5.35-12.3A15.14,15.14,0,0,0,899.11,122.18Z"/></svg>		
		</div>
		<div id="Dates">April 8 - 10</div>
		<br>
		<div id="main-pattern" style="margin: 0">
			<div class="pattern-image">
				<img id="mascot-filled" src="mascot-filled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-unfilled" src="mascot-unfilled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-filled" src="mascot-filled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-unfilled" src="mascot-unfilled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-filled" src="mascot-filled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-unfilled" src="mascot-unfilled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-filled" src="mascot-filled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-unfilled" src="mascot-unfilled.png" alt="mascot">
			</div>
			<div class="pattern-image">
				<img id="mascot-filled" src="mascot-filled.png" alt="mascot">
			</div>
		</div>
		<div id="RegisterButtonCont" on:click={() => scrollToID("about")}>
			<RegisterButton>
				learn more
			</RegisterButton>
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
			<a href="Register.svelte">
				<div id="RegisterButtonCont">
					<RegisterButton>register now</RegisterButton>
				</div>
			</a>
		</div>
		<div>
			<img id="laptop-mascot" src="2022-18.png" alt="laptop-mascot" class="laptop-mascot">
		</div>
	</div>
	<div class="section" id="schedule">
		<div class="header">
			Schedule
		</div>
		<br>
		<div id="scheduleCont">
			<div id="schedule">
				<div id="schedule-tab-bar">
					{#each Object.keys(schedule) as day}
						<div class="schedule-tab" class:selected={selectedDay == day} on:click={() => selectedDay = day}>{day}</div>
					{/each}
				</div>
				<div id="schedule-body">
					<i>Time</i>
					<i>Event</i>
					<i>Location</i>
					{#each schedule[selectedDay] as event}
						<div>{event.time}</div>
						<div>{event.event}</div>
						<div>{event.location}</div>
					{/each}
				</div>
			</div>
			<!---<div id="stickyNote">
				<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 396"><defs><style>.stickySVG1{fill:none;stroke:#e8000d;stroke-miterlimit:10;stroke-width:4.21px;}.stickySVG2{fill:#e8000d;}</style></defs><path class="stickySVG1" d="M286,361H53a18,18,0,0,1-18-18V53A18,18,0,0,1,53,35H343a18,18,0,0,1,18,18V286Z"/><path class="stickySVG2" d="M304,286h57l-75,75V304A18,18,0,0,1,304,286Z"/></svg>
			</div>--->
			<div>
				<table class="housekeeping">
					<tr class="header" style="color: #0051ba"><th>Housekeeping</th></tr>
					<tr><td>1/15 registration opens</td></tr>
					<tr><td>2/14 registration closes</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
					<tr><td style="line-height:27px;" colspan=3>&nbsp;</td></tr>
				</table>
			</div>
		</div>
	</div>
	<div class="section" id="faq">
		<div class="header">
			Question & Answers
		</div>
		<div>
			<ul style="list-style: none" class="qanda">
				<li style="width: 35%">
					<p class="question">What is HackKU?</p>
					<p class="answer">The annual 36-hour hackathon hosted by students at the University of Kansas.</p>
				</li>
				<li style="width: 35%">
					<p class="question">When is HackKU?</p>
					<p class="answer">HackKU will run from 5:00 pm April 8 until 12:00 pm April 10 in the Engineering Complex at the University of Kansas.</p>
				</li>
				<li style="width: 35%">
					<p class="question">What is the cost?</p>
					<p class="answer">Nothing! It’s free to participate. Meals, drinks, and snacks are provided.</p>
				</li>
				<li style="width: 35%">
					<p class="question">Is coding experience required?</p>
					<p class="answer">No! All students who want to learn about coding, technology, design, and building new things are welcome. If you’re a beginner, this is the perfect opportunity to learn something new!</p>
				</li>
				<li style="width: 35%">
					<p class="question">What should I bring?</p>
					<p class="answer">
						<b>Hardware:</b> Bring your hacking device and any accessories it requires.<br>
						<b>Sleeping:</b> Feel free to bring a sleeping bag, pillows, and/or blankets.<br>
						<b>Personal Hygiene:</b> Showers will be provided. Bring a bath towel and personal hygiene products.<br>
						<b>Photo ID:</b> You must bring a photo ID with you to check in, and the name on the ID must match the name entered during registration.<br>
					</p>
				</li>
				<li style="width: 35%">
					<p class="question">Are meals provided?</p>
					<p class="answer">Yes. You will be able to access food with a badge and ticket given during registration.</p>
					<br>
					<p class="question">What is the wifi?</p>
					<p class="answer">You will be able to log in to KU GUEST.</p>
				</li>
				<li style="width: 35%">
					<p class="question">I’m stuck. How do I get help?</p>
					<p class="answer">There will be a lot of different ways to get help. We will have mentors, both students, and engineers from industry, in the #mentoring channel on Discord.</p>
				</li>
				<li style="width: 35%">
					<p class="question">What if I need to contact the organizers?</p>
					<p class="answer">TBD</p>
				</li>
			</ul>
		</div>
	</div>
	<div class="section" id="sponsors">
		<div class="header">
			Sponsors
		</div>
		<div>
			<ul style="list-style: none;">
				<li class="subheader">Peta Tier
					<br>
					<div class="sponsors">
						<div class="sponsor-image">
							<img id="sponsor logo" src="bnb-logo.svg" alt="sponsor logo">
						</div>
					</div>
				</li>
				<br>
				<br>
				<li class="subheader">Tera Tier
					<br>
					<div class="sponsors">
						<div class="sponsor-image">
							<img id="sponsor logo" src="bnb-logo.svg" alt="sponsor logo">
						</div>
					</div>
				</li>
				<br>
				<br>
				<li class="subheader">Giga Tier
					<br>
					<div class="sponsors">
						<div class="sponsor-image">
							<img id="sponsor logo" src="bnb-logo.svg" alt="sponsor logo">
						</div>
						<div class="sponsor-image">
							<img id="sponsor logo" src="bnb-logo.svg" alt="sponsor logo">
						</div>
					</div>
				</li>
				<br>
				<br>
				<li class="subheader">Meta Tier
					<br>
					<div class="sponsors">
						<div class="sponsor-image">
							<img id="sponsor logo" src="bnb-logo.svg" alt="sponsor logo">
						</div>
						<div class="sponsor-image">
							<img id="sponsor logo" src="bnb-logo.svg" alt="sponsor logo">
						</div>
						<div class="sponsor-image">
							<img id="sponsor logo" src="bnb-logo.svg" alt="sponsor logo">
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
	<div class="section" id="contact" style="min-height: 65vh">
		<div class="header">
			Meet the Team
		</div>
		<br>
		<br>
		<br>
		<br>
		<div class="team-members">
			<a class="link individual-members" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/firangizganbarli/">
				<img src="2022-15.png" alt="Firangiz Ganbarli" class="portraits"/>
				Firangiz Ganbarli
				<br>
				Chair
			</a>
			<a class="link individual-members" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/jerusha-rowden/">
				<img src="2022-15.png" alt="Jerusha Rowden" class="portraits"/>
				Jerusha Rowden
				<br>
				Chair
			</a>
			<a class="link individual-members" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/skyler-bosch-37393a159/">
				<img src="2022-15.png" alt="Skyler Bosch" class="portraits"/>
				Skyler Bosch
				<br>
				Chair
			</a>
			<a class="link individual-members" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/zoe-kulphongpatana-b9a9151b6/">
				<img src="2022-15.png" alt="Zoe Kulphongpatana" class="portraits"/>
				Zoe Kulphongpatana
				<br>
				Chair
			</a>
		</div>
		<br>
		<br>
		<br>
		<br>
		<div class="made-with-love">
			<Heart></Heart>
			<div class="caption">
				made with love by the HackKU team
			</div>
		</div>
	</div>
</main>
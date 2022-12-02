<script>
	import Heart from './components/Heart.svelte'
	import { fade, fly } from 'svelte/transition'
	import NavBarLogo from './components/HackKU.svelte'
	import RegisterButton from './components/RegisterButton.svelte'
	import MemberButton from './components/MemberButton.svelte'
	import { onMount } from 'svelte';
	import './tw.css'

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
		{ display: "MEET the TEAM", action: () => scrollToID("contact")},
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
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 5rem 3rem;
	}
  
	/* FONTS */
	.title {
		font-family: 'Modak';
		font-size: 14rem;
		font-weight: 400;
		color: var(--header);
		line-height: 10rem;
	}
	h1 {
		font-family: 'Modak';
		font-size: 5.25rem;
		font-weight: 400;
		color: var(--header);
		line-height: 5rem;
	}
	h2 {
		font-family: 'PT Sans';
		font-size: 2.625rem;
		font-weight: 700;
		color: var(--body-text);
	}
	.body-text {
		font-family: 'PT Sans';
		font-size: 2rem;
		font-weight: 400;
		color: var(--body-text);
		line-height: 2.5rem;
	}
	.caption {
		font-family: 'PT Sans';
		font-size: 1.75rem;
		font-weight: 400;
		color: var(--body-text);
	}

	/* SVGS */
	svg {
		height: 100%;
	}

	/* LINKS */
	.linkCont {
		display: flex;
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
		height: 4rem;
		z-index: 1000;
	}
	.hamburgerMenu svg{
		height: 100%;
	}

	/* NAV */
	.navbar {
		display: flex; 
		align-items:center;
		position: fixed;
		top: 2rem;
		left: 8rem;
		right: 8rem;
		z-index: 1000;
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
	.home {
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		flex-direction: column;
		min-height: 90vh;
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
		width: 40rem;
		max-width: 80vw;
		justify-content: space-around;
		gap: 0.75rem;
		margin: auto;
	}

	/* ACCORDIAN */
	.accordion {
		background-color: var(--body-text);
		cursor: pointer;
		padding: .75rem 2rem;
		text-align: left;
		border: none;
		outline: none;
		transition: 0.4s;
		color: var(--background);
	}
	/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
	.accordion:hover {
		background-color: var(--accent1);
	}
	/* Style the accordion panel. Note: hidden by default */
	.panel {
		padding: .75rem 2rem;
		background-color: var(--background);
		display: none;
		overflow: hidden;
		border: 0.1875rem solid var(--body-text);
	}
	.accordion:after {
		content: '\02795'; /* Unicode character for "plus" sign (+) */
		font-size: 1rem;
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

	/* REM SETTINGS */
	html {
    font-size: 8px;
	}
	@media only screen and (min-width: 240px) {
		html {
			font-size: 8px;
		}
	}
	@media only screen and (min-width: 720px) {
		html {
			font-size: 10px;
		}
	}
	/* use this one to differentiate between mobile/desktop (set things to mobile sizings and in this @media block set it to the desktop sizing)*/
	@media only screen and (min-width: 750px) {
		.section {
			padding: 8rem;
		}
		.body-text {
			font-size: 1.625rem;
			line-height: 2.125rem;
		}
		.caption {
			font-size: 1.375rem;
		}
		.home {
			min-height: 108vh;
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
</style>

<svelte:window bind:innerHeight bind:innerWidth bind:scrollY />

<main class="text-base sm:text-xl relative">
	<div class="section home" id="home" style="padding-top:4rem">
		{#if hamburgerExpanded}
			<div on:click={() => hamburgerExpanded = false} transition:fade class="fixed z-20 top-0 left-0 w-screen h-screen flex flex-col p-4 gap-2 justify-between" style="background-color:var(--background)">
				{#each links as link}
					<div on:click={link.action} class="link body-text cursor-pointer flex-grow flex justify-center items-center">{link.display}</div>
				{/each}
			</div>
		{/if}
		{#if !smallScreen}
			<div class="navbar">
				<nav class="left-nav body-text link">
					<!-- make so is embedded html instead of going to external site -->
					<a href="https://hackku.notion.site/HackerDoc-HackKU-2023-d870cdb8e84b425ab67a2eedcb41344c">HACKERDOC</a>
				</nav>
				<nav style="display:inline-block; flex: 1">
					<ul class="right-nav body-text">
						<li><a class="link" href=#about>ABOUT</a></li>
						<li><a class="link" href=#faq>FAQ</a></li>
						<li><a class="link" href=#sponsors>SPONSORS</a></li>
						<li><a class="link" href=#prizes>PRIZES</a></li>
						<li><a class="link" href=#contact>MEET the TEAM</a></li>
						<li style="color:var(--header)"><a class="link" href="https://forms.gle/KwRNWYcxXyqf3EdZ7" target="_blank">REGISTER NOW!</a></li>
					</ul>
				</nav>
			</div>
		{:else}
			<div class="linkCont" transition:fly>
				<div class="hamburgerMenu cursor-pointer" on:click={() => hamburgerExpanded = !hamburgerExpanded}>
					<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><defs><style>.hamburgerMenuSvg{fill:none;stroke:var(--body-text);stroke-linecap:round;stroke-miterlimit:10;stroke-width:4px;}</style></defs><line class="hamburgerMenuSvg" x1="6.36" y1="9.61" x2="47.33" y2="9.61"/><line class="hamburgerMenuSvg" x1="6.52" y1="27" x2="47.48" y2="27"/><line class="hamburgerMenuSvg" x1="6.67" y1="44.39" x2="47.64" y2="44.39"/></svg>
				</div>
			</div>
		{/if}
		<div>
			{#if smallScreen}
				<p class="title">Hack<br>KU23!</p> 
			{:else}
				<p class="title">HackKU23!</p> 
			{/if}
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
		<h1>What is HackKU?</h1>
		<br>
		<div class="body-text" id="about" style="width:40rem;max-width:80%">
			HackKU is an annual 36-hour hackathon hosted by the University of Kansas, where students can have the opportunity to innovate new ideas, discover different paths, and push the boundaries of technology. Work with teams of up to four people to create unique solutions to real-world problems. Projects can range from web applications and video games to drones and fitness devices.
		</div>
	</div>
	<div class="section" id="faq">
		<h1>FAQ</h1>
		<br>
		<div class="qanda-container">
			<button class="accordion body-text">What is HackKU?</button>
			<div class="panel body-text">
				<p>The annual 36-hour hackathon hosted by students at the University of Kansas.</p>
			</div>
			<button class="accordion body-text">When is HackKU?</button>
			<div class="panel body-text">
				<p>HackKU will run from 5:00 pm April 8 until 12:00 pm April 10 in the Engineering Complex at the University of Kansas.</p>
			</div>
			<button class="accordion body-text">Who can participate in HackKU?</button>
			<div class="panel body-text">
				<p>HackKU is open to all college and university students, both undergraduate and graduate. Unfortunately, high school students may not participate in HackKU.</p>
			</div>
			<button class="accordion body-text">What is the cost?</button>
			<div class="panel body-text">
				<p>Nothing! It’s free to participate. Meals, drinks, and snacks are provided.</p>
			</div>
			<button class="accordion body-text">Is coding experience required?</button>
			<div class="panel body-text">
				<p>No! All students who want to learn about coding, technology, design, and building new things are welcome. If you’re a beginner, this is the perfect opportunity to learn something new!</p>
			</div>
			<button class="accordion body-text">What should I bring?</button>
			<div class="panel body-text">
				<p>
					<b>Hardware:</b> Bring your hacking device and any accessories it requires.<br><br>
					<b>Sleeping:</b> Feel free to bring a sleeping bag, pillows, and/or blankets.<br><br>
					<b>Personal Hygiene:</b> Showers will be provided. Bring a bath towel and personal hygiene products.<br><br>
					<b>Photo ID:</b> You must bring a photo ID with you to check in, and the name on the ID must match the name entered during registration.<br>
				</p>
			</div>
			<button class="accordion body-text">Are meals provided?</button>
			<div class="panel body-text">
				<p>Yes. You will be able to access food with a badge and ticket given during registration.</p>
			</div>
			<button class="accordion body-text">As an MLH-affiliated event, all participants will be expected to follow the MLH Code of Conduct. What does this mean?</button>
			<div class="panel body-text">
				<a href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf" class="link">Read the MLH Code of Conduct here!</a>
			</div>
			<button class="accordion body-text">I’m stuck. How do I get help?</button>
			<div class="panel body-text">
				<p>There will be a lot of different ways to get help. We will have mentors, both students, and engineers from industry, in the #mentoring channel on Discord</p>
			</div>
			<button class="accordion body-text">What if I need to contact the organizers?</button>
			<div class="panel body-text">
				<p>Message us in the #ask-the-organizers channel! There will always be a couple of organizers online that will be able to answer questions. For urgent event-related problems, please go to LEEP2 1415A, or reach out to any HackKU organizer. </p>
			</div>
		</div>
	</div>
	<div class="section" id="sponsors">
		<h1>Sponsors</h1>
		<br>
		<h2>Coming soon!</h2>
	</div>
	<div class="section" id="prizes">
		<h1>Prizes</h1>
		<br>
		<h2>Coming soon!</h2>
	</div>
	<div class="section" id="contact" style="min-height: 65vh">
		<h1>Meet the Team</h1>
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
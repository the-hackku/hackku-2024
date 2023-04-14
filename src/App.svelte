<script>
	import Heart from './components/Heart.svelte'
	import { fade, fly } from 'svelte/transition'
	import NavBarLogo from './components/HackKU.svelte'
	import RegisterButton from './components/RegisterButton.svelte'
	import MemberButton from './components/MemberButton.svelte'
	import { onMount } from 'svelte';
	import Footer from './components/Footer.svelte';
	import './tw.css'
    import {notifications} from './components/notifications.js'
	import Toast from './components/Toast.svelte'
  
	let director = {
		"zoe": {
			display: "Zoe Kulphongpatana",
			title: "Director",
			link: "https://www.linkedin.com/in/kulphongpatana/",
		}
	}
	let back = {
		"tej": {
			display: "Tej Gumaste",
			title: "Tech",
			link: "https://www.linkedin.com/in/tej-gumaste/", 
		},
		"mikaela": {
			display: "Mikaela Navarro",
			title: "Food",
			link: "https://www.linkedin.com/in/mikaela-navarro-489b0023a/", 
		},
		"james":{
			display: "James Hurd",
			title: "Vice Director",
			link: "https://jameshurd.net",
		},
		"raj": {
			display: "Raj Kaura",
			title: "Tech",
			link: "https://www.linkedin.com/in/rajkaura/", 
		},
		"firangiz": {
			display: "Firangiz Ganbarli",
			title: "Logistics",
			link: "https://www.linkedin.com/in/firangizganbarli/",
		}
	}
	let middle = {
		"sungin": {
			display: "Sungin Huh",
			title: "Food",
			link: "https://www.linkedin.com/in/sungin-huh-730b97173/", 
		},
		"shayna": {
			display: "Shayna Weinstein",
			title: "Sponsorship",
			link: "https://www.linkedin.com/in/shayna-weinstein/", 
		},
		"raven": {
			display: "Raven Duong",
			title: "Logistics",
			link: "https://www.linkedin.com/in/mai-duong-0128h/", 
		},
		"michelle": {
			display: "Michelle Chen",
			title: "Finance",
			link: "https://www.linkedin.com/in/michelle-chen3", 
		}
	}
	let front = {
		"jerusha": {
			display: "Jerusha Rowden",
			title: "Design",
			link: "https://www.linkedin.com/in/jerusha-rowden/", 
		},
		"ameera": {
			display: "Ameera Alhajri",
			title: "Marketing",
			link: "https://www.linkedin.com/in/ameera-alhajri-740273255", 
		},
		"skyler": {
			display: "Skyler Bosch",
			title: "Sponsorship",
			link: "https://www.linkedin.com/in/skyler-bosch-37393a159/", 
		}
	}
	let links = [
		{ display: "HACKERDOC", action: () => window.open("https://hackku.notion.site/hackku/HackerDoc-HackKU-2023-d870cdb8e84b425ab67a2eedcb41344c", "_blank")},
		{ display: "REGISTER NOW!", action: () => window.open("https://forms.gle/Sck3FsitxKgNQMpP8", "_blank")},
		{ display: "ABOUT", action: () => scrollToID("about")},
		{ display: "FAQ", action: () => scrollToID("faq")},
		{ display: "SPONSORS", action: () => scrollToID("sponsors")},
		{ display: "PRIZES", action: () => scrollToID("prizes")},
		{ display: "MEET the TEAM", action: () => scrollToID("contact")}
	]

	let linksDesktop = [
		{ display: "ABOUT", action: () => scrollToID("about")},
		{ display: "FAQ", action: () => scrollToID("faq")},
		{ display: "SPONSORS", action: () => scrollToID("sponsors")},
		{ display: "PRIZES", action: () => scrollToID("prizes")},
		{ display: "MEET the TEAM", action: () => scrollToID("contact")}
	]
	const scrollToID = (id) => {

		window.scrollTo({
			top: document.getElementById(id).offsetTop,
			behavior: 'smooth'
		});

	}

	let hamburgerExpanded = false
	let innerHeight
	let innerWidth
	let scrollY
	$: smallScreen = innerWidth < 1080
	$: bigScreen = innerWidth > 1080
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

	let loaded = 0
	function popup(desktop) {
		if (loaded == 0 || loaded == 1) {
			loaded = loaded + 1
			if (desktop) {
				notifications.info(' ', 6000)
			}
		}
	}

	let gridheight;
	let prizes = [
        {
          picture: "/polaroid.png",
					prizename: "Polaroid Camera Kit",
					prizecategory:"General Track 1st Place"
        }
      ,
        {
          picture: "/technica.png",
					prizename: "Audio-Technica ATH-M40x",
					prizecategory:"General Track 2nd Place"
        }
      ,
  	  
    	{
      	  picture: "/powerbank.png",
				  prizename:"ANKR Power Bank",
					prizecategory:"General Track 3rd Place"
    	}
  	  ,
  	 
    	{
      	  picture: "/meta-quest.png",
					prizename:"Meta Quest 2",
					prizecategory:"Themed Track 1st Place"
    	}
  	  ,
  	  {
      	  picture: "/lego.png",
					prizename:"Lego Tokyo",
					prizecategory:"Themed Track  2nd Place"
    	}
  	  ,
  	  
    	{
      	  picture: "/pillow.png",
					prizename:"CPU Pillow",
					prizecategory:"Theme Track 3rd Place"
    	}
  	  ,
  	  
    	{
      	  picture: "/roku.png",
					prizename:"Roku Express",
					prizecategory:"Hacker\'s Choice Award"
    	}
  	  ,
  	  
    	{
      	  picture: "/echo.png",
					prizename:"Echo Dot",
					prizecategory:"Best Beginner Project"
    	}
  	,
	  	
    	{
      	  picture: "GoogleBackPack.png",
					prizename:"Google Cloud Backpacks",
					prizecategory:"Best Open Source Contribution"
    	}
		];

	let selectedPrize = prizes[0];

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
		--max-sponsor-image-height:3rem;
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
		font-style: italic;
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
		position: fixed;
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
	.about-image {
		height: 32rem;
		object-fit: cover;
	}
	.register-button {
 		width: 15rem;
  		height: 3rem;
		background-color: var(--header);
		color: var(--background);
		transition: 0.2s;
		margin-bottom: 5rem;
		
	}

	.register-button:hover{
		background-color: var(--accent1);
		width: 20rem;
		padding-left: 4rem;
		padding-right: 4rem;
	}

	.aboutsection{
		display: flex; 
		flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	/* Prizes*/

	.border-prize {
        border-color: #7085C1;
    }

    .prize-selected {
        border: 4px solid #e8000d;
    }

    .prizes-menu {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); /* specify min and max column sizes */
    grid-gap: 0.5rem;
    margin-bottom: 1rem;
  	}

  	.prizes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr)); /* specify min and max column sizes */
		grid-gap: 1rem;
  	}

    .prize-item {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 4px solid #7085C1;
        border-radius: 0.5rem;
        padding: 1rem;
        box-sizing: border-box;
    }

    /* Add styles for the selected prize */
   

	.prize-buttons {
        border: #7085C1;
        border-style: solid;
        border-width: 0 0.25rem 0.25rem 0.25rem;
        padding: 0.75rem 0.75rem 0.75rem 0;
        cursor: pointer;
				text-overflow:"";
				text-align: right;
    }



		.body-text-prize-button {
		font-family: 'PT Sans';
		font-size: 1.5rem;
		font-weight: 400;
		color: var(--body-text);
		line-height: 2rem;
	}

	.body-text-prize-button-small-text{
		font-family: 'PT Sans';
		font-size: 1rem;
		font-weight: 400;
		color: var(--body-text);
		line-height: 1.5rem;
	}

    .selected {
        background-color: var(--body-text);
        color: var(--background);
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
		margin: auto;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}
	.sponsor-image {
		max-width: 25rem;
	}

	.sponsor-tiers{
		display:flex; 
		flex-direction:column;
		align-items:center;
		gap: 4rem;
	}
	.sponsor-image-holders{
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 70vw;
		flex-wrap: wrap;
		gap: 5rem;
	}
	/* TEAM */
	.team {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}
	.row {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 4rem;
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

	body{
		padding: 0px;
	}
	@media only screen and (min-width: 240px) {
		html {
			font-size: 8px;
		}

		.prizes-grid{
			margin-left: 0rem;
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
	<Toast />
	<div class="section home" id="home" style="padding-top:4rem">
		{#if hamburgerExpanded}
			<div on:click={() => hamburgerExpanded = false} transition:fade class="fixed z-20 top-0 left-0 w-screen h-screen flex flex-col p-4 gap-2 justify-between" style="background-color:var(--background)">
				{#each links as link}
					<div on:click={link.action} class="link body-text cursor-pointer flex-grow flex justify-center items-center">{link.display}</div>
				{/each}
			</div>
		{/if}
		{#if bigScreen}
			<div class="navbar" on:load={popup(1)}>
				<nav class="left-nav body-text link">
					<a href="https://hackku.notion.site/HackerDoc-HackKU-2023-d870cdb8e84b425ab67a2eedcb41344c" target="_blank">HACKERDOC</a>
				</nav>
				<nav style="display:inline-block; flex: 1">
					<ul class="right-nav body-text">
						{#each linksDesktop as link}
						<li><a class="link" href="/" onclick="return false;" on:click={link.action}>{link.display}</a></li>
						{/each}
						<li style="color:var(--header)"><a class="link" href="https://forms.gle/Sck3FsitxKgNQMpP8" target="_blank">REGISTER NOW!</a></li>
					</ul>
				</nav>
			</div>
		{:else}
			<div class="linkCont" on:load={popup(0)} transition:fly>
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
        <div class="flex-container aboutsection">
          <div class="left-flex-item" style="margin-left:6rem; margin-top:4rem">
            <div class="body-text" id="about" style="width:42rem;max-width:80%">
              HackKU is an annual 36-hour hackathon hosted by the University of Kansas, where students can have the opportunity to innovate new ideas, discover different paths, and push the boundaries of technology. Work with teams of up to four people to create unique solutions to real-world problems. Projects can range from web applications and video games to drones and fitness devices.
            </div>
            <a href="https://forms.gle/Sck3FsitxKgNQMpP8" target="_blank">
              <button class="register-button" style="margin-top: 2rem; ">REGISTER NOW!</button>
            </a>
          </div>
					
			<div class="right-flex-item">
      	<img src="about.png" class="about-image" alt="about">
			</div>
   	</div>
	 </div> 

	<div class="section" id="faq">
		<h1>FAQ</h1>
		<br>
		<div class="qanda-container">
			<button class="accordion body-text">What is HackKU?</button>
			<div class="panel body-text">
				<p>HackKU is the annual 36-hour hackathon hosted by students at the University of Kansas’ School of Engineering.</p>
			</div>
			<button class="accordion body-text">What is a hackathon?</button>
			<div class="panel body-text">
				<p>A hackathon is a weekend-long competition where students work individually or on teams to develop their programming skills through working on a software/hardware project, attending workshops, and collaborating with peers and mentors. Participants interact with industry sponsors, compete for prizes, and get lots of free food and swag!</p>
			</div>
			<button class="accordion body-text">When is HackKU?</button>
			<div class="panel body-text">
				<p>HackKU 2023 will take place from 5:00 pm April 14 until 12:00 pm April 16 at the University of Kansas’ School of Engineering.</p>
			</div>
			<button class="accordion body-text">Who can participate in HackKU?</button>
			<div class="panel body-text">
				<p>HackKU is open to all college and university students, both undergraduate and graduate. If you are not a college or university student but would still like to be involved, sign up to mentor <a href="https://forms.gle/nWcShP8MnqJVU6yq8" target="_blank" style="text-decoration:underline">here!</a></p>
			</div>
			<button class="accordion body-text">What if I’m a beginner?</button>
			<div class="panel body-text">
				<p>All students who want to learn about programming, technology, hardware, and design are welcome. If you want to build something cool and learn some new skills, this is the perfect opportunity! There will be workshops and prizes geared specifically towards beginner hackers, and lots of mentors to provide support throughout the event.</p>
			</div>
			<button class="accordion body-text">What if I don’t have a team?</button>
			<div class="panel body-text">
				<p>No worries! You can participate individually or on a team of up to four. If you would like to work with a team, there will be a team formation event to find others to hack with. Additionally, there will be a teambuilding channel on Discord to find teammates before the event.</p>
			</div>
			<button class="accordion body-text">What is the cost?</button>
			<div class="panel body-text">
				<p>Nothing! Participation is completely free. All meals, snacks, and drinks will be provided.</p>
			</div>
			<button class="accordion body-text">Will any travel reimbursement be offered?</button>
			<div class="panel body-text">
				<p>Visit <a href="https://forms.gle/q3Rwkb2XD7G7TyxN8" target="_blank" style="text-decoration:underline">this form</a> for more details and to request reimbursement.</p>
			</div>
			<button class="accordion body-text">What should I bring?</button>
			<div class="panel body-text">
				<p>
					<b>Hardware:</b> Bring your hacking device and any accessories (like chargers!) required.<br><br>
					<b>Sleeping:</b> Feel free to bring a sleeping bag, pillows, and/or blankets.<br><br>
					<b>Personal Hygiene:</b> Please bring personal hygiene products, and a bath towel if you choose to use the provided showers.<br><br>
					<b>Photo ID:</b> You must bring a photo ID (ex. student ID, drivers license) to check in. The name on the ID must match the name entered during registration.<br>
				</p>
			</div>
			<button class="accordion body-text">Are meals provided?</button>
			<div class="panel body-text">
				<p>Yes! All meals, snacks, and drinks from Friday dinner through Sunday breakfast will be provided for free. Accomodations will be available for those observing Ramadan during this time.</p>
			</div>
			<button class="accordion body-text">Swag?</button>
			<div class="panel body-text">
				<p>All swag will be distributed at HackKU!</p>
			</div>
			<button class="accordion body-text">What if I want to mentor?</button>
			<div class="panel body-text">
				<p>If you feel skillsets align with those of a great mentor, signup to mentor <a href="https://docs.google.com/forms/d/e/1FAIpQLSdCwlX3sgDvxd_PMw6N7PIJ2PlhmfCl7BzggzoR3D0ExE64jg/viewform" target ="_blank" style="text-decoration:underline">here</a>! If you are currently a university or college student, you are still welcome to mentor, but we encourage you to participate in HackKU 2023 while you still can. </p>
			</div>
			<button class="accordion body-text">As an MLH-affiliated event, all participants will be expected to follow the MLH Code of Conduct. What does this mean?</button>
			<div class="panel body-text">
				<p>Read the MLH Code of Conduct <a href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf" target ="_blank" style="text-decoration:underline">here!</a></p>
			</div>
			<button class="accordion body-text">I’m stuck. How do I get help?</button>
			<div class="panel body-text">
				<p>There will be a lot of different ways to get help. A variety of mentors, from students to alumni to industry engineers, will be available in the #ask-a-mentor channel on Discord. Also, see the HackerDocs’ list of compiled resources <a href="https://hackku.notion.site/HackerDoc-HackKU-2023-d870cdb8e84b425ab67a2eedcb41344c" target ="_blank" style="text-decoration:underline">here!</a></p>
			</div>
			<button class="accordion body-text">What if I need to contact the organizers?</button>
			<div class="panel body-text">
				<p>Join our Discord <a href="https://discord.com/invite/gFqAz46gHv" target="_blank" style="text-decoration:underline">here!</a> Use the #ask-an-organizer channel to message the organizers during HackKU. For questions before the event, you can also email us at info.hackku@gmail.com. </p>
			</div>
		</div>
	</div>
	<div style="background-color: var(--background); height:10rem; padding-left: 7.5rem;" >
		<h1>Sponsors</h1>
		<p class="body-text" style="font-weight:700">Interested in sponsoring HackKU23?</p>
		<p class="body-text" style="font-weight:700">Email us at <a href="mailto:sponsorship.hackku@gmail.com">sponsorship.hackku@gmail.com</a></p>
	</div>
	<div class="section sponsors" id="sponsors" style="row-gap:10rem; align-items:center;">
		<div class="sponsor-tiers">
			<h2>PETA Tier</h2>
			<div class="sponsor-image-holders">
				<img src="security_benefit.png" alt="Security Benefit Logo" style="max-height:6rem; margin-top: 7%">
			</div>
		</div>
		<div class="sponsor-tiers">
			<h2>TERA Tier</h2>
			<div class="sponsor-image-holders">
				<img src="ripple (1).png" alt="Ripple Logo"  style="max-height:6rem; margin-top: 7%">
			</div>
		</div>
		<div class="sponsor-tiers">
			<h2>GIGA Tier</h2>
			<div class="sponsor-image-holders">
				<img src="Air Power Consultants.png" alt="HRBlock Logo" class="sponsor-image" style="max-height:15rem">
				<img src="HRBlock_Logo_250px.png" alt="HRBlock Logo" class="sponsor-image" style="max-height:15rem">
				<img src="VUHL-Logo-V-large 1.png" alt="HRBlock Logo" class="sponsor-image" style="max-height:15rem">
			</div>
		</div>
		<div class="sponsor-tiers">
			<h2>MEGA Tier</h2>
			<div class="sponsor-image-holders">
				<img src="Tradebot Logo-flat-Registered Trademark.png" alt="TradeBot Logo" class="sponsor-image" style="max-height:17rem">
			</div>
		</div>
		<div class="sponsor-tiers">
			<h2>FOOD</h2>
			<div class="sponsor-image-holders">
				<img src="redpepper.png" alt="Red Pepper Logo" class="sponsor-image" style="max-height:17rem">
				<img src="medmarket.png" alt="Mediterannean Market Logo" class="sponsor-image" style="max-height:17rem">
				<img src="chriscakes.png" alt="Chris Cakes Logo" class="sponsor-image" style="max-height:17rem">
				<img src="mcclains.png" alt="Mcclains Logo" class="sponsor-image" style="max-height:17rem">
				<img src="globeindianfood.png" alt="Globe Indian Logo" class="sponsor-image" style="max-height:17rem">
				<img src="laestrella (1).png" alt="Laestralla Logo" class="sponsor-image" style="max-height:17rem">
				<img src="Insomnialogo.png" alt="Laestralla Logo" class="sponsor-image" style="max-height:17rem">
				</div>
		</div>
		<div class="sponsor-tiers">
			<h2>IN KIND</h2>
			<div class="sponsor-image-holders">
				<img src="balsamiq-logo-screen.png" alt="Balsamiq Logo" class="sponsor-image" style="max-height:8rem">
				<img src="echo3D - Logo 2021 - Dark.png" alt="Echo 3D Logo" class="sponsor-image" style="max-height:8rem">
				<img src="GoogleCloud_FullColor 2900x512px.png" alt="Google Cloud Logo" class="sponsor-image" style="max-height:8rem">
				</div>
		</div>
		<div style="display:flex;justify-content:center;align-items:center">
			<a href="http://hackp.ac/mlh-StandOutStickers-hackathons" target="_blank">
				<img src="standoutStickers.png" style="max-width:25vw"alt="standout stickers icon" />
			</a>
		</div>
	</div>

	<div class="section" id="prizes">
		<h1>Prizes</h1>
		<div style="height: 35rem; margin-top: 5rem;">
			<div style="background-color: var(--body-text); color:var(--background); text-align: right; padding: 1rem 5% 1rem 20%;">
				<p style="font-family: PT Sans; font-weight: 700">{selectedPrize.prizename}</p>
			</div>
			<div style="display:flex; height: 34.3rem;">
				<div style="display: inline-grid; flex: 0.45;">
					{#each prizes as prize}
					<div class="prize-buttons body-text-prize-button" class:body-text-prize-button-small-text={smallScreen} on:click={()=>{
							selectedPrize=prize
						}} class:selected={prize==selectedPrize}>{prize.prizecategory}</div>
					{/each}
				</div>
				<div style="flex: 1; border: #7085C1; border-style: solid; border-width: 0 0.25rem 0.25rem 0; height: 100%; align-items:center;">
					<div style="height: 85%; max-width: 100%; padding-top:5%">
						<img src={selectedPrize.picture} alt="Prize" style="height: 100%; width: 100%; object-fit: scale-down;">
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="section" id="contact" style="min-height:65vh; padding-bottom:2rem">
		<h1>Meet the Team</h1>
		<br>
		<div class="team">
			<div id="zoe">
				<img id="zoe" src="zoe.png" alt="HackKU Director" style="height:22rem;object-fit: contain">
				<div class="row">
					{#each Object.entries(director) as [name, data]}
					<MemberButton {name} {data} />
					{/each}
				</div>
			</div>
			<br>
			<div id="group">
				<img id="group" src="group.png" alt="HackKU Organizers" style="max-width:80vw;width:68rem;object-fit: contain">
				<br>
				{#if !smallScreen}
					<div class="row">
						{#each Object.entries(back) as [name, data]}
						<MemberButton {name} {data} />
						{/each}
					</div>
					<br>
					<div class="row">
						{#each Object.entries(middle) as [name, data]}
						<MemberButton {name} {data} />
						{/each}
					</div>
					<br>
					<div class="row">
						{#each Object.entries(front) as [name, data]}
						<MemberButton {name} {data} />
						{/each}
					</div>
				{:else}
					<h2 style="text-align:center">Back Row</h2>
					<br>
					{#each Object.entries(back) as [name, data]}
					<MemberButton {name} {data} />
					{/each}
					<br>
					<br>
					<h2 style="text-align:center">Middle Row</h2>
					<br>
					{#each Object.entries(middle) as [name, data]}
					<MemberButton {name} {data} />
					{/each}
					<br>
					<br>
					<h2 style="text-align:center">Front Row</h2>
					<br>
					{#each Object.entries(front) as [name, data]}
					<MemberButton {name} {data} />
					{/each}
				{/if}
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
		<br>
		<Footer />
	</div>
	<a id="mlh-trust-badge" style="display:block;max-width:100px;min-width:60px;position:fixed;right:20px;top:0;width:10%;z-index:10000" href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2023-season&utm_content=blue" target="_blank"><img src="https://s3.amazonaws.com/logged-assets/trust-badge/2023/mlh-trust-badge-2023-blue.svg" alt="Major League Hacking 2023 Hackathon Season" style="width:100%"></a>
</main>

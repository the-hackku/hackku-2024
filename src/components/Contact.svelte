<script>
	import '../global.css';
	import Organizer from './Organizer.svelte'

  let organizers = {
		"zoe": {
			display: "Zoe Kulphongpatana",
			title: "Director",
			link: "https://www.linkedin.com/in/kulphongpatana/", 
      image: "images/zoe.jpg",
		},
    "james": {
			display: "James Hurd",
			title: "Vice Director",
			link: "https://www.linkedin.com/in/jameshurd2718/", 
      image: "images/james.jpg",
		},
    "firangiz": {
			display: "Firangiz Ganbarli",
			title: "Logistics",
			link: "https://www.linkedin.com/in/firangizg/", 
      image: "images/firangiz.jpg",
		},
    "raven": {
			display: "Raven Duong",
			title: "Logistics",
			link: "https://www.linkedin.com/in/mai-duong-0128h/", 
      image: "images/raven.jpg",
		},
    "shayna": {
			display: "Shayna Weinstein",
			title: "Logistics",
			link: "https://www.linkedin.com/in/shayna-weinstein/", 
      image: "images/shayna.jpg",
		},
    "michelle": {
			display: "Michelle Chen",
			title: "Finance",
			link: "https://www.linkedin.com/in/michelle-chen3/", 
      image: "images/michelle.jpg",
		},
    "kevinh": {
			display: "Kevinh Nguyen",
			title: "Sponsorship",
			link: "https://www.linkedin.com/in/kevinh-nguyen/", 
      image: "images/kevinh.png",
		},
    "nathan": {
			display: "Nathan Dodson",
			title: "Sponsorship",
			link: "https://www.linkedin.com/in/nathanrdodson/", 
      image: "images/nathan.jpeg",
		},
    "sungin": {
			display: "Sungin Huh",
			title: "Food",
			link: "https://www.linkedin.com/in/sunginhuh/", 
      image: "images/sungin.jpg",
		},
    "anh": {
			display: "Anh Hoang",
			title: "Marketing",
			link: "https://www.linkedin.com/in/anh-hoang-54a4b1291/", 
      image: "images/anh.jpg",
		},
	}
</script>

<div>
  <div class="section contact-section" id="contact">
    <div><img src="images/contactDecor.png" class="decor" alt="duck decor" /></div>
    <h2 class="header">Meet the Team</h2>
    <div class="contact-gallery">
      {#each Object.entries(organizers) as [name, data]}
      <Organizer {name} {data} />
      {/each}
    </div>
  </div>
</div>

<style>
  .contact-section {
    background-color: var(--dark-green);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;   
    
    border-top-left-radius: 100% 40rem;
    border-top-right-radius: 100% 40rem;
  }
  .contact-gallery {
    display: flex;
    flex-wrap: wrap; 
    justify-content:center;
    gap: 5rem 5rem;
    max-width: 90vw;
  }
  .header {
    color: var(--off-white);
    margin: 2rem 0 5rem 0;
  }
  .decor {
    display: flex;
    justify-content: center;
    width: 12rem;
  }
</style>
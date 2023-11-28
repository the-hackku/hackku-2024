<script>
	import '../global.css';
	import { onMount } from 'svelte';

  onMount(() => {
		let acc = document.getElementsByClassName("question");
		let i;
		for (i = 0; i < acc.length; i++) {
			acc[i].addEventListener("click", function() {
				this.classList.toggle("active");
				let answer = this.nextElementSibling;
				if (answer.style.display === "block") {
					answer.style.display = "none";
				} else {
					answer.style.display = "block";
				}
			});
		}
	})
</script>

<div>
  <div class="section faq-container" id="faq">
    <h2 style="margin:0">FAQ</h2>
    <div class="faq-section">
      <h3>General</h3>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        What is HackKU?
      </button>
      <div class="answer">
        <p>HackKU is the annual 36-hour hackathon hosted by students at the University of Kansas’ School of Engineering.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        What is a hackathon?
      </button>
      <div class="answer">
        <p>A hackathon is a weekend-long competition where students work individually or on teams to develop their programming skills through working on a software/hardware project, attending workshops, and collaborating with peers and mentors. Participants interact with industry sponsors, compete for prizes, and get lots of free food and swag!</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        What if I’ve never hacked before?
      </button>
      <div class="answer">
        <p>No experience is necessary to attend! There will be workshops and prizes geared specifically towards beginner hackers, and lots of mentors to provide support throughout the event.</p>
      </div>
      <!-- <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        As an MLH-affiliated event, all participants will be expected to follow the MLH Code of Conduct. What does this mean?
      </button>
      <div class="answer">
        <p>Read the MLH Code of Conduct <a href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf" target ="_blank" class="link">here</a>!</p>
      </div> -->
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        I still have questions!
      </button>
      <div class="answer">
        <p>Check out the <a href="https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74" target ="_blank" class="link">HackerDoc</a> or contact us at <a href="mailto: hack@ku.edu" class="link">hack@ku.edu</a> any questions or concerns :)</p>
      </div>      
    </div>
    <div class="faq-section">
      <h3>Logistics</h3>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        When and where is HackKU?
      </button>
      <div class="answer">
        <p>HackKU24 will take place from the evening of April 12 until early afternoon on April 14 at the University of Kansas School of Engineering</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        What will I eat?
      </button>
      <div class="answer">
        <p>All meals, snacks, and drinks from Friday dinner through Sunday breakfast will be provided for free.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        Where will I sleep?
      </button>
      <div class="answer">
        <p>Hackers are free to come and go during the 36-hour hacking period. The University of Kansas' School of Engineering is open 24/7, though we encourage local hackers to head home to freshen up and get some rest.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        What is the cost?
      </button>
      <div class="answer">
        <p>Nothing! Participation is completely free.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        Free swag?
      </button>
      <div class="answer">
        <p>All swag will be distributed at HackKU24.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        What should I bring?
      </button>
      <div class="answer">
        <p><b>Hardware:</b> Bring your hacking device and any accessories (like chargers!) required<br><b>Sleeping:</b> Feel free to bring a sleeping bag, pillow, and/or blankets<br><b>Personal Hygiene:</b> Please bring personal hygiene products, and a bath towel if you choose to use the provided showers</p>
      </div>        
    </div> 
    <div class="faq-section">
      <h3>Registration</h3>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        Who can participate in HackKU?
      </button>
      <div class="answer">
        <p>HackKU24 is open to all high school through college and university students. All high schoolers under the age of 18 must be accompanied by an adult chaperone.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        When is registration open?
      </button>
      <div class="answer">
        <p>Registration will open in January 2024 and close on March 29th.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        What if I don’t have a team yet?
      </button>
      <div class="answer">
        <p>You can participate individually or on a team of up to four. If you would like to work with a team, each team member must register individually. There will be a team formation event to find others to hack with. Additionally, there will be a teambuilding channel on Discord to find teammates before the event.</p>
      </div>
    </div>
    <div class="faq-section">
      <h3>Competition Details</h3>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        What are the general rules?
      </button>
      <div class="answer">
        <p>All code for your project MUST be written by the members of your team during HackKU, between the hours of 8PM on April 12th and 8AM on April 14th.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        What should I build?
      </button>
      <div class="answer">
        <p>Anything! You can submit your project on either the surprise Themed Track or the General Track, and there will be a variety of challenges to attempt as well.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red.png" class="heart-icon" alt="heart-icon"></span>
        What can I win?
      </button>
      <div class="answer">
        <p>Prize information is available on the <a href="https://hackku.notion.site/hackku/HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74" target ="_blank" class="link">HackerDoc</a>.</p>
      </div>
      <button class="question">
        <span><img src="images/heart-red-shad.png" class="heart-icon" alt="heart-icon"></span>
        Do I have to submit a project to attend?
      </button>
      <div class="answer">
        <p>You must submit a project to receive swag, food, and travel reimbursement (if applicable). We encourage everyone to submit their projects even if they are incomplete!</p>
      </div>
    </div>
    <svg class="wave-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--off-white)" fill-opacity="1" d="M0,256L80,229.3C160,203,320,149,480,149.3C640,149,800,203,960,218.7C1120,235,1280,213,1360,202.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
  </div>
</div>

<style>
  .faq-container {
    max-width: 100%;
    padding-top: 0;
    padding-bottom: 29rem;
    background-color: var(--blue-lt);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }
  .faq-section {
    display: flex;
    flex-direction: column;
    width: 60rem;
    max-width: 90vw;
  }
  .wave-bottom {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
  }

  .heart-icon {
    height: 1.5rem;
    object-fit: cover;
    padding-left: 2rem;
    margin-right: 3rem;
  }
  .question {
		cursor: pointer;
		background-color: var(--blue-lt);
		padding: 1rem 1.5rem;
		text-align: left;
		border: none;
	}
	.question:hover {
    font-weight: 700;
	}
	.answer {
		background-color: var(--blue-lt);
		padding: 0 10rem;
		display: none;
		overflow: hidden;
	}
  .link {
    text-decoration: none;
    color: var(--red);
  }
  .link:hover {
    color: var(--red-shad);
  }
</style>
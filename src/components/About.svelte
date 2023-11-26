<script>
	import '../global.css';
  import Heart from './assets/heart-red-shad.svelte';
</script>

<div>
  <div class="section" style="background-color:var(--green)" id="about">
    <div class="about-container">
      <h2 style="z-index:2">What is HackKU?</h2>
      <div class="description-container">
        <p class="description-text">
          HackKU is the annual 36-hour hackathon hosted at the University of Kansas, 
          where students have the opportunity to innovate new ideas, discover different paths, 
          and push the boundaries of technology. Work with teams of up to four people to 
          create unique solutions to real-world problems. No experience necessary!
        </p>
      </div>
      <div class="about-container">
        <h3>Check out previous HackKU events</h3>
        <div class="button-heart-container">
          <div class="heart">
            <Heart />
          </div>
          <div class="button-container">
            <div class="button-container">
              <a href="https://hackku-2020.devpost.com/" target="_blank"><img src="images/20.png" class="previous-button shrink" alt="HackKU20" /></a>
              <a href="https://hackku-2021.devpost.com/" target="_blank"><img src="images/21.png" class="previous-button shrink" alt="HackKU21" /></a>
            </div>
            <div class="button-container">
              <a href="https://hackku-2022.devpost.com/" target="_blank"><img src="images/22.png" class="previous-button shrink" alt="HackKU22" /></a>
              <a href="https://hackku-2023.devpost.com/" target="_blank"><img src="images/23.png" class="previous-button shrink" alt="HackKU23" /></a>
            </div>
          </div>
          <div class="heart">
            <Heart />
          </div>
        </div>
      </div>
    </div>
    <svg class="wave-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--blue-lt)" fill-opacity="1" d="M0,224L80,218.7C160,213,320,203,480,170.7C640,139,800,85,960,90.7C1120,96,1280,160,1360,192L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
  </div>
</div>

<style>
  .about-container {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0rem 6rem 10rem 6rem;
  }
  .description-container {
    background-color: var(--off-white);
    border: 1.5rem solid var(--yellow-shad);
    border-radius: 50%;
    max-width: 80vw;
    margin: 0 0 4rem 0;
    z-index: 2;
  }
  .description-text {
    padding: 5rem 8rem;
    text-align: center;
  }
  .button-heart-container {
    display: flex;
    gap: 3rem;
    justify-content: center;
    align-items: center;
  }
  .button-container {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
    align-items: center;
  }
  .previous-button {
    width: 15rem;
  }
  .heart {
    display: flex;
    align-content: center;
    width: 3rem; 
  }
  .wave-bottom {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
  }
</style>
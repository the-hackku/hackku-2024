<script>
	import '../global.css';
	import Heart from './Heart.svelte'
  import Scallop from './assets/scallop.svelte'
</script>

<footer>
  <div class="footer-container">
    <div class="heart-container">
      <Heart />
      <p class="heart-message">Made with love by the HackKU24 team</p>
    </div>
    <div class="links-container">
      <a href="https://www.instagram.com/thehackku/" target="_blank"><img src="images/instagram.png" class="contact-icon shrink" alt="Instagram icon" /></a>
      <a href="mailto: hack@ku.edu"><img src="images/email.png" class="contact-icon shrink" alt="Email icon" /></a>
      <a href="https://github.com/theHackKU" target="_blank"><img src="images/github.png" class="contact-icon shrink" alt="GitHub icon" /></a>
    </div>
    <Scallop />
  </div> 
</footer>

<style>
  .footer-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    z-index: 1000;
    background-color: var(--dark-green);
  }
  .heart-container {
    display: flex;
    flex-direction: column;
    align-items: center;    
    gap: 0.75rem;
  }
  .heart-message {
    color: var(--off-white);
    margin: 0;
  }
  .links-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2.5rem;
    margin: 1.5rem 0;
  }
  .contact-icon {
    height: 3rem;
  }
</style>

  

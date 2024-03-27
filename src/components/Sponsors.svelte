<script>
	import '../global.css';
</script>

<div>
  <div class="section sponsors-section" id="sponsors">
    <div>
      <duv class="flower-decor-container">
        <span><img src="images/flower-left.png" class="flower-decor" alt="flower-decor"></span>
        <h2 style="margin:0 0">Sponsors</h2>
        <span><img src="images/flower-right.png" class="flower-decor" alt="flower-decor"></span>
      </duv>
      <p style="margin-top:0;text-align:center">Interested in sponsoring HackKU24?<br>Contact us at <a href="mailto:hack@ku.edu" class="email-link turn-red">hack@ku.edu</a></p>
    </div>

    <div class="sponsors-tier">
      <h3>PETA Tier</h3>
      <div class="sponsors-logos">
        <img src="images/SecurityBenefit.png" alt="Security Benefit">
        <img src="images/everly.png" alt="Everly">
      </div>
    </div>

    <div class="sponsors-tier">
      <h3>GIGA Tier</h3>
      <div class="sponsors-logos">
        <img src="images/AirPower.png" alt="Air Power">
        <img src="images/HRBlock.png" alt="HR Block">
        <img src="images/ripple.png" alt="Ripple">
        <img src="images/AdAstra.png" alt="Ad Astra">
      </div>
    </div>

    <div class="sponsors-tier"> 
      <h3>MEGA Tier</h3> 
      <div class="sponsors-logos">
        <img src="images/Netsmart.png" alt="Netsmart">
        <img src="images/BlackVeatch.png" alt="Black & Veatch">
      </div>
    </div>
    
    <div class="sponsors-tier"> 
      <h3>KILA Tier</h3> 
      <div class="sponsors-logos">
        <img src="images/Tradebot.png" alt="Tradebot">
      </div>
    </div>
    
    <div class="sponsors-tier">  
      <h3>In-Kind</h3>
      <div class="sponsors-logos">
        <a href="http://hackp.ac/mlh-StandOutStickers-hackathons" target="_blank"><img src="images/standoutStickers.png" alt="Standout Stickers Logo" class="sponsor-logo"></a>
      </div>
    </div>
  </div>
</div>

<style>
  .sponsors-section {
    max-width: 100%;
    background-color: var(--off-white);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .sponsors-tier {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content:center;
    margin-bottom: 6rem;
  }
  .sponsors-logos {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap; 
    justify-content:center;
    row-gap: 4rem;
    column-gap: 4rem;
  }
  .flower-decor-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
  .flower-decor {
    height: 10rem;
  }
  .email-link {
    color:var(--blue-dk);
    text-decoration:none
  }
  img {
    height: 15vh;
    max-width: 80vw;
    object-fit: contain;
  }
</style>

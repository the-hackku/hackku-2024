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
    <!-- <h3 id="sponsors-divider">Presented by</h3>
    <div class="sponsors-tier">
      <img src="images/20.png" alt="sponsor1">
    </div>
    <h3 id="sponsors-divider">PETA Tier</h3>
    <div class="sponsors-tier">
      <img src="images/20.png" alt="sponsor2">
      <img src="images/20.png" alt="sponsor3">
      <img src="images/20.png" alt="sponsor4">
    </div>
    <h3 id="sponsors-divider">TERA Tier</h3>
    <div class="sponsors-tier" alt="sponsor5"> 
      <img src="images/20.png" alt="sponsor6">
      <img src="images/20.png" alt="sponsor7">
      <img src="images/20.png" alt="sponsor8">
    </div>
    <h3 id="sponsors-divider">GIGA Tier</h3>
    <div class="sponsors-tier" alt="sponsor9">
      <img src="images/20.png" alt="sponsor10">
      <img src="images/20.png" alt="sponsor11">
      <img src="images/20.png" alt="sponsor12">
      <img src="images/20.png" alt="sponsor13">
    </div> -->
    <h3 id="sponsors-divider">MEGA Tier</h3>
    <div class="sponsors-tier">  
      <img src="images/Netsmart.png" alt="Netsmart Logo" class="sponsor-logo">
    </div>
    
    <h3 id="sponsors-divider">KILA Tier</h3>
    <div class="sponsors-tier">  
      <img src="images/Tradebot.png" alt="Tradebot Logo" class="sponsor-logo">
    </div>
    
    <h3 id="sponsors-divider">In-Kind</h3>
    <div class="sponsors-tier">  
      <a href="http://hackp.ac/mlh-StandOutStickers-hackathons" target="_blank"><img src="images/standoutStickers.png" alt="Standout Stickers Logo" class="sponsor-logo"></a>
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
    padding-top: 0;
  }
  /* #sponsors-divider {
    text-align: center;
    margin-top: 100px;
    margin-bottom: 30px;
  } */
  .sponsors-tier {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap; 
    justify-content:center;
    row-gap: 10px;
    column-gap: 10px;
    margin: 20px;
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
  .sponsor-logo {
    height: 20rem;
    max-width: 40vw;
  }
</style>

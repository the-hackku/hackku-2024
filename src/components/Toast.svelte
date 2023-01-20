<script>
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { notifications } from "./notifications.js";
</script>

<div class="notifications fe-pulse">
  {#each $notifications as notification (notification.id)}
      <div
          animate:flip
          class="toast bounce"
          transition:fly={{ y: 30 }}
      >      
          <img src="popup.png" alt="popup" style="height:5rem">
      </div>
  {/each}
</div>

<style>
  .notifications {
    position: fixed;
    top: 6rem;
    left: 2.5rem;
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    flex: 0 0 auto;
    margin-bottom: 10px;
  }

  /* .content {
    padding: 0 2rem 0 2rem;
    display: block;
    font-family: 'PT Sans';
    font-size: 1.25rem;
    font-weight: 700;
    color: #F3F7E1;
    line-height: 2.5rem;
  } */

  @keyframes pulse {
    from { transform: scale(1); }
    50% { transform: scale(0.90); }
    to { transform: scale(1); }
  }

  .fe-pulse {
    animation-name: pulse;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }
</style>

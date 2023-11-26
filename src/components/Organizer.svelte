<script>
	import '../global.css';

	export let name
	export let data
</script>

<style>
	.organizer {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		width: 20rem;
	}
	.image {
    width: 16rem; 
    height: 20rem;
		object-fit: cover;
    border-radius: 50%; 
    border: 0.6rem solid var(--yellow-shad);
  }
	.organizer-text {
		color: var(--off-white);
		margin: 1rem;
	}
</style>

{#if name}
	<div on:click={() => window.open(data.link, "_blank")} class="organizer shrink">
		<img src={data.image} class="image" alt="contact1" id="portrait">
		<h4 class="organizer-text">{data.display}</h4>
		<p class="organizer-text" style="margin:0">{data.title}</p>
	</div>
{/if}
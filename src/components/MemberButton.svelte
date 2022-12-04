<script>
	export let name
	export let data
</script>

<style>
  .name-title {
		text-align: center;
		cursor: pointer;
		transition: .2s;
	}
	.name-title:hover {
		padding: 0 1rem 0 1rem;
		color: var(--background);
		background-color: var(--accent1);
	}
</style>

{#if name}
	<div class="flex flex-col gap-4">
		<div on:click={() => window.open(data.link, "_blank")} class="body-text name-title">
			<div>{data.display}</div>
			<div style="font-size:1.375rem;font-style:italic">{data.title}</div>
		</div>
	</div>
{/if}
<script>
    export let name
    export let data

    const hands = ["peace", "wave"]
</script>

<style>
    .hand {
        transform-origin: 100% 100%;
        transform: rotate(-90deg);
        transition: .3s;
        opacity: 0;
    }
    
    .handCont:hover .hand {
        transform: rotate(0deg);
        opacity: 1;
    }
</style>

{#if name}
<div class="flex flex-col gap-4">
    <div on:click={() => window.open(data.link, "_blank")} class="handCont cursor-pointer relative overflow-hidden w-[250px] h-[250px] border-[#e8000d] border-4 rounded-full">
        <img class="hand absolute w-[60px] left-[10px] top-[90px]" alt="hand" src={`${hands[Math.floor(Math.random() * hands.length)]}.png`} />
        <img alt={name} src={`${name}.png`} />
    </div>
    <div class="text-center red font-bold text-2xl">{data.display}</div>
    <div class="text-center red text-lg">{data.title}</div>
</div>
{/if}
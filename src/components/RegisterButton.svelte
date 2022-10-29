<script>
    export let onClick = () => {}
</script>

<style>
.animated {

}
.skewed {
    transform: skew(-35deg) scaleY(.5)
}
.star {
    transform: rotate(-45deg) translateX(118px) rotate(45deg)  scaleY(2) skew(30deg) ;
    transition: 1111ms;
}

.animated:hover .star {
    transform: rotate(-405deg) translateX(118px) rotate(405deg)  scaleY(2) skew(30deg) ;
}
</style>

<div on:click={onClick} class="cursor-pointer italic w-[240px] h-[100px] flex relative justify-center items-center animated">
    <div class="skewed absolute w-[180px] h-[180px] bg-[#7085C1] py-4 px-8 text-xl rounded-[100%]"></div>
    <div class="skewed absolute w-[240px] h-[240px] border-[4px] border-[#F37A63] rounded-[100%] flex justify-center items-center">
        <div class="w-[30px] h-[30px] star">
            <svg class="h-full" id="fdjhsuiobsdo" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><style>.fduhsiaf{fill:#f3f7e1;}.fjdsoiufhdsi{fill:#F37A63;}</style></defs><circle class="fduhsiaf" cx="16" cy="16" r="6.26"/><path class="fjdsoiufhdsi" d="M30,14A12,12,0,0,1,18,2a2,2,0,0,0-4,0A12,12,0,0,1,2,14a2,2,0,0,0,0,4A12,12,0,0,1,14,30a2,2,0,0,0,4,0A12,12,0,0,1,30,18a2,2,0,0,0,0-4ZM9.74,16A16.1,16.1,0,0,0,16,9.74,16.1,16.1,0,0,0,22.26,16,16.1,16.1,0,0,0,16,22.26,16.1,16.1,0,0,0,9.74,16Z"/></svg>
        </div>
    </div>
    <div class="absolute w-[180px] h-[180px] text-[#F3F7E1] flex justify-center items-center">
        <slot />
    </div>
</div>

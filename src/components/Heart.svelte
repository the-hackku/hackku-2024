<script>
    export let width = 100

    let full = false
</script>

<style>
    svg {
        position: absolute;
        bottom: 0;
    }

    .innerHeartCont {
        height: 0%;
        width: 100%;
        overflow: hidden;
        position: absolute;
        bottom: 0;
        transition: .3s ease-in-out;
    }

    .full {
        height: 100%;
    }
</style>

<div style={`width: ${width}px; height: ${width}px; position: relative; cursor:pointer;`} on:click={() => full = !full}>

    <svg id="Layer_1" style="height: {width}px; width: {width}px;" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47 45">
        <defs>
            <style>
                .cls-1 {
                    fill:#e8000d;
                }
                .innerHeart {
                    mask: rectangle(0, 0, 0%, 0%)
                }
            </style>
        </defs>
        <path class="cls-1" d="M23.48,10.3c.49-.61.92-1.22,1.43-1.76a10.46,10.46,0,0,1,14.2-1.08,10,10,0,0,1,3.58,9,19.43,19.43,0,0,1-3.94,9.62,47.79,47.79,0,0,1-9.22,9.57c-1.68,1.36-3.46,2.59-5.19,3.88a1.25,1.25,0,0,1-1.58,0A57.25,57.25,0,0,1,8.94,27a23.07,23.07,0,0,1-4.2-8.2,11,11,0,0,1,.85-8.55,9.46,9.46,0,0,1,9.14-5,10.41,10.41,0,0,1,8.48,4.7A4.56,4.56,0,0,1,23.48,10.3ZM14.33,7.24A7.79,7.79,0,0,0,6.9,12.35a9.66,9.66,0,0,0-.07,6.24A22.25,22.25,0,0,0,11,26.21,57.16,57.16,0,0,0,23.28,37.43c.24.17.37.06.54-.06A62.82,62.82,0,0,0,32.71,30a32.77,32.77,0,0,0,6.14-8.14,13.69,13.69,0,0,0,1.71-6.94,7.84,7.84,0,0,0-3.47-6.36A8.51,8.51,0,0,0,24.43,13c-.18.56-.47.8-.94.79a.94.94,0,0,1-1-.75A8.66,8.66,0,0,0,14.33,7.24Z"/>
    </svg>
    <div class="innerHeartCont" class:full>
        <svg id="Layer_1" style="height: {width}px; width: {width}px;" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47 45">
            <defs>
                <style>
                    .innerHeart {
                        fill:#e8000d;
                    }
                </style>
            </defs>
            <path class="innerHeart" d="M39.11,7.46a10.46,10.46,0,0,0-14.2,1.08c-.5.54-.94,1.15-1.43,1.76a4.56,4.56,0,0,0-.27-.39,10.41,10.41,0,0,0-8.48-4.7,9.46,9.46,0,0,0-9.14,5,11,11,0,0,0-.85,8.55A23.07,23.07,0,0,0,8.94,27,57.25,57.25,0,0,0,22.76,39.57a1.25,1.25,0,0,0,1.58,0c1.73-1.29,3.51-2.52,5.19-3.88a47.79,47.79,0,0,0,9.22-9.57,19.43,19.43,0,0,0,3.94-9.62A10.06,10.06,0,0,0,39.11,7.46Z"/>
        </svg>
    </div>
</div>

<script>
    export let onClick = null
</script>

<style>
    .cont {
        position: relative;
        width: 250px;
        height: 15px;
        padding: 2em;
        box-sizing: border-box;
        cursor: pointer;
    }

    .backdrop {
        background-color: #0051ba;
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 1;
        border-radius: 100%;
        transform: skewY(-5deg);
        transition: 200ms;
    }

    .cont:hover .backdrop{
        transform: skewY(5deg);
    }

    .text {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        justify-items: center;
        position: absolute;
        z-index: 2;
        color: #f2f2dd;
    }
</style>

<div class="cont">
    <div class="backdrop"></div>
    <br>
    <div class="text">
        <slot></slot>
    </div>
</div>
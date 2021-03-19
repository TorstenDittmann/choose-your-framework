<script lang="ts">
    import { fly } from "svelte/transition";
    const transition = { x: 200, duration: 250 };
</script>

<div class="message" in:fly={transition} out:fly={transition}>
    <slot />
</div>

<style>
    .message {
        width: 12rem;
        height: 3rem;
        margin: 1rem 0;
        padding: .5rem;
        background-color: #f4f4f4;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 1rem;
        filter: drop-shadow(0 0 0.25rem grey);
    }
</style>

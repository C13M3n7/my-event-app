<script>
    export let data;  // Intentionally declared for potential future use
    $: data; // This silences the unused warning
</script>

<main>
    <slot></slot>
</main>

<style>
    /* Only include styles if you have matching elements */
</style>
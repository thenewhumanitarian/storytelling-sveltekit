<script>
  import { onMount } from 'svelte';
  onMount(() => {
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  });
</script>

<blockquote
  class="instagram-media"
  data-instgrm-permalink="https://www.instagram.com/p/POST_ID/"
  data-instgrm-version="14"
></blockquote>
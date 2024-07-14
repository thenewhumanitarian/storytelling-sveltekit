<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	$: blogs = data.blogs;
</script>

<h1>CAR Live Blog</h1>

{#if blogs && blogs.length > 0}
	<ul>
		{#each blogs as blog}
			<li><a href={`/car-blog/`}>{blog.fields.title}</a></li>
		{/each}
	</ul>
{/if}

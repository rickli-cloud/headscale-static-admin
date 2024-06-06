<script>
	import { page } from '$app/stores';
</script>

<main class="container">
	<section>
		<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Critical error</h1>

		<p class="leading-7 [&:not(:first-child)]:mt-6">
			{JSON.stringify($page.error)}
		</p>
	</section>
</main>

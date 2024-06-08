<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	import ApikeyList from '$lib/components/general/ApikeyList.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { endSession } from '$lib/store/session';
	import { base } from '$app/paths';
	import { invalidateAll } from '$app/navigation';

	export let data;

	console.table(data.apiKeys);
</script>

<section class="grid items-center space-y-0" style="grid-template-columns: 1fr 100px;">
	<Card.Header>
		<Card.Title>End Session</Card.Title>
		<Card.Description>Remove current session data</Card.Description>
	</Card.Header>

	<Button
		class="mx-2"
		on:click={() => {
			endSession();
			invalidateAll();
			window.location.href = base + '/login';
		}}>Logout</Button
	>
</section>

<section>
	<ApikeyList keys={data.apiKeys} />
</section>

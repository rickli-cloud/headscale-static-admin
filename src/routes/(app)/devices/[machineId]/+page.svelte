<script lang="ts">
	// import { base } from '$app/paths';

	import DeviceInfo from '$lib/components/devices/DeviceInfo.svelte';
	import PreauthList from '$lib/components/users/PreauthList.svelte';
	import RoutesList from '$lib/components/devices/RoutesList.svelte';

	export let data;

	// const dateKeys: string[] = ['lastSeen', 'lastSuccessfulUpdate', 'expiry', 'createdAt'];
	// const ignoredKeys: string[] = ['name', 'givenName', 'id', 'user', 'preAuthKey'];

	console.debug(data);
</script>

<section>
	<DeviceInfo machine={data.machine} />
</section>

<section>
	<RoutesList routes={data.routes} />
</section>

<section>
	<PreauthList preAuthKeys={data.machine?.preAuthKey ? [data.machine.preAuthKey] : []} />
</section>

<script lang="ts">
	import UsersList from '$lib/components/users/UsersList.svelte';

	export let data;
</script>

<section>
	<UsersList users={data.users} />
</section>

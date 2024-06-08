<script lang="ts">
	import { base } from '$app/paths';
	import { writable } from 'svelte/store';

	import Trash2 from 'lucide-svelte/icons/trash-2';
	import SquarePen from 'lucide-svelte/icons/square-pen';
	import Tag from 'lucide-svelte/icons/tags';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	import ConfirmDelete from '$lib/components/general/ConfirmDelete.svelte';
	import EditName from '$lib/components/general/EditName.svelte';
	import Tags from '$lib/components/general/Tags.svelte';
	import { formatDuration } from '$lib/utils/time';
	import { parseValue } from '$lib/utils/misc';
	import type { V1Machine, V1User } from '$lib/api/api';
	import { Machine } from '$lib/api/utils';
	import { invalidateAll } from '$app/navigation';
	import SelectUser from '../users/SelectUser.svelte';
	import { TimerOff, UserRoundX } from 'lucide-svelte';

	export let machine: V1Machine | undefined;

	const ReassignData = writable<V1User>({});
	const reassignDialogOpen = writable<boolean>(false);

	let editDialogOpen: boolean = false;
	let tagsDialogOpen: boolean = false;
	let expireDialogOpen: boolean = false;
	let deleteDialogOpen: boolean = false;
	let tagsEditor: Tags;
</script>

<Card.Header class="grid items-center space-y-0" style="grid-template-columns: 1fr 262px;">
	<div class="space-y-1.5">
		<Card.Title>Device metadata</Card.Title>
		<Card.Description>The metadata of a headscale device</Card.Description>
	</div>

	<div class="flex gap-1">
		<Dialog.Root bind:open={editDialogOpen}>
			<Dialog.Trigger
				class="{buttonVariants({
					variant: 'ghost'
				})} !h-[50px] !w-[50px]"
			>
				<SquarePen />
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header class="mb-3">
					<Dialog.Title>Edit device</Dialog.Title>
					<Dialog.Description>This action cannot be undone</Dialog.Description>
				</Dialog.Header>

				<EditName
					name={machine?.givenName}
					onSubmit={async (name) => {
						if (machine) await new Machine(machine).edit(name);
						editDialogOpen = false;
						invalidateAll();
					}}
				/>
			</Dialog.Content>
		</Dialog.Root>

		<Dialog.Root bind:open={tagsDialogOpen}>
			<Dialog.Trigger
				class="{buttonVariants({
					variant: 'ghost'
				})} !h-[50px] !w-[50px]"
			>
				<Tag />
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header class="mb-3">
					<Dialog.Title>Device tags</Dialog.Title>
					<Dialog.Description>Used to manage access control</Dialog.Description>
				</Dialog.Header>

				<Tags
					bind:this={tagsEditor}
					tags={machine?.forcedTags || []}
					onSubmit={async (tags) => {
						if (machine) await new Machine(machine).setTags(tags);
						tagsDialogOpen = false;
						invalidateAll();
					}}
					editable
					title
				/>
			</Dialog.Content>
		</Dialog.Root>

		<Dialog.Root bind:open={$reassignDialogOpen}>
			<Dialog.Trigger
				class="{buttonVariants({
					variant: 'ghost'
				})} !h-[50px] !w-[50px]"
			>
				<UserRoundX />
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header class="mb-3">
					<Dialog.Title>Reassign device</Dialog.Title>
					<Dialog.Description>Change which user owns this device</Dialog.Description>
				</Dialog.Header>

				<form
					id="reassign-machine"
					class="grid w-full items-center gap-4"
					on:submit|preventDefault={async () => {
						if ($ReassignData.name && machine) {
							await new Machine(machine).reassign($ReassignData.name);
						}
						ReassignData.set({});
						reassignDialogOpen.set(false);
						invalidateAll();
					}}
				>
					<SelectUser bind:selected={$ReassignData} />
				</form>

				<div class="mt-6 flex justify-between gap-3">
					<p class="star-note self-start text-xs text-muted-foreground">Required</p>
					<div class="flex gap-3">
						<Button variant="outline" on:click={() => ReassignData.set({})}>Reset</Button>
						<Button form="reassign-machine" type="submit">Continue</Button>
					</div>
				</div>
			</Dialog.Content>
		</Dialog.Root>

		<Dialog.Root bind:open={expireDialogOpen}>
			<Dialog.Trigger
				class="{buttonVariants({
					variant: 'ghost'
				})} !h-[50px] !w-[50px]"
				disabled={!machine?.expiry || new Date(machine.expiry).getTime() - Date.now() < 0}
			>
				<TimerOff class="text-red-600" />
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header class="mb-3">
					<Dialog.Title>Expire device session</Dialog.Title>
					<Dialog.Description>
						Expire the session of a device and force it to reauthenticate.
					</Dialog.Description>
				</Dialog.Header>

				<Dialog.Footer>
					<Button variant="outline" on:click={() => (expireDialogOpen = false)}>Cancel</Button>

					<Button
						type="submit"
						variant="destructive"
						on:click={async () => {
							if (machine) await new Machine(machine).expire();
							expireDialogOpen = false;
							invalidateAll();
						}}
					>
						Continue
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<Dialog.Root bind:open={deleteDialogOpen}>
			<Dialog.Trigger
				class="{buttonVariants({
					variant: 'ghost'
				})} !h-[50px] !w-[50px]"
			>
				<Trash2 class="text-red-600" />
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header class="mb-3">
					<Dialog.Title>Delete device</Dialog.Title>
					<Dialog.Description>This action cannot be undone</Dialog.Description>
				</Dialog.Header>

				<ConfirmDelete
					phrase={'devices/' + machine?.givenName || machine?.name || ''}
					onSubmit={async () => {
						if (machine) await new Machine(machine).delete();
						deleteDialogOpen = false;
						window.location.href = base + '/devices';
						invalidateAll();
					}}
				/>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</Card.Header>

<Table.Root>
	<Table.Body>
		<Table.Row>
			<Table.Cell class="font-semibold">Name</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.name)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Given name</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.givenName)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">User</Table.Cell>
			<Table.Cell>
				<a href="{base}/users/{machine?.user?.name}" class="link">
					{parseValue(machine?.user, (user) => user.name)}
					<span class="text-muted-foreground">
						{machine?.user?.id ? '#' + machine?.user.id : ''}
					</span>
				</a>
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Created</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.createdAt, (createdAt) => new Date(createdAt).toLocaleString())}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Session expiry</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.expiry, (expiry) => new Date(expiry).toLocaleString())}
				{#if machine?.expiry && 0 < new Date(machine.expiry).getTime() - Date.now()}
					<span class="text-muted-foreground">
						({formatDuration(new Date(machine.expiry).getTime() - Date.now())})
					</span>
				{:else}
					<span class="text-muted-foreground"> (Expired) </span>
				{/if}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Last seen</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.lastSeen, (lastSeen) => new Date(lastSeen).toLocaleString())}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Last successful update</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.lastSuccessfulUpdate, (lastSuccessfulUpdate) =>
					new Date(lastSuccessfulUpdate).toLocaleString()
				)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">IP addresses</Table.Cell>
			<Table.Cell>
				{#if machine?.ipAddresses}
					<ul>
						{#each machine.ipAddresses as address}
							<li class="mb-0.5">{address}</li>
						{/each}
					</ul>
				{/if}
				<!-- {parseValue(machine.)} -->
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Valid tags</Table.Cell>
			<Table.Cell>
				{#if machine?.validTags}
					<Tags tags={machine.validTags} />
				{/if}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Invalid tags</Table.Cell>
			<Table.Cell>
				{#if machine?.invalidTags}
					<Tags tags={machine.invalidTags} />
				{/if}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Forced tags</Table.Cell>
			<Table.Cell>
				{#if machine?.forcedTags}
					<Tags tags={machine.forcedTags} />
				{/if}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Machine key</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.machineKey)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Node key</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.nodeKey)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Disco key</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.discoKey)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Register method</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.registerMethod)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">Online</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.online)}
			</Table.Cell>
		</Table.Row>

		<Table.Row>
			<Table.Cell class="font-semibold">ID</Table.Cell>
			<Table.Cell>
				{parseValue(machine?.id)}
			</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>

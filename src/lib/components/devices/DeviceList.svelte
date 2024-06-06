<script lang="ts">
	import { writable } from 'svelte/store';
	import { invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';

	import { DotsHorizontal, Plus } from 'svelte-radix';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import ConfirmDelete from '$lib/components/general/ConfirmDelete.svelte';
	import SelectUser from '$lib/components/users/SelectUser.svelte';
	import EditName from '$lib/components/general/EditName.svelte';
	import Tags from '$lib/components/general/Tags.svelte';
	import { formatDuration } from '$lib/utils/time.js';
	import { parseValue } from '$lib/utils/misc';
	import { Session } from '$lib/store/session';
	import { Machine } from '$lib/api/utils';
	import type { V1Machine, V1User } from '$lib/api/api';

	export let machines: V1Machine[] | undefined;

	const formatExpiry = (ms: number) => (ms > 0 ? formatDuration(ms) : undefined);
	const RegisterData = writable<{ user: V1User; key: string }>({ user: {}, key: '' });
	const ReassignData = writable<V1User>({});

	const reassignDialogOpen = writable<boolean>(false);
	let registerDialogOpen: boolean = false;
	let editDialogOpen: boolean = false;
	let tagsDialogOpen: boolean = false;
	let expireDialogOpen: boolean = false;
	let deleteDialogOpen: boolean = false;
	let tagsEditor: Tags;

	reassignDialogOpen.subscribe(() => ReassignData.set({}));
</script>

<Card.Header class="grid items-center space-y-0" style="grid-template-columns: 1fr 50px;">
	<div class="space-y-1.5">
		<Card.Title>Devices</Card.Title>
		<Card.Description>Tailscale clients</Card.Description>
	</div>

	<div>
		<Dialog.Root bind:open={registerDialogOpen}>
			<Dialog.Trigger
				class="{buttonVariants({
					variant: 'ghost'
				})} !h-[50px] !w-[50px]"
			>
				<Plus />
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Register a new device</Dialog.Title>
					<Dialog.Description>There are multiple ways to register a device</Dialog.Description>
				</Dialog.Header>

				<Tabs.Root value="manual">
					<Tabs.List class="mx-auto mb-6 table">
						<Tabs.Trigger value="manual">Manual</Tabs.Trigger>
						<Tabs.Trigger value="preauth">Preauth key</Tabs.Trigger>
						<Tabs.Trigger value="app">App</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="manual">
						<form
							id="register-machine"
							class="grid w-full items-center gap-4"
							on:submit|preventDefault={async () => {
								if ($RegisterData.user?.name) {
									// await Machine.register({ key: $RegisterData.key, user: $RegisterData.user?.name });
									console.log({ key: $RegisterData.key, user: $RegisterData.user?.name });
								}
								registerDialogOpen = false;
								invalidateAll();
							}}
						>
							<SelectUser bind:selected={$RegisterData.user} />

							<div class="flex flex-col space-y-2">
								<Label aria-required for="register-machine-publickey">Device key</Label>
								<Input required id="register-machine-publickey" bind:value={$RegisterData.key} />
							</div>
						</form>

						<div class="mt-6 flex justify-between gap-3">
							<p class="star-note self-start text-xs text-muted-foreground">Required</p>
							<div class="flex gap-3">
								<Button variant="outline" on:click={() => RegisterData.set({ user: {}, key: '' })}
									>Reset</Button
								>
								<Button form="register-machine" type="submit">Continue</Button>
							</div>
						</div>
					</Tabs.Content>

					<Tabs.Content value="preauth" class="space-y-3">
						<p class="leading-7">
							Preauth keys are most often used to connect headless devices that can not follow a
							traditional authentication flow.
						</p>

						<p class="leading-7">
							<span class="font-semibold"> Preauth keys belong to users. </span>
							You can create them on the users page.
						</p>

						<div class="flex items-center justify-end">
							<Button href="{base}/users" variant="link">Go to users</Button>
						</div>
					</Tabs.Content>

					<Tabs.Content value="app" class="space-y-3">
						<p class="leading-7">
							In order to connect a device to headscale using the tailscale client you need to
							change the coordination server setting.
						</p>

						<p class="leading-7 text-muted-foreground">
							This setting is unfortunately very hidden. There is a setup gide for
							<a
								class="text-blue-600"
								href="{$Session?.baseUrl ||
									`${window.location.protocol + '//' + window.location.host}`}/apple"
							>
								Apple
							</a>
							&
							<a
								class="text-blue-600"
								href="{$Session?.baseUrl ||
									window.location.protocol + '//' + window.location.host}/windows"
							>
								Windows
							</a>
							devices on your headscale instance. Headscale has some documentation for
							<a class="text-blue-600" href="https://headscale.net/iOS-client/">iOS</a>,
							<a class="text-blue-600" href="https://headscale.net/android-client/">Android</a> &
							<a class="text-blue-600" href="https://headscale.net/windows-client/">Windows</a>
							clients and more are available on the web.
						</p>
					</Tabs.Content>
				</Tabs.Root>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</Card.Header>

<Table.Root class="linkable">
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[50px]"></Table.Head>
			<Table.Head class="w-[50px]"></Table.Head>
			<Table.Head>Name</Table.Head>
			<Table.Head>User</Table.Head>
			<Table.Head>IP</Table.Head>
			<Table.Head class="hidden md:table-cell">Session expires</Table.Head>
			<Table.Head class="hidden md:table-cell">Created</Table.Head>
			<Table.Head>ID</Table.Head>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#if machines}
			{#each machines as machine, i (i)}
				<Table.Row>
					<Table.Cell class="!p-0">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button builders={[builder]} class=" h-[50px] w-full" variant="ghost">
									<DotsHorizontal />
								</Button>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content side="right">
								<DropdownMenu.Group>
									<DropdownMenu.Label>Actions</DropdownMenu.Label>
									<DropdownMenu.Separator />

									<DropdownMenu.Item
										href="{base}/devices/{encodeURIComponent(machine.id || '')}"
										class="cursor-pointer"
									>
										Show
									</DropdownMenu.Item>

									<Dialog.Root bind:open={editDialogOpen}>
										<Dialog.Trigger
											class="{buttonVariants({
												variant: 'ghost'
											})} !block !h-8 w-full !px-2 !py-1.5 text-left !text-sm"
										>
											Edit
										</Dialog.Trigger>

										<Dialog.Content>
											<Dialog.Header class="mb-3">
												<Dialog.Title>Edit device</Dialog.Title>
												<Dialog.Description>This action cannot be undone</Dialog.Description>
											</Dialog.Header>

											<EditName
												name={machine.givenName}
												onSubmit={async (name) => {
													await new Machine(machine).edit(name);
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
											})} !block !h-8 w-full !px-2 !py-1.5 text-left !text-sm"
										>
											Tags
										</Dialog.Trigger>

										<Dialog.Content>
											<Dialog.Header class="mb-3">
												<Dialog.Title>Device tags</Dialog.Title>
												<Dialog.Description>Used to manage access control</Dialog.Description>
											</Dialog.Header>

											<Tags
												bind:this={tagsEditor}
												tags={machine.forcedTags || []}
												onSubmit={async (tags) => {
													await new Machine(machine).setTags(tags);
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
											})} !block !h-8 w-full !px-2 !py-1.5 text-left !text-sm"
										>
											Reassign
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
													if ($ReassignData.name) {
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
													<Button variant="outline" on:click={() => ReassignData.set({})}>
														Reset
													</Button>
													<Button form="reassign-machine" type="submit">Continue</Button>
												</div>
											</div>
										</Dialog.Content>
									</Dialog.Root>

									<Dialog.Root bind:open={expireDialogOpen}>
										<Dialog.Trigger
											class="{buttonVariants({
												variant: 'ghost'
											})} !block !h-8 w-full !px-2 !py-1.5 text-left !text-sm text-red-600"
											disabled={new Date(machine.expiry || '').getTime() - Date.now() < 0}
										>
											Expire
										</Dialog.Trigger>

										<Dialog.Content>
											<Dialog.Header class="mb-3">
												<Dialog.Title>Expire device session</Dialog.Title>
												<Dialog.Description>
													Expire the session of a device and force it to reauthenticate.
												</Dialog.Description>
											</Dialog.Header>

											<Dialog.Footer>
												<Button variant="outline" on:click={() => (expireDialogOpen = false)}>
													Cancel
												</Button>

												<Button
													type="submit"
													variant="destructive"
													on:click={async () => {
														await new Machine(machine).expire();
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
											})} !block !h-8 w-full !px-2 !py-1.5 text-left !text-sm text-red-600"
										>
											Delete
										</Dialog.Trigger>

										<Dialog.Content>
											<Dialog.Header class="mb-3">
												<Dialog.Title>Delete device</Dialog.Title>
												<Dialog.Description>This action cannot be undone</Dialog.Description>
											</Dialog.Header>

											<ConfirmDelete
												phrase={'devices/' + machine.givenName || machine.name || ''}
												onSubmit={async () => {
													await new Machine(machine).delete();
													deleteDialogOpen = false;
													invalidateAll();
												}}
											/>
										</Dialog.Content>
									</Dialog.Root>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>

					<Table.Cell>
						<Tooltip.Root>
							<Tooltip.Trigger asChild let:builder>
								<Button builders={[builder]} class=" h-[50px] w-full" variant="ghost">
									<div
										class="mx-auto h-3 w-3 rounded-full"
										class:bg-green-600={machine.online}
										class:bg-red-600={!machine.online}
									/>
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>
									Last seen: {machine.lastSeen
										? new Date(machine.lastSeen).toLocaleString()
										: 'unknown'}
								</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Table.Cell>

					<Table.Cell class="whitespace-nowrap font-medium">
						<a href="{base}/devices/{encodeURIComponent(machine.id || '')}">
							{parseValue(machine.givenName)}
							<span class="ml-1 text-muted-foreground">
								{parseValue(machine.name)}
							</span>
						</a>
					</Table.Cell>

					<Table.Cell class="whitespace-nowrap">
						<a href="{base}/devices/{encodeURIComponent(machine.id || '')}">
							<a href="{base}/users/{encodeURIComponent(machine.user?.name || '')}" class="link">
								{parseValue(machine.user?.name)}
								<span class="text-muted-foreground">
									#{parseValue(machine.user?.id)}
								</span>
							</a>
						</a>
					</Table.Cell>

					<Table.Cell>
						<a href="{base}/devices/{encodeURIComponent(machine.id || '')}">
							<ul class="list-disc">
								{#if machine.ipAddresses}
									{#each machine.ipAddresses as address}
										<li>{address}</li>
									{/each}
								{/if}
							</ul>
						</a>
					</Table.Cell>

					<Table.Cell class="hidden md:table-cell">
						<a href="{base}/devices/{encodeURIComponent(machine.id || '')}">
							{parseValue(
								machine.expiry,
								(expiry) =>
									formatExpiry(new Date(expiry).getTime() - Date.now()) ||
									'Expired ' + new Date(expiry).toLocaleString()
							)}
						</a>
					</Table.Cell>

					<Table.Cell class="hidden md:table-cell">
						<a href="{base}/devices/{encodeURIComponent(machine.id || '')}">
							{parseValue(machine.createdAt, (createdAt) => new Date(createdAt).toLocaleString())}
						</a>
					</Table.Cell>

					<Table.Cell>
						<a href="{base}/devices/{encodeURIComponent(machine.id || '')}">
							{parseValue(machine.id)}
						</a>
					</Table.Cell>
				</Table.Row>
			{/each}
		{/if}
	</Table.Body>
</Table.Root>

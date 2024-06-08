<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { get, writable } from 'svelte/store';

	import { DotsHorizontal, Plus } from 'svelte-radix';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	import { formatDuration } from '$lib/utils/time';
	import { parseValue } from '$lib/utils/misc';
	import type { V1ApiKey } from '$lib/api/api';
	import { ApiKey } from '$lib/api/utils';

	export let keys: V1ApiKey[] | undefined;

	const NewKeyExpiration = writable<string | undefined>('');
	const NewKeyResult = writable<string | undefined>('');
	let createDialogOpen: boolean = false;
	let expireDialogOpen: boolean = false;
</script>

<Card.Header class="grid items-center space-y-0" style="grid-template-columns: 1fr 50px;">
	<div class="space-y-1.5">
		<Card.Title>Api keys</Card.Title>
		<Card.Description>All api keys known to headscale</Card.Description>
	</div>

	<div>
		<Dialog.Root bind:open={createDialogOpen}>
			<Dialog.Trigger
				class="{buttonVariants({
					variant: 'ghost'
				})} !h-[50px] !w-[50px]"
			>
				<Plus />
			</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Header class="mb-3">
					<Dialog.Title>Create new api key</Dialog.Title>
					<Dialog.Description>You can always expire this key</Dialog.Description>
				</Dialog.Header>

				{#if $NewKeyResult}
					<div class="font-semibold">New api key:</div>
					<div class="break-all text-lg font-semibold">
						{$NewKeyResult}
					</div>
					<p class="text-sm text-muted-foreground">
						Make sure to save this key somewhere safe. You wont be able to see this again!
					</p>

					<div class="mt-4 flex justify-end gap-3">
						<Button
							on:click={() => {
								NewKeyResult.set(undefined);
								createDialogOpen = false;
								invalidateAll();
							}}
						>
							Continue
						</Button>
					</div>
				{:else}
					<form
						id="createapikey"
						on:submit={async () => {
							const result = await new ApiKey({ expiration: $NewKeyExpiration }).create();
							NewKeyResult.set(result);
						}}
					>
						<div class="flex flex-col space-y-2">
							<Label aria-required for="expiration">Expiration</Label>
							<Input
								required
								id="expiration"
								bind:value={$NewKeyExpiration}
								type="datetime-local"
							/>
						</div>
					</form>

					<div class="mt-4 flex justify-between gap-3">
						<p class="star-note self-start text-xs text-muted-foreground">Required</p>
						<div class="flex gap-3">
							<Button
								form="createapikey"
								type="reset"
								variant="outline"
								on:click={() => (createDialogOpen = false)}
							>
								Cancel
							</Button>
							<Button form="createapikey" type="submit">Continue</Button>
						</div>
					</div>
				{/if}
			</Dialog.Content>
		</Dialog.Root>
	</div>
</Card.Header>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[50px]"></Table.Head>
			<Table.Head>Prefix</Table.Head>
			<Table.Head>Created</Table.Head>
			<Table.Head>Expiration</Table.Head>
			<Table.Head>Last seen</Table.Head>
			<Table.Head class="w-[100px]">ID</Table.Head>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#if keys}
			{#each keys as key, i (i)}
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

									<Dialog.Root bind:open={expireDialogOpen}>
										<Dialog.Trigger
											class="{buttonVariants({
												variant: 'ghost'
											})} !block !h-8 w-full !px-2 !py-1.5 text-left !text-sm text-red-600"
											disabled={new Date(key.expiration || '').getTime() - Date.now() < 0}
										>
											Expire
										</Dialog.Trigger>

										<Dialog.Content>
											<Dialog.Header class="mb-3">
												<Dialog.Title>Expire api key</Dialog.Title>
												<Dialog.Description>This will make the key unusable</Dialog.Description>
											</Dialog.Header>

											<Dialog.Footer>
												<Button variant="outline" on:click={() => (expireDialogOpen = false)}>
													Cancel
												</Button>

												<Button
													type="submit"
													variant="destructive"
													on:click={async () => {
														await new ApiKey(key).expire();
														expireDialogOpen = false;
														invalidateAll();
													}}
												>
													Continue
												</Button>
											</Dialog.Footer>
										</Dialog.Content>
									</Dialog.Root>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Table.Cell>

					<Table.Cell class="font-medium">
						{parseValue(key.prefix)}
					</Table.Cell>

					<Table.Cell>
						{parseValue(key.createdAt, (createdAt) => new Date(createdAt).toLocaleString())}
					</Table.Cell>

					<Table.Cell>
						{parseValue(key.expiration, (expiration) =>
							new Date(expiration).getTime() - Date.now() > 0
								? formatDuration(new Date(expiration).getTime() - Date.now())
								: new Date(expiration).toLocaleString()
						)}
					</Table.Cell>

					<Table.Cell>
						{parseValue(key.lastSeen, (createdAt) => new Date(createdAt).toLocaleString())}
					</Table.Cell>

					<Table.Cell>
						{parseValue(key.id)}
					</Table.Cell>
				</Table.Row>
			{/each}
		{/if}
	</Table.Body>
</Table.Root>

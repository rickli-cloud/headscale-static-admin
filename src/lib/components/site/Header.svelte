<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import HeadscaleLogo from './HeadscaleLogo.svelte';

	export let position: 'sticky' | 'fixed' = 'sticky';
	export let disableContainer: boolean = false;
	export let disableNav: boolean = false;
</script>

<header
	class="top-0 z-40 h-12 w-full border-b border-border/40 bg-background/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/60"
	class:sticky={position === 'sticky'}
	class:fixed={position === 'fixed'}
>
	<div
		class="flex h-full max-w-screen-2xl items-center gap-8"
		class:container={!disableContainer}
		class:max-w-screen-2xl={!disableContainer}
		class:px-8={disableContainer}
	>
		<nav class="site">
			<a
				href={base}
				class="font-extrabold"
				class:!text-foreground={/^(#\/)?$/i.test(document.location.hash)}
			>
				<HeadscaleLogo />
			</a>

			{#if !disableNav}
				<slot name="nav">
					<a
						href={base + '/users'}
						class:!text-foreground={new RegExp('^' + base + '/users', 'i').test($page.url.pathname)}
					>
						Users
					</a>
					<a
						href={base + '/devices'}
						class:!text-foreground={new RegExp('^' + base + '/devices', 'i').test(
							$page.url.pathname
						)}
					>
						Devices
					</a>
				</slot>
			{/if}
		</nav>

		<slot />
	</div>
</header>

<style scoped lang="postcss">
	nav.site {
		@apply flex flex-nowrap items-center gap-6 text-sm;

		& > a {
			@apply text-foreground/60 transition-colors;
		}
		& > a:hover {
			@apply text-foreground/80;
		}
	}
</style>

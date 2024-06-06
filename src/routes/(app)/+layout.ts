import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { base } from '$app/paths';

import { Session, loadSession } from '$lib/store/session.js';

export async function load({}) {
	await loadSession();
	const session = get(Session);
	if (!session?.token) redirect(302, base + '/login');
}

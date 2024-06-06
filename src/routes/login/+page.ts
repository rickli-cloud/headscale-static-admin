import { base } from '$app/paths';
import { Session } from '$lib/store/session.js';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load({}) {
	const session = get(Session);
	if (session?.token) return redirect(302, base);
}

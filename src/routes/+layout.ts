import { loadSession } from '$lib/store/session.js';

export const prerender = false;
export const ssr = false;

export async function load({}) {
	loadSession();
}

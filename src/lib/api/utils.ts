import { get } from 'svelte/store';

import { Session, endSession } from '$lib/store/session.js';
import {
	Api,
	V1RegisterMethod,
	type V1Machine,
	type V1PreAuthKey,
	type V1Route,
	type V1User
} from './api.js';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { invalidateAll } from '$app/navigation';
import { base } from '$app/paths';

export class Headscale extends Api<unknown> {
	constructor(customFetch: typeof fetch = fetch, session = get(Session)) {
		if (!session?.token) {
			throw new Error('Internal: Cannot create API without session token!');
		}

		super({
			baseURL: session.baseUrl,
			headers: {
				Authorization: 'Bearer ' + session.token
			},
			httpAgent: customFetch,
			httpsAgent: customFetch,
			validateStatus() {
				return true;
			}
		});

		this.instance.interceptors.request.use((cfg): InternalAxiosRequestConfig => {
			if (!cfg.headers.hasAuthorization()) {
				cfg.headers.setAuthorization('Bearer ' + get(Session)?.token);
			}
			return cfg;
		});

		this.instance.interceptors.response.use(
			(res) => {
				if (res.status > 300) {
					if (res.status === 500 && res.data === 'Unauthorized') {
						endSession();
						window.location.href = base + '/login';
					}

					return { ...res, data: {} };
				}

				return res;
			},
			(err) => {
				throw err;
			}
		);
	}
}

export type V1Tag = `tag:${string}`;
export const tagRegex = /^tag:/;

export class User implements V1User {
	// public static async find(name: string, customFetch?: typeof fetch): Promise<V1User | undefined> {
	// 	const { data } = await new Headscale(customFetch).api.headscaleServiceGetUser(name);
	// 	return data.user;
	// }
	public static async list(customFetch?: typeof fetch): Promise<V1User[] | undefined> {
		const { data } = await new Headscale(customFetch).api.headscaleServiceListUsers();
		return data.users;
	}

	public readonly name: string;
	public readonly id?: string | undefined;
	public readonly createdAt?: string | undefined;

	constructor(data: V1User) {
		if (!data.name) throw new Error('Name is required to create a new User!');
		for (const [key, value] of Object.entries(data)) {
			this[key as keyof this] = value;
		}
	}

	public async save(customFetch?: typeof fetch): Promise<User | undefined> {
		const { data } = await new Headscale(customFetch).api.headscaleServiceCreateUser({
			name: this.name
		});
		return data.user ? new User(data.user) : undefined;
	}

	public async edit(newName: string, customFetch?: typeof fetch): Promise<User | undefined> {
		const { data } = await new Headscale(customFetch).api.headscaleServiceRenameUser(
			this.name,
			newName
		);
		return data.user ? new User(data.user) : undefined;
	}

	public async delete(customFetch?: typeof fetch): Promise<void> {
		await new Headscale(customFetch).api.headscaleServiceDeleteUser(this.name);
	}
}

export class PreAuthKey implements V1PreAuthKey {
	public readonly id?: string | undefined;
	public readonly key?: string | undefined;
	public readonly aclTags?: string[] | undefined;
	public readonly user?: string | undefined;
	public readonly createdAt?: string | undefined;
	public readonly expiration?: string | undefined;
	public readonly used?: boolean | undefined;
	public readonly reusable?: boolean | undefined;
	public readonly ephemeral?: boolean | undefined;

	constructor(data: V1PreAuthKey) {
		for (const [key, value] of Object.entries(data)) {
			this[key as keyof this] = value;
		}
	}

	public async save(customFetch?: typeof fetch): Promise<PreAuthKey | undefined> {
		const { data } = await new Headscale(customFetch).api.headscaleServiceCreatePreAuthKey({
			user: this.user,
			aclTags: this.aclTags,
			expiration: this.expiration,
			reusable: this.reusable,
			ephemeral: this.ephemeral
		});
		return data.preAuthKey ? new PreAuthKey(data.preAuthKey) : undefined;
	}

	public async expire(key: string, customFetch?: typeof fetch): Promise<void> {
		await new Headscale(customFetch).api.headscaleServiceExpirePreAuthKey({
			key,
			user: this.user
		});
	}
}

export class Route implements V1Route {
	id?: string | undefined;
	prefix?: string | undefined;
	advertised?: boolean | undefined;
	enabled?: boolean | undefined;
	isPrimary?: boolean | undefined;
	createdAt?: string | undefined;
	updatedAt?: string | undefined;
	deletedAt?: string | undefined;
	machine?: V1Machine | undefined;

	constructor(data: V1Route) {
		for (const [key, value] of Object.entries(data)) {
			this[key as keyof this] = value;
		}
	}

	public async delete(customFetch?: typeof fetch): Promise<void> {
		if (!this.id) throw new Error('Internal: Cannot create route without id.');
		await new Headscale(customFetch).api.headscaleServiceDeleteRoute(this.id);
	}

	public async disable(customFetch?: typeof fetch): Promise<void> {
		if (!this.id) throw new Error('Internal: Cannot disable route without id.');
		await new Headscale(customFetch).api.headscaleServiceDisableRoute(this.id);
	}

	public async enable(customFetch?: typeof fetch): Promise<void> {
		if (!this.id) throw new Error('Internal: Cannot enable route without id.');
		await new Headscale(customFetch).api.headscaleServiceEnableRoute(this.id);
	}
}

export class Machine implements V1Machine {
	public static async register(
		machine: { key: string; user: string },
		customFetch?: typeof fetch
	): Promise<Machine | undefined> {
		if (!machine.key) throw new Error('Internal: Cannot create machine without key.');
		const { data } = await new Headscale(customFetch).api.headscaleServiceRegisterMachine(machine);
		return data.machine ? new Machine(data.machine) : undefined;
	}

	public readonly id?: string | undefined;
	public readonly name?: string | undefined;
	public readonly givenName?: string | undefined;
	public readonly discoKey?: string | undefined;
	public readonly nodeKey?: string | undefined;
	public readonly preAuthKey?: V1PreAuthKey | undefined;
	public readonly user?: V1User | undefined;
	public readonly createdAt?: string | undefined;
	public readonly lastSuccessfulUpdate?: string | undefined;
	public readonly lastSeen?: string | undefined;
	public readonly expiry?: string | undefined;
	public readonly ipAddresses?: string[] | undefined;
	public readonly registerMethod?: V1RegisterMethod | undefined;
	public readonly online?: boolean | undefined;
	public readonly invalidTags?: string[] | undefined;
	public readonly validTags?: string[] | undefined;
	public readonly forcedTags?: string[] | undefined;

	constructor(data: V1Machine) {
		for (const [key, value] of Object.entries(data)) {
			this[key as keyof this] = value;
		}
	}

	public async delete(customFetch?: typeof fetch): Promise<void> {
		if (!this.id) throw new Error('Internal: Cannot delete machine without id.');
		await new Headscale(customFetch).api.headscaleServiceDeleteMachine(this.id);
	}

	public async expire(customFetch?: typeof fetch): Promise<Machine | undefined> {
		if (!this.id) throw new Error('Internal: Cannot expire machine without id.');
		const { data } = await new Headscale(customFetch).api.headscaleServiceExpireMachine(this.id);
		return data.machine ? new Machine(data.machine) : undefined;
	}

	public async reassign(user: string, customFetch?: typeof fetch): Promise<Machine | undefined> {
		if (!this.id) throw new Error('Internal: Cannot reassign machine without id.');
		const { data } = await new Headscale(customFetch).api.headscaleServiceMoveMachine(this.id, {
			user
		});
		return data.machine ? new Machine(data.machine) : undefined;
	}

	public async edit(newName: string, customFetch?: typeof fetch): Promise<Machine | undefined> {
		if (!this.id) throw new Error('Internal: Cannot edit machine without id.');
		const { data } = await new Headscale(customFetch).api.headscaleServiceRenameMachine(
			this.id,
			newName
		);
		return data.machine ? new Machine(data.machine) : undefined;
	}

	public async setTags(tags: string[], customFetch?: typeof fetch): Promise<Machine | undefined> {
		if (!this.id) throw new Error('Internal: Cannot set machine tags without id.');
		const { data } = await new Headscale(customFetch).api.headscaleServiceSetTags(this.id, {
			tags: tags.map((tag) => (tagRegex.test(tag) ? tag : `tag:${tag}`))
		});
		return data.machine ? new Machine(data.machine) : undefined;
	}
}

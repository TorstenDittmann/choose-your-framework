import { writable } from 'svelte/store';

const createVotes = () => {
	const { subscribe, set, update } = writable({
        Angular: 0,
        React: 0,
        Svelte: 0,
        Vue: 0
    });

	return {
		subscribe,
		update: (m) => update(n => {
            return {
                ...n,
                ...m
            }
        }),
	};
}

export const votes = createVotes();

const createHistory = () => {
	const { subscribe, update } = writable({
        Angular: new Array(10).fill(0),
        React: new Array(10).fill(0),
        Svelte: new Array(10).fill(0),
        Vue: new Array(10).fill(0),
    });

	return {
		subscribe,
		update: (m) => update(n => {
            return {
                ...n,
                ...m
            }
        }),
	};
}

export const history = createHistory();
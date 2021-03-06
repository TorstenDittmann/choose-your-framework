import { getStore } from './lib/hmr-stores';

const createVotes = () => {
    const { subscribe, set, update } = getStore('votes', {
        Angular: 0,
        React: 0,
        Svelte: 0,
        Vue: 0
    });

    return {
        subscribe,
        update: (m, fresh = false) => update(n => {
            const differences = Object.keys(m).reduce((diff, key) => {
                if (m[key] === n[key]) return diff;
                return {
                    ...diff,
                    [key]: m[key]
                }
            }, {});
            if (!fresh) {
                for (const [framework] of Object.entries(differences)) {
                    notifications.add(`Someone just voted for ${framework}`);
                }
            }
            return {
                ...n,
                ...(fresh ? m : differences)
            }
        }),
    };
}

const createHistory = () => {
    const defaultValue = new Array(10).fill(0);
    const { subscribe, update } = getStore('history', {
        Angular: defaultValue,
        React: defaultValue,
        Svelte: defaultValue,
        Vue: defaultValue,
    });

    return {
        subscribe,
        update: (m) => update(n => ({
            ...n,
            ...m
        })),
    };
}

const createNotifications = () => {
    const { subscribe, update } = getStore('notifications', []);

    return {
        subscribe,
        add: (label: string) => update(n => {
            const timestamp = Date.now();
            const current = { timestamp, label };
            setTimeout(() => notifications.remove(current), 5000);
            return [
                ...n,
                current
            ];
        }),
        remove: (notification: { timestamp: number; label: string; }) => update(n => n.filter(not => notification != not))
    }
}

export const votes = createVotes();
export const history = createHistory();
export const notifications = createNotifications();
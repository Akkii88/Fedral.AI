const API_URL = 'http://127.0.0.1:8000/api';

export const api = {
    getStats: async () => {
        // Fetch real stats or aggregate from other calls
        const clients = await api.hospitals.list();
        const active = clients.filter(c => c.status === 'online').length;
        return {
            active: active,
            clients: clients.length,
            budget: 2.4, // Mock for now, or fetch from settings
            training: clients.filter(c => c.status === 'training').length > 0
        };
    },

    hospitals: {
        list: async () => {
            const res = await fetch(`${API_URL}/hospitals/`);
            if (!res.ok) throw new Error('Failed to fetch hospitals');
            return res.json();
        },
        create: async (data) => {
            const res = await fetch(`${API_URL}/hospitals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create hospital');
            return res.json();
        },
        get: async (id) => {
            const res = await fetch(`${API_URL}/hospitals/${id}`);
            if (!res.ok) throw new Error('Failed to fetch hospital');
            return res.json();
        },
        update: async (id, updates) => {
            const res = await fetch(`${API_URL}/hospitals/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Failed to update hospital');
            return res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/hospitals/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete hospital');
            return res.json();
        },
        getTimeline: async (id) => {
            const res = await fetch(`${API_URL}/hospitals/${id}/timeline`);
            if (!res.ok) throw new Error('Failed to fetch timeline');
            return res.json();
        }
    },

    experiments: {
        list: async () => {
            const res = await fetch(`${API_URL}/experiments/`);
            if (!res.ok) throw new Error('Failed to fetch experiments');
            return res.json();
        },
        create: async (config) => {
            const res = await fetch(`${API_URL}/experiments/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (!res.ok) throw new Error('Failed to create experiment');
            return res.json();
        },
        get: async (id) => {
            const res = await fetch(`${API_URL}/experiments/${id}`);
            if (!res.ok) throw new Error('Failed to fetch experiment');
            return res.json();
        },
        start: async (id) => {
            const res = await fetch(`${API_URL}/experiments/${id}/start`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to start experiment');
            return res.json();
        },
        stop: async (id) => {
            const res = await fetch(`${API_URL}/experiments/${id}/stop`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to stop experiment');
            return res.json();
        },
        delete: async (id) => {
            const res = await fetch(`${API_URL}/experiments/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete experiment');
            return res.json();
        }
    },

    admin: {
        getLogs: async () => {
            const res = await fetch(`${API_URL}/admin/audit_logs`);
            if (!res.ok) throw new Error('Failed to fetch logs');
            return res.json();
        },
        getRoles: async () => {
            const res = await fetch(`${API_URL}/admin/roles`);
            if (!res.ok) throw new Error('Failed to fetch roles');
            return res.json();
        },
        getSettings: async () => {
            const res = await fetch(`${API_URL}/admin/settings`);
            if (!res.ok) throw new Error('Failed to fetch settings');
            return res.json();
        },
        updateSettings: async (settings) => {
            const res = await fetch(`${API_URL}/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Failed to update settings');
            return res.json();
        }
    },

    contributions: {
        list: async (status = 'pending') => {
            const res = await fetch(`${API_URL}/agent/contributions?status=${status}`);
            if (!res.ok) throw new Error('Failed to fetch contributions');
            return res.json();
        },
        review: async (id, action) => {
            const res = await fetch(`${API_URL}/agent/contributions/${id}/review?action=${action}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error('Failed to review contribution');
            return res.json();
        },
        globalModel: async () => {
            const res = await fetch(`${API_URL}/agent/global_model`);
            if (!res.ok) throw new Error('Failed to fetch global model');
            return res.json();
        }
    }
};


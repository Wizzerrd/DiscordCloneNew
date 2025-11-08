export async function apiFetch(path, options = {}) {
    const base = import.meta.env.VITE_API_BASE_URL;

    const defaultOptions = {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    };

    const response = await fetch(`${base}${path}`, {
        ...defaultOptions,
        ...options,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error: ${response.status} ${text}`);
    }

    return response.json();
}

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// === Fetch current session ===
export const fetchSession = createAsyncThunk("auth/fetchSession", async (_, thunkAPI) => {
    try {
        const res = await fetch(`${API_BASE}/api/users/me`, { credentials: "include" });
        if (!res.ok) return thunkAPI.rejectWithValue("Not authenticated");
        const data = await res.json();
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

// === Logout (async thunk) ===
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
    try {
        const res = await fetch(`${API_BASE}/auth/logout`, {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) throw new Error("Logout failed");
        return null; // clears state
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState: { user: null, loading: true, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // === Fetch session ===
            .addCase(fetchSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSession.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(fetchSession.rejected, (state) => {
                state.user = null;
                state.loading = false;
            })

            // === Logout ===
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
            })
            .addCase(logout.rejected, (state, action) => {
                console.error("Logout failed:", action.payload);
                state.loading = false;
            });
    },
});

export default authSlice.reducer;

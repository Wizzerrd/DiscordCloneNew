import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

const authSlice = createSlice({
    name: "auth",
    initialState: { user: null, loading: true, error: null },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
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
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

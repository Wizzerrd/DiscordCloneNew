import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../lib/apiFetch";

export const fetchServers = createAsyncThunk("servers/fetchServers", async (_, thunkAPI) => {
    try {
        const data = await apiFetch("/api/servers/mine");
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const createServer = createAsyncThunk("servers/createServer", async (name, thunkAPI) => {
    try {
        const data = await apiFetch("/api/servers", {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        return data; // backend already includes role and id
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

const serversSlice = createSlice({
    name: "servers",
    initialState: { list: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchServers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchServers.fulfilled, (state, action) => {
                state.list = action.payload;
                state.loading = false;
            })
            .addCase(fetchServers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createServer.fulfilled, (state, action) => {
                state.list.push(action.payload);
            });
    },
});

export default serversSlice.reducer;

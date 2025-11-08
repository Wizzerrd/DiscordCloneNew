import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../lib/apiFetch";

export const fetchRelationships = createAsyncThunk("relationships/fetchAll", async () => {
    return await apiFetch("/api/relationships/list", { credentials: "include" });
});

export const sendFriendRequest = createAsyncThunk("relationships/send", async (receiverId, thunkAPI) => {
    try {
        const data = await apiFetch("/api/relationships/send", {
            method: "POST",
            body: JSON.stringify({ receiverId }),
        });
        return data.relationship;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const acceptRequest = createAsyncThunk("relationships/accept", async (senderId, thunkAPI) => {
    try {
        const data = await apiFetch("/api/relationships/accept", {
            method: "POST",
            body: JSON.stringify({ senderId }),
        });
        return data.relationship;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const removeFriend = createAsyncThunk("relationships/remove", async (targetId, thunkAPI) => {
    try {
        const data = await apiFetch("/api/relationships/remove", {
            method: "POST",
            body: JSON.stringify({ targetId }),
        });
        return data.targetId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const cancelRequest = createAsyncThunk("relationships/cancel", async (targetId, thunkAPI) => {
    try {
        const data = await apiFetch("/api/relationships/cancel", {
            method: "POST",
            body: JSON.stringify({ targetId }),
        });
        return data.targetId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const blockUser = createAsyncThunk("relationships/block", async (targetId, thunkAPI) => {
    try {
        const data = await apiFetch("/api/relationships/block", {
            method: "POST",
            body: JSON.stringify({ targetId }),
        });
        return data.relationship;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

export const unblockUser = createAsyncThunk("relationships/unblock", async (targetId, thunkAPI) => {
    try {
        const data = await apiFetch("/api/relationships/unblock", {
            method: "POST",
            body: JSON.stringify({ targetId }),
        });
        return data.targetId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
    }
});

const relationshipsSlice = createSlice({
    name: "relationships",
    initialState: { list: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRelationships.pending, (s) => { s.loading = true; })
            .addCase(fetchRelationships.fulfilled, (s, a) => {
                s.loading = false;
                s.list = a.payload;
            })
            .addCase(fetchRelationships.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload;
            })
            .addCase(sendFriendRequest.fulfilled, (s, a) => { s.list.push(a.payload); })
            .addCase(acceptRequest.fulfilled, (s, a) => {
                const idx = s.list.findIndex((r) => r.id === a.payload.id);
                if (idx >= 0) s.list[idx] = a.payload;
            })
            .addCase(removeFriend.fulfilled, (s, a) => {
                s.list = s.list.filter((r) => r.id !== a.payload);
            })
            .addCase(blockUser.fulfilled, (s, a) => {
                const idx = s.list.findIndex((r) => r.id === a.payload.id);
                if (idx >= 0) s.list[idx] = a.payload;
                else s.list.push(a.payload);
            })
            .addCase(unblockUser.fulfilled, (s, a) => {
                s.list = s.list.filter((r) => r.id !== a.payload);
            })
            .addCase(cancelRequest.fulfilled, (s, a) => {
                s.list = s.list.filter((r) => r.id !== a.payload);
            })
    },
});

export default relationshipsSlice.reducer;

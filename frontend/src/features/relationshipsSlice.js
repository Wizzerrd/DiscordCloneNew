import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../lib/apiFetch";

// === Thunks ===

// Fetch all relationships
export const fetchRelationships = createAsyncThunk(
    "relationships/fetchAll",
    async () => apiFetch("/api/relationships/list")
);

// Generic helper to perform a write + refetch
async function writeAndRefresh(endpoint, body) {
    await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });
    return apiFetch("/api/relationships/list");
}

// Send a friend request
export const sendFriendRequest = createAsyncThunk(
    "relationships/sendFriendRequest",
    async (receiverId) =>
        writeAndRefresh("/api/relationships/send", { receiverId })
);

// Accept an incoming friend request
export const acceptRequest = createAsyncThunk(
    "relationships/acceptRequest",
    async (senderId) =>
        writeAndRefresh("/api/relationships/accept", { senderId })
);

// Remove a friend
export const removeFriend = createAsyncThunk(
    "relationships/removeFriend",
    async (targetId) =>
        writeAndRefresh("/api/relationships/remove", { targetId })
);

// Block a user
export const blockUser = createAsyncThunk(
    "relationships/blockUser",
    async (targetId) =>
        writeAndRefresh("/api/relationships/block", { targetId })
);

// Unblock a user
export const unblockUser = createAsyncThunk(
    "relationships/unblockUser",
    async (targetId) =>
        writeAndRefresh("/api/relationships/unblock", { targetId })
);

// === Slice ===
const relationshipsSlice = createSlice({
    name: "relationships",
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchRelationships.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRelationships.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchRelationships.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // For all write actions, reuse same reducer pattern
            .addMatcher(
                (action) =>
                    [
                        sendFriendRequest.fulfilled.type,
                        acceptRequest.fulfilled.type,
                        removeFriend.fulfilled.type,
                        blockUser.fulfilled.type,
                        unblockUser.fulfilled.type,
                    ].includes(action.type),
                (state, action) => {
                    // Replace the list with the fresh copy from backend
                    state.loading = false;
                    state.error = null;
                    state.list = action.payload;
                }
            )
            .addMatcher(
                (action) =>
                    [
                        sendFriendRequest.pending.type,
                        acceptRequest.pending.type,
                        removeFriend.pending.type,
                        blockUser.pending.type,
                        unblockUser.pending.type,
                    ].includes(action.type),
                (state) => {
                    state.loading = true;
                }
            )
            .addMatcher(
                (action) =>
                    [
                        sendFriendRequest.rejected.type,
                        acceptRequest.rejected.type,
                        removeFriend.rejected.type,
                        blockUser.rejected.type,
                        unblockUser.rejected.type,
                    ].includes(action.type),
                (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
                }
            );
    },
});

export default relationshipsSlice.reducer;

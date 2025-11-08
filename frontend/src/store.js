import { configureStore } from "@reduxjs/toolkit";
import relationshipsReducer from "./features/relationshipsSlice";
import authReducer from "./features/authSlice";
import serversReducer from "./features/serversSlice"

export const store = configureStore({
    reducer: {
        relationships: relationshipsReducer,
        auth: authReducer,
        servers: serversReducer,
    },
});

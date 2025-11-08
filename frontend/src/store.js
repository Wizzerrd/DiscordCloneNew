import { configureStore } from "@reduxjs/toolkit";
import relationshipsReducer from "./features/relationshipsSlice";
import authReducer from "./features/authSlice";

export const store = configureStore({
    reducer: {
        relationships: relationshipsReducer,
        auth: authReducer,
    },
});

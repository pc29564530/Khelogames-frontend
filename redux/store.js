import { persistStore } from "redux-persist";
import rootReducer from './reducers';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});
export const persistor = persistStore(store);
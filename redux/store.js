import { persistStore } from "redux-persist";
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { configureStore } from '@reduxjs/toolkit';
import getMiddleware from './middleware';

// Get custom middleware
const customMiddleware = getMiddleware();

// Configure store with enhanced middleware
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false, // Disabled for performance
        }),
        thunk,
        ...customMiddleware, // Add custom middleware
    ],
    devTools: __DEV__ ? {
        realtime: true,
        name: 'Khelogames-frontend',
        host: 'localhost',
        port: 8080,
    } : false,
});

export const persistor = persistStore(store);
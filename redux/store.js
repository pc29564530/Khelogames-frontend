import {applyMiddleware, legacy_createStore as createStore} from 'redux';
import { persistStore } from "redux-persist";
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import persistReducer from 'redux-persist/es/persistReducer';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

let composer = applyMiddleware(thunk);

// Used for redux debbuger for chrome extension
const composeEnhancers = composeWithDevTools({
    realtime:true,
    name: 'Khelogames-frontend',
    host: 'localhost',
    port:8080
})

if (__DEV__) {
  composer = composeWithDevTools(applyMiddleware(thunk));
}

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({
            serializableCheck: false,
        }),
        thunk
    ]
});
export const persistor = persistStore(store)
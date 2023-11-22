import {applyMiddleware, createStore} from 'redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const composeEnhancers = composeWithDevTools({
    realtime:true,
    name: 'Khelogames-frontend',
    host: 'localhost',
    port:8080
})

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export default store;
import { NativeBaseProvider } from 'native-base';
import {Provider} from 'react-redux'
import {store, persistor} from './redux/store';
import MainNavigation from './navigation/MainNavigation';
import {WebSocketProvider} from './context/WebSocketContext';
import { PersistGate } from 'redux-persist/integration/react';

export default function App() {
  return ( 
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NativeBaseProvider>
            <WebSocketProvider>
              <MainNavigation />
            </WebSocketProvider>
          </NativeBaseProvider>
        </PersistGate>
    </Provider>
  );
}


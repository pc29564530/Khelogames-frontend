import {useEffect} from 'react';
import { NativeBaseProvider } from 'native-base';
import {Provider} from 'react-redux'
import {store, persistor} from './redux/store';
import MainNavigation from './navigation/MainNavigation';
import {WebSocketProvider} from './context/WebSocketContext';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from './utils/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import ToastManager from './utils/ToastManager';

export default function App() {

  useEffect(() => {
    setTimeout(() => {
      ToastManager.success('Toast system working')
    }, 1000)
  }, []);

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


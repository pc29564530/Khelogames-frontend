import { NativeBaseProvider } from 'native-base';
import {Provider} from 'react-redux'
import {store, persistor} from './redux/store';
import MainNavigation from './navigation/MainNavigation';
import { GlobalProvider } from './context/GlobalContext';
import {WebSocketProvider} from './context/WebSocketContext';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from './components/ErrorBoundary';
import monitoringService from './services/monitoringService';

// Initialize monitoring service
monitoringService.initialize({
  // Add configuration here when integrating with actual service
  // e.g., dsn: 'your-sentry-dsn',
});

export default function App() {
  return ( 
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NativeBaseProvider>
            <ErrorBoundary>
              <WebSocketProvider>
                <MainNavigation />
              </WebSocketProvider>
            </ErrorBoundary>
          </NativeBaseProvider>
        </PersistGate>
    </Provider>
  );
}


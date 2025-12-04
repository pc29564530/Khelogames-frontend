import { NativeBaseProvider } from 'native-base';
import {Provider} from 'react-redux'
import {store, persistor} from './redux/store';
import MainNavigation from './navigation/MainNavigation';
import { GlobalProvider } from './context/GlobalContext';
import {WebSocketProvider} from './context/WebSocketContext';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from './components/ErrorBoundary';
import monitoringService from './services/monitoringService';
import performanceMonitor from './services/performanceMonitor';

// Initialize monitoring service
monitoringService.initialize({
  // Add configuration here when integrating with actual service
  // e.g., dsn: 'your-sentry-dsn',
});

// Initialize performance monitoring
performanceMonitor.initialize({
  enableScreenTracking: true,
  enableApiTracking: true,
  enableMemoryTracking: true,
  memoryCheckInterval: 30000, // Check memory every 30 seconds
  logToConsole: __DEV__, // Log to console in development mode
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


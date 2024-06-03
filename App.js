import { NativeBaseProvider } from 'native-base';
import {Provider} from 'react-redux'
import store from './redux/store';
import MainNavigation from './navigation/MainNavigation';

export default function App() {
  return ( 
    <Provider store={store}>
        <NativeBaseProvider>
            <MainNavigation />
        </NativeBaseProvider>
    </Provider>
  );
}


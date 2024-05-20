import 'react-native-gesture-handler';
import { NativeBaseProvider } from 'native-base';
import {Provider} from 'react-redux'
import store from './redux/store';
import MainNavigation from './navigation/MainNavigation';
import { GlobalProvider } from './context/GlobalContext';

export default function App() {
  return ( 
    <Provider store={store}>
        <NativeBaseProvider>
            <GlobalProvider >
              <MainNavigation />
            </GlobalProvider>  
        </NativeBaseProvider>
    </Provider>
  );
}


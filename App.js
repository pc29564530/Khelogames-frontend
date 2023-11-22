import 'react-native-gesture-handler';
import React, {useState, useEffect, useRef} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NativeBaseProvider } from 'native-base';
import {Provider, useSelector, useDispatch} from 'react-redux'
import store from './redux/store';
import Root from './root';

export default function App() {
  return (  
    <NativeBaseProvider>
      <Provider store={store}>
        <Root />
      </Provider>  
   </NativeBaseProvider>
    
  );
}


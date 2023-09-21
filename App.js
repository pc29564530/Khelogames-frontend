import React, {useState, useEffect, useRef} from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {Provider, useSelector, useDispatch} from 'react-redux'
import store from './redux/store';
import Root from './root';

export default function App() {
 
  return (  
    <Provider store={store}>
        <Root />
   </Provider>
    
  );
}


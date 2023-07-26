import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Main from './components/Main';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import User from './components/User';
import Home from './components/Home';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
        {/* <Drawer.Navigator drawerContent={() => <Sidebar />}>
            <Drawer.Screen name="Home" component={Main}/>
            {/* <Drawer.Screen name="Home" component={Main}/>
            <Drawer.Screen name="Account" component={Account} />
            <Drawer.Screen name="SignIn" component={SignIn} /> */}
        {/* </Drawer.Navigator> */}
        <Stack.Navigator> 
            {/* <Stack.Screen name="Sidebar" component={Sidebar}/> */}
            <Stack.Screen name="Main" component={Main}/>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="User" component={User} />
            <Stack.Screen name="SignIn" component={SignIn} />
        </Stack.Navigator>
    </NavigationContainer>
  );
}


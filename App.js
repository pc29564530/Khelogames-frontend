
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Main from './components/Main';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import User from './components/User';
import Home from './components/Home';
import Footer from './components/Footer';
import Header from './components/Header';
import Thread from './components/Thread';
import CreateThread from './components/CreateThread';
import Community from './components/Community';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileMenu from './components/ProfileMenu';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName='Main' > 
            {/* <Stack.Screen name="Sidebar" component={Sidebar}/> */}
            <Stack.Screen name="Main" >{props => <Main {...props}/>}</Stack.Screen>
            <Stack.Screen name="Home" component={Home}/>
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="User" component={User} />
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="Header" component={Header} />
            <Stack.Screen name="CreateThread" component={CreateThread} />
            <Stack.Screen name="Community" component={Community}/>
            <Stack.Screen name="Thread" component={Thread} />
            <Stack.Screen name="Footer" component={Footer} />
            {/* <Stack.Screen name="ProfileMenu" component={ProfileMenu} /> */}
        </Stack.Navigator>
    </NavigationContainer>
    
  );
}


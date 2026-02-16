import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Profile from '../screen/Profile';
import StackNavigation from './StackNavigation';
import tailwind from 'twrnc';
const Drawer = createDrawerNavigator();

export default function DrawerNavigation(){
    return (
        <Drawer.Navigator 
            screenOptions={{
                drawerStyle: tailwind`w-6/6`
            }}
            drawerContent={props => <Profile {...props} />}>
            <Drawer.Screen name="HomeScreen" component={StackNavigation} 
                options={{
                    headerTitle: null,
                    headerTransparent: false,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                }}
            />
        </Drawer.Navigator>
    );
}
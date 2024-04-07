import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileMenu from '../screen/ProfileMenu';
import StackNavigation from './StackNavigation';
import tailwind from 'twrnc';
const Drawer = createDrawerNavigator();

export default function DrawerNavigation(){
    return (
        <Drawer.Navigator 
            screenOptions={{
                drawerStyle: tailwind`w-5/6`
            }}
            drawerContent={props => <ProfileMenu {...props} />}>
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
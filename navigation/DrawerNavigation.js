import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileMenu from '../screen/ProfileMenu';
import StackNavigation from './StackNavigation';
import Home from '../screen/Home';
import { Stack } from 'native-base';
const Drawer = createDrawerNavigator();

export default function DrawerNavigation(){
    console.log("Step3")
    return (
        <Drawer.Navigator drawerContent={props => <ProfileMenu {...props} />}>
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
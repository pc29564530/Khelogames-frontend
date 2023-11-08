import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileMenu from '../components/ProfileMenu';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

function AppDrawer() {
    const navigation = useNavigation();
    const Drawer = createDrawerNavigator();
    return (
        <Drawer.Navigator
            drawerContent={() => (
                <Header />
            )}
            drawerType="slide"
            overlayColor="transparent"
            drawerStyle={{
                backgroundColor: 'white',
                width: 300,
            }}
        >
            <Drawer.Screen name="ProfileMenuPage" component={ProfileMenu} />
        </Drawer.Navigator>
    );
}


export default AppDrawer;
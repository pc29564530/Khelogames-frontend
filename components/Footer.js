import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Foundation from 'react-native-vector-icons/Foundation'
import Home from './Home';
import Community from './Community';
import ProfileMenu from './ProfileMenu';
import CreateThread from './CreateThread';


const Tab = createBottomTabNavigator();

function Footer({logout}) {
    return (
        <>  
            <Tab.Navigator 
                screenOptions={({route})=> ({
                    headerTitle: null,
                    headerTransparent: true,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                    tabBarShowLabel: false,
                    tabBarIcon: () => {
                      let Icon;
                      if(route.name === "Home"){
                        Icon=<Foundation name="home" size={25} />;
                      } else if(route.name === "Community"){
                        Icon = <MaterialCommunityIcons name="forum" size={25} />;
                      } else if(route.name === "CreateThread") {
                        Icon = <MaterialIcons name="add-box" size={25} />;
                      } else if(route.name === "ProfileMenu") {
                        Icon = <MaterialCommunityIcons name="account" size={25} />;
                      }
                      return Icon;
                    }
                    
                })}
            > 
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Community" component={Community} />
                <Tab.Screen name="ProfileMenu"
                    component={() => <ProfileMenu logout={logout}/>}
                />
                <Tab.Screen name="CreateThread" component={CreateThread} />
            </Tab.Navigator>
        </>
    );
}

export default Footer;

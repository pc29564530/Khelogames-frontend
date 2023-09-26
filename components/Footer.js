import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Foundation from 'react-native-vector-icons/Foundation'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Home from './Home';
import Community from './Community';
import CreateThread from './CreateThread';
import Follow from './Follow';


const Tab = createBottomTabNavigator();

function Footer() {
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
                      } else if(route.name === "Follow") {
                        Icon = <FontAwesome5  name="user-friends" size={25} />;
                      }
                      return Icon;
                    }
                    
                })}
            > 
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Community" component={Community} />
                <Tab.Screen name="Follow" component={Follow} />
                <Tab.Screen name="CreateThread" component={CreateThread} />
            </Tab.Navigator>
        </>
    );
}

export default Footer;

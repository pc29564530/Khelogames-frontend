import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Home from './Home';
import Community from './Community';
import CreateThread from './CreateThread';
import Follow from './Follow';
import tailwind from 'twrnc';


const Tab = createBottomTabNavigator();

function Footer() {
  const iconSize = 25
    return (
        <>  
            <Tab.Navigator
                screenOptions={({route})=> ({
                    headerTitle: null,
                    headerTransparent: true,
                    headerShown: false,
                    headerLeft: null,
                    headerBackTitleVisible: false,
                    tabBarShowLabel: true,
                    tabBarStyle: tailwind`absolute bottom-0 w-full bg-black text-white p-1`,
                    tabBarIcon: () => {
                      let Icon;
                      if(route.name === "Home"){
                        Icon=<FontAwesome name="home" size={iconSize} color="white" />;
                      } else if(route.name === "Community"){
                        Icon = <MaterialIcons name="forum" size={iconSize} color="white"/>;
                      } else if(route.name === "CreateThread") {
                        Icon = <MaterialIcons name="add-box" size={iconSize} color="white"/>;
                      } else if(route.name === "Follow") {
                        Icon = <MaterialIcons  name="connect-without-contact" size={iconSize} color="white"/>;
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

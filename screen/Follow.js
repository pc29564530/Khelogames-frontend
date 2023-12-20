import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MaterialTopTabBar, createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import Follower from './Follower';
import Following from './Following';
import tailwind from 'twrnc';


const TopTab = createMaterialTopTabNavigator();

function Follow() {


    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarLabelStyle: tailwind`text-white`,
                tabBarStyle: tailwind`bg-black`,
            }}
        >
            <TopTab.Screen 
                name="Follower"
                color="white"
                component={Follower}
            />
            <TopTab.Screen 
                name="Following"
                color="white"
                component={Following}
            />
        </TopTab.Navigator>
    );
}

export default Follow;
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Pressable} from 'react-native';
import {MaterialTopTabBar, createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import Follower from './Follower';
import Following from './Following';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const TopTab = createMaterialTopTabNavigator();

function Follow() {
    const navigation = useNavigation();

    navigation.setOptions({
        headerTitle:'Follow',
        headerLeft:()=>(
            <Pressable onPress={() => {navigation.goBack()}} style={tailwind`pl-2`}>
                <AntDesign name="arrowleft" color="black" size={26} />
            </Pressable>
        )
    })

    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarLabelStyle: tailwind`text-white`,
                tabBarStyle: tailwind`bg-red-400`,
            }}
        >
            <TopTab.Screen 
                name="Follower"
                color="black"
                component={Follower}
            />
            <TopTab.Screen 
                name="Following"
                color="black"
                component={Following}
            />
        </TopTab.Navigator>
    );
}

export default Follow;
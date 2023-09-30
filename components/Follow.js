import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
// import {FollowerData} from '../data/follwoer';
// import {FollowingData}  from '../data/follow.js';
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import Follower from './Follower';
import Following from './Following';


const TopTab = createMaterialTopTabNavigator();

function Follow() {


    return (
        <TopTab.Navigator>
            <TopTab.Screen 
                name="Follower"
                component={Follower}
             />
            <TopTab.Screen 
                name="Following"
                component={Following}
            />
        </TopTab.Navigator>
    );
}

export default Follow;
import React from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ThreadProfileComponent from "../components/ThreadProfileCompement";
import ThreadRepliesComponent from "../components/ThreadRepliesComponent";
import tailwind from "twrnc";

const TopTabProfile = ({profileData}) => {
    const owner = profileData.owner
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator 
            screenOptions={{
                tabBarLabelStyle:tailwind`text-white`,
                tabBarStyle:tailwind`bg-black`,
                headerShown:true
            }}
        >
            <TopTab.Screen name="Thread"> 
                {props=> <ThreadProfileComponent {...props} owner={owner}/>}
            </TopTab.Screen>
            <TopTab.Screen name="Replies" >
            {props=> <ThreadRepliesComponent {...props} owner={owner}/>}
            </TopTab.Screen>
        </TopTab.Navigator>
    );
}

export default TopTabProfile;
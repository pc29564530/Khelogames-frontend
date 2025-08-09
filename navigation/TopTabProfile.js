import React from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ThreadProfileComponent from "../components/ThreadProfileCompement";
import ThreadRepliesComponent from "../components/ThreadRepliesComponent";
import tailwind from "twrnc";

const TopTabProfile = ({profile}) => {
    const profilePublicID = profile.public_id
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator 
            screenOptions={{
                tabBarLabelStyle:tailwind`text-black`,
                tabBarStyle:tailwind`bg-white`,
                headerShown:true
            }}
        >
            <TopTab.Screen name="Thread"> 
                {props=> <ThreadProfileComponent {...props} profilePublicID={profilePublicID}/>}
            </TopTab.Screen>
            <TopTab.Screen name="Replies" >
            {props=> <ThreadRepliesComponent {...props} profilePublicID={profilePublicID}/>}
            </TopTab.Screen>
        </TopTab.Navigator>
    );
}

export default TopTabProfile;
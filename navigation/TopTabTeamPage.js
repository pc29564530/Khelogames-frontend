import React from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ThreadProfileComponent from "../components/ThreadProfileCompement";
import ThreadRepliesComponent from "../components/ThreadRepliesComponent";
import Members from "../components/Members";
import TeamMatches from "../screen/TeamMatches";
import tailwind from "twrnc";

const TopTabTeamPage = ({teamData, game}) => {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator 
            screenOptions={{
                tabBarLabelStyle:tailwind`text-white`,
                tabBarStyle:tailwind`bg-black`,
                headerShown:true
            }}
        >
            <TopTab.Screen name="Player">
                {() => <Members teamData={teamData}/>}
            </TopTab.Screen>
            <TopTab.Screen 
                name="Matches">
                {() => <TeamMatches teamData={teamData} game={game} />}
            </TopTab.Screen>
        </TopTab.Navigator>
    );
}

export default TopTabTeamPage;
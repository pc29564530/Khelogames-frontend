import React from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ThreadProfileComponent from "../components/ThreadProfileCompement";
import ThreadRepliesComponent from "../components/ThreadRepliesComponent";
import Members from "../components/Members";
import TeamMatches from "../screen/TeamMatches";
import tailwind from "twrnc";

const TopTabTeamPage = ({teamData, game, parentScrollY, headerHeight, collapsedHeader}) => {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { 
                    backgroundColor: '#f87171',
                    elevation: 4,
                    shadowOpacity: 0.2,
                    zIndex:20, // used this more then top tab because not having proper touch
                },
                tabBarLabelStyle: {
                    width:100,
                    fontSize: 14,
                    fontWeight: '600',
                    textTransform: 'none',
                    color: 'white',
                },
                tabBarIndicatorStyle: {
                    backgroundColor: '#fff',
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#ffe4e6',
        }}
        >
            <TopTab.Screen name="Squad">
                {() => <Members teamData={teamData} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader} />}
            </TopTab.Screen>
            <TopTab.Screen name="Matches">
                {() => <TeamMatches teamData={teamData} game={game} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader} />}
            </TopTab.Screen>
        </TopTab.Navigator>
    );
}

export default TopTabTeamPage;
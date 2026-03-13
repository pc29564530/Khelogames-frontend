import React from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
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
                    backgroundColor: '#1e293b',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#334155',
                    zIndex: 20,
                },
                tabBarLabelStyle: {
                    width: 100,
                    fontSize: 14,
                    fontWeight: '600',
                    textTransform: 'none',
                },
                tabBarIndicatorStyle: {
                    backgroundColor: '#f87171',
                    height: 3,
                    borderRadius: 2,
                },
                tabBarActiveTintColor: '#f1f5f9',
                tabBarInactiveTintColor: '#64748b',
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
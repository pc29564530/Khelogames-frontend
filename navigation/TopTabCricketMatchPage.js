import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';

import CricketTeamSquad from '../components/CricketTeamSquad';
import CricketScoreCard from '../components/CricketScoreCard'; 

const TopTabCricketMatchPage = ({matchData, matchID, homeTeamID, awayTeamID}) => {
        console.log("Match Data in navigation : ", matchData)
        console.log("matchId: ", matchID)
        console.log("homeid:", homeTeamID )
        console.log("awayid:", awayTeamID )
        const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-white`,
                    tabBarStyle:tailwind`bg-black`,
                    headerShown:true
                }}
            >
                {/* <TopTab.Screen 
                    name="Detail"
                    component={CricketMatchDetail}
                    initialParams={{matchData}}
                /> */}
                <TopTab.Screen 
                    name="Scorecard"
                    component={CricketScoreCard}
                    initialParams={{ matchData:matchData, matchID: matchID, homeTeamID:homeTeamID, awayTeamID: awayTeamID}}
                />
                {/* <TopTab.Screen 
                    name="Squad"
                    component={CricketTeamSquad}
                    initialParams={{ matchID: matchID, homeTeamID:homeTeamID, awayTeamID: awayTeamID}}
                /> */}
        </TopTab.Navigator>
    );
}

export default TopTabCricketMatchPage;
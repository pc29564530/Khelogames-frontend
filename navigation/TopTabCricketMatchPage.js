import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import CricketMatchDetail from '../screen/CricketMatchDetail';
import CricketScoreCard from '../components/CricketScoreCard'; 
import CricketTeamSquad from '../components/CricketTeamSquad';


const TopTabCricketMatchPage = ({matchData, matchID, homeTeamID, awayTeamID}) => {

        const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-white`,
                    tabBarStyle:tailwind`bg-black`,
                    headerShown:true
                }}
            >
                <TopTab.Screen 
                    name="Detail"
                    component={CricketMatchDetail}
                    initialParams={{matchData:matchData}}
                />
                <TopTab.Screen 
                    name="Scorecard"
                    component={CricketScoreCard}
                    initialParams={{ matchData:matchData, matchID: matchID, homeTeamID:homeTeamID, awayTeamID: awayTeamID}}
                />
                <TopTab.Screen 
                    name="Squad"
                    component={CricketTeamSquad}
                    initialParams={{ matchData: matchData}}
                />
        </TopTab.Navigator>
    );
}

export default TopTabCricketMatchPage;
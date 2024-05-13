import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import CricketMatchScorePage from '../components/CricketMatchScorePage';
import CricketTeamSquad from '../components/CricketTeamSquad';
import CricketMatchDetail from '../screen/CricketMatchDetail';

const TopTabCricketMatchPage = ({team1ID, team2ID, tournamentID, matchID}) => {
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
                    initialParams={{matchID: matchID, tournamentID: tournamentID}}
                />
                <TopTab.Screen 
                    name="Scorecard"
                    component={CricketMatchScorePage}
                    initialParams={{team1ID: team1ID, team2ID: team2ID, tournamentID: tournamentID, matchID: matchID}}
                />
                <TopTab.Screen 
                    name="Squad"
                    component={CricketTeamSquad}
                    initialParams={{team1ID: team1ID, team2ID: team2ID}}
                />
        </TopTab.Navigator>
    );
}

export default TopTabCricketMatchPage;
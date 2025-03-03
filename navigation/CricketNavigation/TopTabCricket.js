import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentCricketInfo from '../screen/TournamentCricketInfo';
import TournamentMatches from '../screen/TournamentMatches';
import TournamentCricketStats from '../screen/TournamentCricketStats';
import TournamentTeam from '../screen/TournamentTeam';
import TournamentStanding from '../screen/TournamentStanding';

function TopTabCricket({tournament, game}) {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-black`,
                    tabBarStyle:tailwind`bg-white`,
                    headerShown:true
                }}
            >   
                <TopTab.Screen 
                    name="Info"
                    component={TournamentCricketInfo}
                    initialParams={{tournament:tournament, game: game}}
                />
                <TopTab.Screen 
                    name="Team"
                    component={TournamentTeam}
                    initialParams={{tournament:tournament, currentRole: currentRole, game: game}}
                />
                <TopTab.Screen 
                    name="Stats"
                    component={TournamentCricketStats}
                />
                <TopTab.Screen 
                    name="TournamentMatches"
                    component={TournamentMatches}
                    initialParams={{tournament:tournament, currentRole:currentRole, game: game}}
                />
                <TopTab.Screen 
                    name="Standing"
                    component={TournamentStanding}
                    initialParams={{tournament:tournament, currentRole:currentRole, game: game}}
                />
        </TopTab.Navigator>
    );
}
export default TopTabCricket;
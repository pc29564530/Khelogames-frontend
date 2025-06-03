import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentCricketInfo from '../screen/TournamentCricketInfo';
import TournamentMatches from '../screen/TournamentMatches';
import TournamentCricketStats from '../screen/TournamentCricketStats';
import TournamentTeam from '../screen/TournamentTeam';
import TournamentStanding from '../screen/TournamentStanding';

function TopTabCricket({tournament, currentRole, game}) {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                    screenOptions={{
                        tabBarLabelStyle:tailwind`text-gray-200 text-md w-18 `,
                        tabBarStyle:tailwind`bg-red-400`,
                        headerShown:true,
                        tabBarScrollEnabled:false,
                        tabBarIndicatorStyle: tailwind`bg-white`,
                        tabBarActiveTintColor: 'white',
                        tabBarInactiveTintColor:'gray'
                    }}
            >   
                <TopTab.Screen 
                    name="Details"
                    component={TournamentCricketInfo}
                    initialParams={{tournament:tournament}}
                />
                <TopTab.Screen 
                    name="Team"
                    component={TournamentTeam}
                    initialParams={{tournament:tournament, currentRole: currentRole}}
                />
                <TopTab.Screen 
                    name="Stats"
                    component={TournamentCricketStats}
                    initialParams={{tournament: tournament}}
                />
                <TopTab.Screen 
                    name="Matches"
                    component={TournamentMatches}
                    initialParams={{tournament:tournament, currentRole:currentRole}}
                />
                <TopTab.Screen 
                    name="Standing"
                    component={TournamentStanding}
                    initialParams={{tournament:tournament, currentRole:currentRole}}
                />
        </TopTab.Navigator>
    );
}
export default TopTabCricket;
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentCricketInfo from '../screen/TournamentCricketInfo';
import TournamentMatches from '../screen/TournamentMatches';
import TournamentCricketStats from '../screen/TournamentCricketStats';
import TournamentParticipants from '../screen/TournamentParticipants';
import TournamentStanding from '../screen/TournamentStanding';

function TopTabCricket({tournament, currentRole, parentScrollY, headerHeight, collapsedHeader}) {
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
                    component={(props) => (
                        <TournamentCricketInfo
                            {...props}
                            tournament={tournament}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                            />
                        )}
                />
                <TopTab.Screen
                    name="Team"
                    component={(props) => (
                        <TournamentParticipants
                            {...props}
                            tournament={tournament}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                            />
                        )}
                />
                <TopTab.Screen
                    name="Stats"
                    component={(props) => (
                        <TournamentCricketStats
                            {...props}
                            tournament={tournament}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                            />
                        )}
                />
                <TopTab.Screen
                    name="Matches"
                    component={(props) => (
                        <TournamentMatches
                            {...props}
                            tournament={tournament}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                            />
                        )}
                />
                <TopTab.Screen
                    name="Standing"
                    component={(props) => (
                        <TournamentStanding
                            {...props}
                            tournament={tournament}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                            />
                        )}
                />
        </TopTab.Navigator>
    );
}
export default TopTabCricket;
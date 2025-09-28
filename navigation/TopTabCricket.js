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
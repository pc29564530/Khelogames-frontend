import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentCricketInfo from '../screen/TournamentCricketInfo';
import TournamentMatches from '../screen/TournamentMatches';
import TournamentCricketStats from '../screen/TournamentCricketStats';
import TournamentParticipants from '../screen/TournamentParticipants';
import TournamentStanding from '../screen/TournamentStanding';

function TopTabBadminton({tournament,currentRole, parentScrollY, headerHeight, collapsedHeader}) {
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
                            zIndex:20,
                        },
                        tabBarLabelStyle: {
                            width:100,
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
                    name="Participants"
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
                {/* <TopTab.Screen
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
                /> */}
                {/* <TopTab.Screen
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
                /> */}
        </TopTab.Navigator>
    );
}
export default TopTabBadminton;
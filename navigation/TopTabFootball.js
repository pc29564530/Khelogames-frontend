import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentFootballInfo from '../screen/TournamentFootballInfo';
import TournamentFootballStats from '../screen/TournamentFootballStats';
import TournamentParticipants from '../screen/TournamentParticipants';
import TournamentStanding from '../screen/TournamentStanding';
import TournamentMatches from '../screen/TournamentMatches';
import { useSelector } from 'react-redux';
import { useAnimatedScrollHandler } from 'react-native-reanimated';
import TournamentFootballMatch from '../components/TournamentFootballMatch';

const TopTab = createMaterialTopTabNavigator();

function TopTabFootball({tournament, permissions, currentRole, parentScrollY, headerHeight, collapsedHeader}) {
    const game = useSelector(state => state.sportReducers.game);
    return (
        <TopTab.Navigator
        screenOptions={{
            headerShown: false,
            lazy: true,
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
                <TopTab.Screen name="Matches">
                    {() => (
                        <TournamentMatches
                            tournament={tournament}
                            permissions={permissions}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                        />
                    )}
                </TopTab.Screen>
                <TopTab.Screen name="Participants">
                    {() => (
                        <TournamentParticipants
                            tournament={tournament}
                            permissions={permissions}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                        />
                    )}
                </TopTab.Screen>
                <TopTab.Screen name="Stats">
                    {() => (
                        <TournamentFootballStats
                            tournament={tournament}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                        />
                    )}
                </TopTab.Screen>
                <TopTab.Screen name="Standing">
                    {() => (
                        <TournamentStanding
                            tournament={tournament}
                            permissions={permissions}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                        />
                    )}
                </TopTab.Screen>
        </TopTab.Navigator>
    );
}

export {TopTabFootball};
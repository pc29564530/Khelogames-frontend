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

function TopTabFootball({tournament, currentRole, parentScrollY, headerHeight, collapsedHeader}) {
    const TopTab = createMaterialTopTabNavigator();
    const game = useSelector(state => state.sportReducers.game);
    console.log("Header Height: ", headerHeight)
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
                <TopTab.Screen name="Matches">
                    {() => (
                        <TournamentMatches
                            tournament={tournament}
                            currentRole={currentRole}
                            parentScrollY={parentScrollY}
                            headerHeight={headerHeight}
                            collapsedHeader={collapsedHeader}
                        />
                    )}
                </TopTab.Screen>
                <TopTab.Screen name="Team">
                    {() => (
                        <TournamentParticipants
                            tournament={tournament}
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
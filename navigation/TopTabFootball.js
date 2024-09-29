import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentFootballInfo from '../screen/TournamentFootballInfo';
import TournamentFootballStats from '../screen/TournamentFootballStats';
import TournamentTeam from '../screen/TournamentTeam';
import TournamentStanding from '../screen/TournamentStanding';
import TournamentMatches from '../screen/TournamentMatches';

function TopTabFootball({tournament, currentRole, game}) {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-black text-md `,
                    tabBarStyle:tailwind`bg-white`,
                    headerShown:true,
                    tabBarScrollEnabled:true
                }}
                tabBarOptions={{
                    tabStyle: { width: 150 },
                    scrollEnabled: true,
                    indicatorStyle: tailwind`bg-red-400`,
                }}
            > 
                <TopTab.Screen 
                    name="Details"
                    component={TournamentFootballInfo}
                    initialParams={{tournament:tournament, game: game}}
                /> 
                <TopTab.Screen 
                    name="Team"
                    component={TournamentTeam}
                    initialParams={{tournament:tournament, currentRole:currentRole, game: game}}
                />
                <TopTab.Screen 
                    name="Stats"
                    component={TournamentFootballStats}
                    initialParams={{tournament:tournament, currentRole: currentRole, game: game}}
                />
                <TopTab.Screen  
                    name="Matches"
                    component={TournamentMatches}
                    initialParams={{tournament:tournament, currentRole: currentRole, game: game}}
                />
                <TopTab.Screen 
                    name="Standing"
                    component={TournamentStanding}
                    initialParams={{tournament:tournament, currentRole: currentRole, game: game}}
                />
        </TopTab.Navigator>
    );
}

export {TopTabFootball};
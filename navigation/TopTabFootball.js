import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentFootballInfo from '../screen/TournamentFootballInfo';
import TournamentMatches from '../screen/TournamentMatches';
import TournamentFootballStats from '../screen/TournamentFootballStats';
import TournamentTeam from '../screen/TournamentTeam';
import TournamentStanding from '../screen/TournamentStanding';

function TopTabFootball({tournament}) {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#e91e63',
                    tabBarLabelStyle: { fontSize: 16 },
                    tabBarStyle: { backgroundColor: 'powderblue' },
                    tabBarScrollEnabled:true
                }}
            >   
                <TopTab.Screen 
                    name="Info"
                    component={TournamentFootballInfo}
                    initialParams={{tournament:tournament}}
                /> 
                <TopTab.Screen 
                    name="Team"
                    component={TournamentTeam}
                    initialParams={{tournament:tournament}}
                />
                <TopTab.Screen 
                    name="Stats"
                    component={TournamentFootballStats}
                />
                <TopTab.Screen 
                    name="Matches"
                    component={TournamentMatches}
                    initialParams={{tournament:tournament}}
                />
                <TopTab.Screen 
                    name="Standing"
                    component={TournamentStanding}
                    initialParams={{tournament:tournament}}
                />
        </TopTab.Navigator>
    );
}

export {TopTabFootball};
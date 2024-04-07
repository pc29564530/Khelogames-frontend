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
                    tabBarLabelStyle:tailwind`text-black text-md`,
                    tabBarStyle:tailwind`bg-white`,
                    headerShown:true,
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
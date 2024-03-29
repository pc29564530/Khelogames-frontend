import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentFootballInfo from '../screen/TournamentFootballInfo';
import TournamentMatches from '../screen/TournamentMatches';
import TournamentFootballStats from '../screen/TournamentFootballStats';
import TournamentTeam from '../screen/TournamentTeam';

function TopTabFootball({tournament}) {
    const TopTab = createMaterialTopTabNavigator();
    console.log("TopTobFootball: ", tournament)
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
                    component={TournamentFootballInfo}
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
        </TopTab.Navigator>
    );
}

export {TopTabFootball};
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentFootballInfo from '../screen/TournamentFootballInfo';
import TournamentFootballStats from '../screen/TournamentFootballStats';
import TournamentParticipants from '../screen/TournamentParticipants';
import TournamentStanding from '../screen/TournamentStanding';
import TournamentMatches from '../screen/TournamentMatches';
import { useSelector } from 'react-redux';

function TopTabFootball({tournament, currentRole}) {
    const TopTab = createMaterialTopTabNavigator();
    const game = useSelector(state => state.sportReducers.game);
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
                    component={TournamentFootballInfo}
                    initialParams={{tournament:tournament}}
                /> 
                <TopTab.Screen 
                    name="Team"
                    component={TournamentParticipants}
                    initialParams={{tournament:tournament, currentRole:currentRole}}
                />
                <TopTab.Screen 
                    name="Stats"
                    component={TournamentFootballStats}
                    initialParams={{tournament:tournament, currentRole: currentRole}}
                />
                <TopTab.Screen  
                    name="Matches"
                    component={TournamentMatches}
                    initialParams={{tournament:tournament, currentRole: currentRole}}
                />
                <TopTab.Screen 
                    name="Standing"
                    component={TournamentStanding}
                    initialParams={{tournament:tournament, currentRole: currentRole}}
                />
        </TopTab.Navigator>
    );
}

export {TopTabFootball};
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentFootballInfo from '../screen/TournamentFootballInfo';
import TournamentFootballStats from '../screen/TournamentFootballStats';
import TournamentTeam from '../screen/TournamentTeam';
import TournamentStanding from '../screen/TournamentStanding';
import TournamentMatches from '../screen/TournamentMatches';
import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import TournamentCricketMatch from '../components/TournamentCricketMatch';

function TopTabFootball({currentRole}) {
    const TopTab = createMaterialTopTabNavigator();
    const {tournament} = useContext(GlobalContext)
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
                    name="Info"
                    component={TournamentFootballInfo}
                    initialParams={{tournament:tournament}}
                /> 
                <TopTab.Screen 
                    name="Team"
                    component={TournamentTeam}
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
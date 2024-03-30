import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentCricketInfo from '../screen/TournamentCricketInfo';
import TournamentMatches from '../screen/TournamentMatches';
import TournamentCricketStats from '../screen/TournamentCricketStats';
import TournamentTeam from '../screen/TournamentTeam';

function TopTabCricket({tournament}) {
    const TopTab = createMaterialTopTabNavigator();
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
                    component={TournamentCricketInfo}
                />
                <TopTab.Screen 
                    name="Team"
                    component={TournamentTeam}
                    initialParams={{tournament:tournament}}
                />
                <TopTab.Screen 
                    name="Stats"
                    component={TournamentCricketStats}
                />
                <TopTab.Screen 
                    name="Matches"
                    component={TournamentMatches}
                    initialParams={{tournament:tournament}}
                />
        </TopTab.Navigator>
    );
}
export default TopTabCricket;
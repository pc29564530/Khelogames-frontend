import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentStanding from '../screen/TournamentStanding';
import CricketTeamSquad from '../components/CricketTeamSquad';
import CricketMatchDetails from '../screen/CricketMatchDetail';

function CricketMatchPageContent({matchData}) {
    const TopTab = createMaterialTopTabNavigator();
    
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
                tabBarOptions={{
                    tabStyle: { width: 130},
                    scrollEnabled: true,
                    indicatorStyle: tailwind`bg-red-400`,
                }}
            > 
                <TopTab.Screen 
                    name="Detail"
                    component={CricketMatchDetails}
                    initialParams={{matchData:matchData}}
                />
                <TopTab.Screen 
                    name="Squad"
                    component={CricketTeamSquad}
                    initialParams={{matchData:matchData}}
                />
                <TopTab.Screen 
                    name="Standing"
                    component={TournamentStanding}
                    initialParams={{matchData: matchData}}
                />
        </TopTab.Navigator>
    );
}

export default CricketMatchPageContent;
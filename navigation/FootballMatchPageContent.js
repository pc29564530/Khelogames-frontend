import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentStanding from '../screen/TournamentStanding';
import FootballDetails from '../screen/FootballDetails';
import FootballLineUp from '../screen/FootballLineUp';

function FootballMatchPageContent({matchData}) {
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
                    tabStyle: { width: 130},
                    scrollEnabled: true,
                    indicatorStyle: tailwind`bg-red-400`,
                }}
            > 
                <TopTab.Screen 
                    name="Detail"
                    component={FootballDetails}
                    initialParams={{matchData:matchData}}
                />
                <TopTab.Screen 
                    name="LineUp"
                    component={FootballLineUp}
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

export default FootballMatchPageContent;
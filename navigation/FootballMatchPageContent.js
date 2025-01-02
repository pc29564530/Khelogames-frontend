import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentStanding from '../screen/TournamentStanding';
import FootballDetails from '../screen/FootballDetails';
import FootballLineUp from '../screen/FootballLineUp';
import FootballIncidents from '../screen/FootballIncidents';

function capitalizeFirstLetter(label) {
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

function FootballMatchPageContent({matchData}) {
    const TopTab = createMaterialTopTabNavigator();
    
    return (
        <TopTab.Navigator
                screenOptions={({ route }) => ({
                    tabBarLabelStyle:tailwind`text-gray-200 text-md w-18 `,
                    tabBarStyle:tailwind`bg-red-400`,
                    headerShown:true,
                    tabBarScrollEnabled:false,
                    tabBarIndicatorStyle: tailwind`bg-white`,
                    tabBarActiveTintColor: 'white',
                    tabBarInactiveTintColor:'gray'
                    })}
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
                    name="Incident"
                    component={FootballIncidents}
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
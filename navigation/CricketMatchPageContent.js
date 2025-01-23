import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentStanding from '../screen/TournamentStanding';
import CricketTeamSquad from '../components/CricketTeamSquad';
import CricketMatchDetails from '../screen/CricketMatchDetail';
import CricketScoreCard from '../components/CricketScoreCard';

function CricketMatchPageContent({matchData}) {
    const TopTab = createMaterialTopTabNavigator();
    console.log("match data: ", matchData)
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-gray-200 text-sm w-20 `,
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
                {matchData.status !== "not_started" && (
                    <TopTab.Screen 
                        name="Scorecard"
                        component={CricketScoreCard}
                        initialParams={{matchData:matchData}}
                    />
                )}
                
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
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentStanding from '../screen/TournamentStanding';
import CricketTeamSquad from '../components/CricketTeamSquad';
import CricketMatchDetails from '../screen/CricketMatchDetail';
import CricketScoreCard from '../components/CricketScoreCard';
import { useSelector } from 'react-redux';
import CricketLive from '../screen/CricketLiveScore';

function CricketMatchPageContent({match, parentScrollY, headerHeight, collapsedHeader}) {
    const TopTab = createMaterialTopTabNavigator();                                               
    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarScrollEnabled: true,
                tabBarStyle: { 
                backgroundColor: '#f87171',
                elevation: 4,
                shadowOpacity: 0.1,
                zIndex:20,
                },
                tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                textTransform: 'none',
                color: 'white',
                },
                tabBarItemStyle: {
                width: 86,
                },
                tabBarIndicatorStyle: {
                backgroundColor: '#fff',
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#ffe4e6',
            }}
        >
                <TopTab.Screen name="Details">
                        {() => (
                            <CricketMatchDetails
                                match={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>
                    {match.status_code !== "not_started" && (
                        <TopTab.Screen name="Live">
                            {() => (
                                <CricketLive
                                    match={match}
                                    parentScrollY={parentScrollY}
                                    headerHeight={headerHeight}
                                    collapsedHeader={collapsedHeader}
                                />
                            )}
                        </TopTab.Screen>
                    )}

                    <TopTab.Screen name="ScoreCard">
                        {() => (
                            <CricketScoreCard
                                match={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>

                    <TopTab.Screen name="Squad">
                        {() => (
                            <CricketTeamSquad
                                match={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>

                    <TopTab.Screen name="Standing">
                        {() => (
                            <TournamentStanding
                                match={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>
        </TopTab.Navigator>
    );
}

export default CricketMatchPageContent;
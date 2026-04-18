import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import TournamentStanding from '../screen/TournamentStanding';
import CricketTeamSquad from '../components/CricketTeamSquad';
import CricketMatchDetails from '../screen/CricketMatchDetail';
import CricketScoreCard from '../components/CricketScoreCard';
import { useSelector } from 'react-redux';
import CricketLive from '../screen/CricketLiveScore';
import MediaScreen from '../screen/Media';

function CricketMatchPageContent({match, parentScrollY, headerHeight, collapsedHeader}) {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1e293b',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#334155',
                    zIndex:20,
                },
                tabBarLabelStyle: {
                    width:100,
                    fontSize: 14,
                    fontWeight: '600',
                    textTransform: 'none',
                },
                tabBarIndicatorStyle: {
                    backgroundColor: '#f87171',
                    height: 3,
                    borderRadius: 2,
                },
                tabBarActiveTintColor: '#f1f5f9',
                tabBarInactiveTintColor: '#64748b',
            }}
        >
                <TopTab.Screen name="Overview">
                        {() => (
                            <CricketMatchDetails
                                match={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>
                    {match?.status_code === "in_progress" && (
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

                    {match?.status_code !== "not_started" && (
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
                    )}

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

                    <TopTab.Screen name="Media">
                        {() => (
                            <MediaScreen
                                item={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen>

                    {/* <TopTab.Screen name="Standing">
                        {() => (
                            <TournamentStanding
                                match={match}
                                parentScrollY={parentScrollY}
                                headerHeight={headerHeight}
                                collapsedHeader={collapsedHeader}
                            />
                        )}
                    </TopTab.Screen> */}
        </TopTab.Navigator>
    );
}

export default CricketMatchPageContent;
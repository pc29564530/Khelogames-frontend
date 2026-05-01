import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FootballPlayerStats from "../components/FootballPlayerStats";
import CricketPlayerStats from "../components/CricketPlayerStats";
import BadmintonPlayerStats from "../components/BadmintonPlayerStats";
import PlayerDetails from "../screen/PlayerDetails";

const TopTab = createMaterialTopTabNavigator();

const TopTabPlayer = ({ player, game, parentScrollY, headerHeight, collapsedHeader }) => {

  const renderCareerTab = () => {
    switch (player?.game_id) {
      case 1:
        return (props) => (
          <FootballPlayerStats
            {...props}
            player={player}
            parentScrollY={parentScrollY}
            headerHeight={headerHeight}
            collapsedHeader={collapsedHeader}
          />
        );
      case 2:
        return (props) => (
          <CricketPlayerStats
            {...props}
            player={player}
            parentScrollY={parentScrollY}
            headerHeight={headerHeight}
            collapsedHeader={collapsedHeader}
          />
        );
      case 3:
        return (props) => (
          <BadmintonPlayerStats 
            {...props}
            player={player}
            parentScrollY={parentScrollY}
            headerHeight={headerHeight}
            collapsedHeader={collapsedHeader}
          />
        )
      default:
        return () => null;
    }
  };

  return (
    <TopTab.Navigator
          screenOptions={{
                headerShown: false,
                lazy: true,
                tabBarStyle: {
                    backgroundColor: '#1e293b',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#334155',
                    zIndex: 20,
                },
                tabBarLabelStyle: {
                    width: 100,
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
      <TopTab.Screen name="Details">
        {(props) => (
          <PlayerDetails
            {...props}
            player={player}
            parentScrollY={parentScrollY}
            headerHeight={headerHeight}
            collapsedHeader={collapsedHeader}
          />
        )}
      </TopTab.Screen>
      <TopTab.Screen name="Career" component={renderCareerTab()} />
    </TopTab.Navigator>
  );
};

export default TopTabPlayer;

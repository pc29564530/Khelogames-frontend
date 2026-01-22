import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FootballPlayerStats from "../components/FootballPlayerStats";
import CricketPlayerStats from "../components/CricketPlayerStats";
import PlayerDetails from "../screen/PlayerDetails";
// import PlayerMatches from "../components/PlayerMatches";

const TopTabPlayer = ({ player, parentScrollY, headerHeight, collapsedHeader }) => {
  const TopTab = createMaterialTopTabNavigator();

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
      default:
        return () => null;
    }
  };

  return (
    <TopTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#f87171", // red-400
          elevation: 4,
          shadowOpacity: 0.2,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          textTransform: "none",
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#fff",
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ffe4e6",
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
    {/* Match history by player  */}
      {/* <TopTab.Screen name="Matches">
        {(props) => (
          <PlayerMatches
            {...props}
            player={player}
            parentScrollY={parentScrollY}
            headerHeight={headerHeight}
            collapsedHeader={collapsedHeader}
          />
        )}
      </TopTab.Screen> */}

      <TopTab.Screen name="Career" component={renderCareerTab()} />
    </TopTab.Navigator>
  );
};

export default TopTabPlayer;

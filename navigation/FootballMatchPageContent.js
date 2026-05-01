// //This page is of no use
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import tailwind from 'twrnc';
// import TournamentStanding from '../screen/TournamentStanding';
// import FootballDetails from '../screen/FootballDetails';
// import FootballLineUp from '../screen/FootballLineUp';
// import FootballIncidents from '../screen/FootballIncidents';

// function capitalizeFirstLetter(label) {
//     return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
// }

// function FootballMatchPageContent({matchData}) {
//     const TopTab = createMaterialTopTabNavigator();
    
//     return (
//         <TopTab.Navigator
//                 screenOptions={{
//                     headerShown: false,
//                     tabBarStyle: {
//                         backgroundColor: '#1e293b',
//                         elevation: 0,
//                         shadowOpacity: 0,
//                         borderBottomWidth: 1,
//                         borderBottomColor: '#334155',
//                         zIndex:20,
//                     },
//                     tabBarLabelStyle: {
//                         width:100,
//                         fontSize: 14,
//                         fontWeight: '600',
//                         textTransform: 'none',
//                     },
//                     tabBarIndicatorStyle: {
//                         backgroundColor: '#f87171',
//                         height: 3,
//                         borderRadius: 2,
//                     },
//                     tabBarActiveTintColor: '#f1f5f9',
//                     tabBarInactiveTintColor: '#64748b',
//                 }}
//                 tabBarOptions={{
//                     tabStyle: { width: 130},
//                     scrollEnabled: true,
//                     indicatorStyle: tailwind`bg-red-400`,
//                 }}
//             > 
//                 <TopTab.Screen 
//                     name="Detail"
//                     component={FootballDetails}
//                     initialParams={{matchData:matchData}}
//                 />
//                 {matchData.status !== "not_started" && (
//                     <TopTab.Screen
//                         name="Incident"
//                         component={FootballIncidents}
//                         initialParams={{matchData:matchData}}
//                     />
//                 )}
//                 <TopTab.Screen 
//                     name="LineUp"
//                     component={FootballLineUp}
//                     initialParams={{matchData:matchData}}
//                 />
//                 <TopTab.Screen 
//                     name="Standing"
//                     component={TournamentStanding}
//                     initialParams={{matchData: matchData}}
//                 />
//         </TopTab.Navigator>
//     );
// }

// export default FootballMatchPageContent;
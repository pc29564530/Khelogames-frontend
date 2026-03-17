import React,{useState} from 'react';
import { Modal, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Home from '../screen/Home';
import Community from '../screen/Community';
import AddContent from '../components/AddContent';
import tailwind from 'twrnc';
import Tournament from '../screen/Tournament';
import Matches from '../screen/Matches';
import Club from '../screen/Club';
import Thread from '../screen/Thread';

const Tab = createBottomTabNavigator();

const BottomTab = () => {

 const navigation = useNavigation();
 const [isModalVisible, setIsModalVisible] = useState(false);

 const handleAddContentPress = () => {
   setIsModalVisible(true);
 };

 const closeModal = () => {
   setIsModalVisible(false);
 };

 return (
   <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarShowLabel: true,
        tabBarActiveTintColor: '#f87171',
        tabBarInactiveTintColor: '#64748b',

        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 65,
          paddingTop: 6,
          paddingBottom: 10,
          backgroundColor: "#1e293b",

          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,

          elevation: 12,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },

        tabBarIconStyle: {
          marginTop: 2,
        },

        tabBarIcon: ({ focused }) => {
          const color = focused ? '#f87171' : '#64748b';
          const size = 22;

          if (route.name === "Trending") {
            return <MaterialIcons name="local-fire-department" size={size} color={color} />;
          }

          if (route.name === "Matches") {
            return <MaterialIcons name="sports-soccer" size={size} color={color} />;
          }

          if (route.name === "Tournament") {
            return <FontAwesome name="trophy" size={size} color={color} />;
          }

          if (route.name === "Team") {
            return <MaterialIcons name="groups" size={size} color={color} />;
          }

          if (route.name === "Thread") {
            return <Ionicons name="newspaper-outline" size={size} color={color} />;
          }

          if (route.name === "Community") {
            return <MaterialIcons name="forum" size={size} color={color} />;
          }
        },
      })}
    >
     <Tab.Screen name="Trending" component={Home} />
     <Tab.Screen name="Matches" component={Matches} 
      listeners={() => ({
        tabPress: (e) => {
          e.preventDefault();
          navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [{name: 'Matches'}]
          }))
        }
      })}
     />
     <Tab.Screen name="Tournament" component={Tournament} />
     <Tab.Screen name="Team" component={Club}/>
     <Tab.Screen name="Thread" component={Thread} />
     <Tab.Screen name="Community" component={Community} />
   </Tab.Navigator>
 );
};

export default BottomTab;
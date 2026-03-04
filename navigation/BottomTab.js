import React,{useState} from 'react';
import { Modal, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Home from '../screen/Home';
import Community from '../screen/Community';
import AddContent from '../components/AddContent';
import tailwind from 'twrnc';
import AddContentStack from './AddContentStack';
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
   <>
   <Tab.Navigator
     screenOptions={({route})=> ({
       headerTitle: null,
       headerTransparent: true,
       headerShown: false,
       headerLeft: null,
       headerBackTitleVisible: false,
       tabBarShowLabel: true,
       tabBarActiveTintColor: '#f87171',
       tabBarInactiveTintColor: '#475569',
       tabBarStyle: {
         position: 'absolute',
         bottom: 0,
         width: '100%',
         backgroundColor: '#0f172a',
         borderTopWidth: 1,
         borderTopColor: '#1e293b',
         paddingTop: 4,
         elevation: 0,
         shadowOpacity: 0,
       },
       tabBarLabelStyle: {
         fontSize: 10,
         fontWeight: '600',
       },
       tabBarIcon: ({focused, size, color}) => {
        const activeStatus = focused ? '#f87171' : '#475569'
         let Icon;
         if(route.name === "Home"){
           Icon=<FontAwesome name="home" size={25} color={activeStatus}/>;
         } else if(route.name === "Matches"){
            Icon = <MaterialIcons name="schedule" size={25} color={activeStatus}/>
         } else if(route.name === "Community"){
           Icon = <MaterialIcons name="forum" size={25} color={activeStatus}/>
         } else if(route.name === "Add") {
           Icon = <MaterialIcons name="add-box" size={25} color={activeStatus}/>;
         } else if(route.name === "Tournament") {
           Icon = <FontAwesome name="trophy" size={25} color={activeStatus}/>;
         } else if(route.name === "Team") {
           Icon = <MaterialIcons name="groups" size={25} color={activeStatus}/>;
         } else if(route.name === "Thread") {
          Icon = <Ionicons name="newspaper-outline" size={25} color={activeStatus}/>;
         }
         return Icon;
       } 
   })}
   >
     <Tab.Screen name="Home" component={Home} />
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
     <Tab.Screen
       name="Add"
       component={AddContentStack}
      listeners={() => ({
        tabPress: (e) => {
           e.preventDefault();
           handleAddContentPress();
        },
        })}
     />
     <Tab.Screen name="Community" component={Community} />
   </Tab.Navigator>

   <Modal
     transparent={true}
     animationType="slide"
     visible={isModalVisible}
     onRequestClose={closeModal}
   >
     <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
       <View style={{ padding: 24, backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: '#334155' }}>
         <AddContent closeModal={closeModal} navigation={navigation}/>
       </View>
     </View>
   </Modal>
 </>
 );
};

export default BottomTab;
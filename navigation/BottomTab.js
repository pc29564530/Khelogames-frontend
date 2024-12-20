import React,{useState} from 'react';
import { Modal, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Home from '../screen/Home';
import Community from '../screen/Community';
import AddContent from '../components/AddContent';
import tailwind from 'twrnc';
import AddContentStack from './AddContentStack';
import Tournament from '../screen/Tournament';
import Matches from '../screen/Matches';

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
       tabBarStyle: tailwind`absolute bottom-0 w-full bg-black text-white p-1`,
       tabBarIcon: () => {
         let Icon;
         if(route.name === "Home"){
           Icon=<FontAwesome name="home" size={25} color="white" />;
         } else if(route.name === "Matches"){
            Icon = <MaterialIcons name="schedule" size={25} color="white" />
         } else if(route.name === "Community"){
           Icon = <MaterialIcons name="forum" size={25} color="white"/>;
         } else if(route.name === "Add") {
           Icon = <MaterialIcons name="add-box" size={25} color="white"/>;
         } else if(route.name === "Tournament") {
           Icon = <FontAwesome name="trophy" size={25} color="white" />;
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
     <Tab.Screen name="Community" component={Community} />
     <Tab.Screen name="Tournament" component={Tournament} />
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
   </Tab.Navigator>

   <Modal
     transparent={true}
     animationType="slide"
     visible={isModalVisible}
     onRequestClose={closeModal}
   >
     <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
       <View style={tailwind`p-10 bg-white rounded-xl`}>
         <AddContent closeModal={closeModal} navigation={navigation}/>
       </View>
     </View>
   </Modal>
 </>
 );
};

export default BottomTab;
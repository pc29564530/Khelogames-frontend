import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Modal, StyleSheet, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Home from './Home';
import Community from './Community';
import AddContent from './AddContent';
import Follow from './Follow';
import tailwind from 'twrnc';

const Tab = createBottomTabNavigator();

const Footer = () => {
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
            } else if(route.name === "Community"){
              Icon = <MaterialIcons name="forum" size={25} color="white"/>;
            } else if(route.name === "AddContent") {
              Icon = <MaterialIcons name="add-box" size={25} color="white"/>;
            } else if(route.name === "Follow") {
              Icon = <MaterialIcons  name="connect-without-contact" size={25} color="white"/>;
            }
            return Icon;
          }  
      })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Community" component={Community} />
        <Tab.Screen name="Follow" component={Follow} />
        <Tab.Screen
          name="AddContent"
          component={AddContent}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleAddContentPress();
            },
          }}
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
            <AddContent closeModal={closeModal} />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Footer;

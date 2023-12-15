import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import BottomTab from './BottomTab';
const KhelogamesLogo = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

const Stack = createStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName='DrawerNavigation'
      screenOptions={{
        header: ({ navigation }) => {
          return (
            <View style={tailwind`bg-white h-15 flex-row items-center justify-between px-4 bg-black`}>
              <Image source={KhelogamesLogo} style={tailwind`h-16 w-16`} />
              <View style={tailwind`flex-row items-center`}>
                <FontAwesome
                  name="search"
                  size={24}
                  color="white"
                />
                <MaterialIcons
                  name="message"
                  size={24}
                  color="white"
                />
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                  <FontAwesome name="bars" color="white" size={24} />
                </TouchableOpacity>
              </View>
            </View>
          );
        },
      }}
    >
      <Stack.Screen
        name="BottomTab"
        component={BottomTab}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;

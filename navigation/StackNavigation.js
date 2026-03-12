import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import BottomTab from './BottomTab';

const Stack = createStackNavigator();

const StackNavigation = () => {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        header: () => (
          <View
            style={{
              height: 56,
              backgroundColor: '#1e293b',
              borderBottomColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16
            }}
          >
            {/* Logo */}
            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '800' }}>
              Kridagram
            </Text>

            {/* Right Icons */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              <FontAwesome name="search" size={20} color="#f1f5f9" />

              <TouchableOpacity onPress={() => navigation.navigate("MessagePage")}>
                <MaterialIcons name="message" size={22} color="#f1f5f9" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <FontAwesome name="bars" size={20} color="#f1f5f9" />
              </TouchableOpacity>
            </View>
          </View>
        )
      }}
    >
      <Stack.Screen
        name="BottomTab"
        component={BottomTab}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;
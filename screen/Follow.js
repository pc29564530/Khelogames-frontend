import React from 'react';
import { Pressable } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import Follower from './Follower';
import Following from './Following';

const TopTab = createMaterialTopTabNavigator();

function Follow() {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Connections',
      headerStyle: {
        backgroundColor: '#0f172a',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#f1f5f9',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f1f5f9',
      },
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          style={tailwind`ml-4 p-2`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AntDesign name="arrowleft" size={22} color="#f1f5f9" />
        </Pressable>
      ),
    });
  }, [navigation]);

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
      <TopTab.Screen name="Followers" component={Follower} />
      <TopTab.Screen name="Following" component={Following} />
    </TopTab.Navigator>
  );
}

export default Follow;
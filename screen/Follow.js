import React from 'react';
import { Pressable } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import Follower from './Follower';
import Following from './Following';

const TopTab = createMaterialTopTabNavigator();

/**
 * Follow Screen
 * Tab navigator for Followers and Following lists
 */
function Follow() {
  const navigation = useNavigation();

  // Configure header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Connections',
      headerStyle: {
        backgroundColor: '#f87171',
        elevation: 2,
        shadowOpacity: 0.1,
      },
      headerTintColor: '#ffffff',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
      },
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          style={tailwind`ml-4 p-2`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AntDesign name="arrowleft" size={22} color="white" />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
          textTransform: 'capitalize',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#ef4444',
          height: 3,
        },
        tabBarPressColor: 'rgba(239, 68, 68, 0.1)',
      }}
    >
      <TopTab.Screen name="Followers" component={Follower} />
      <TopTab.Screen name="Following" component={Following} />
    </TopTab.Navigator>
  );
}

export default Follow;
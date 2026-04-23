import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { version as appVersion } from '../package.json';
import { logoutServies } from '../services/authServies';

const Settings = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation();

  const handleLogout = () => {
      logoutServies({ dispatch });
  };

  const Section = ({ title, children }) => (
    <View style={tailwind`mt-5`}>
      <Text
        style={{
          color: '#94a3b8',
          fontSize: 12,
          fontWeight: '700',
          paddingHorizontal: 18,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>

      <View
        style={[
          tailwind`mx-4 rounded-2xl overflow-hidden`,
          {
            backgroundColor: '#1e293b',
            borderWidth: 1,
            borderColor: '#334155',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );

  const Row = ({ icon, label, value, onPress, danger }) => (
    <Pressable
      onPress={onPress}
      style={[
        tailwind`flex-row items-center px-4 py-4`,
        { borderBottomWidth: 1, borderBottomColor: '#334155' },
      ]}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={danger ? '#ef4444' : '#94a3b8'}
      />

      <Text
        style={{
          flex: 1,
          marginLeft: 12,
          color: danger ? '#ef4444' : '#f8fafc',
          fontSize: 15,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>

      {value && (
        <Text style={{ color: '#64748b', marginRight: 8 }}>{value}</Text>
      )}

      <MaterialIcons name="chevron-right" size={20} color="#475569" />
    </Pressable>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: () => (
            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>
                Settings
            </Text>
        ),
        headerStyle: {
        backgroundColor: '#1e293b',
        elevation: 0,
        shadowOpacity: 0,
        },
        headerTintColor: '#e2e8f0',
        headerTitleAlign: 'center',
        headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
            <AntDesign name="arrowleft" size={22} color="#e2e8f0" />
        </Pressable>
        ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Account */}
        <Section title="Account">
          <Row
            icon="person-outline"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          {/* <Row
            icon="delete-outline"
            label="Delete Account"
            danger
            onPress={() =>
              Alert.alert(
                'Delete Account',
                'Email support@kridagram.com to request deletion.',
              )
            }
          /> */}
        </Section>

        {/* Legal */}
        <Section title="Legal">
          <Row
            icon="privacy-tip"
            label="Privacy Policy"
            onPress={() => navigation.navigate('LegalDoc', { type: 'privacy' })}
          />
          <Row
            icon="description"
            label="Terms of Use"
            onPress={() => navigation.navigate('LegalDoc', { type: 'terms' })}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <Row
            icon="info-outline"
            label="App Version"
            value={`v${appVersion}`}
            onPress={() => {}}
          />
        </Section>

        {/* Logout */}
        <Section title="Session">
          <Row
            icon="logout"
            label="Logout"
            danger
            onPress={handleLogout}
          />
        </Section>

        <Text
          style={{
            textAlign: 'center',
            color: '#475569',
            marginTop: 28,
            fontSize: 12,
          }}
        >
          KheloGames • Version {appVersion}
        </Text>
      </ScrollView>
    </View>
  );
};

export default Settings;
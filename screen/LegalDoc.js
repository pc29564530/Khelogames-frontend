import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LEGAL_DOCS } from '../constants/legalContent';

const LegalDoc = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const type = route?.params?.type;
  const doc = LEGAL_DOCS[type];

  useLayoutEffect(() => {
      navigation.setOptions({
          headerTitle: () => (
          <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>
            {doc?.title ?? 'Document'}
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
          <Pressable
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Settings')
            }
            style={tailwind`items-center justify-center w-10 h-10`}
          >
            <AntDesign name="arrowleft" size={20} color="#f1f5f9" />
          </Pressable>
          ),
      });
  }, [navigation, doc]);

  if (!doc) {
    return (
      <View style={[tailwind`flex-1 items-center justify-center`, { backgroundColor: '#0f172a' }]}>
        <Text style={{ color: '#f1f5f9' }}>Document not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>
          Last updated: {doc.lastUpdated}
        </Text>

        {doc.intro && (
          <Text
            style={{
              color: '#cbd5e1',
              fontSize: 14,
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            {doc.intro}
          </Text>
        )}

        {doc.sections.map((section) => (
          <View key={section.heading} style={tailwind`mb-5`}>
            <Text
              style={{
                color: '#f1f5f9',
                fontSize: 15,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              {section.heading}
            </Text>
            {section.body.map((para, idx) => (
              <Text
                key={idx}
                style={{
                  color: '#94a3b8',
                  fontSize: 13,
                  lineHeight: 20,
                  marginBottom: idx < section.body.length - 1 ? 8 : 0,
                }}
              >
                {para}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default LegalDoc;

import React, { useState } from 'react';
import { Pressable, View, TextInput, Text, ScrollView, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { addCommunity } from '../redux/actions/actions';
import { createNewCommunity } from '../services/communityServices';
import { validateCommunityForm } from '../utils/validation/communityValidation';

function CreateCommunity() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ global: null, fields: {} });

    const handleCreateCommunity = async () => {
        try {
            setLoading(true);
            setError({ global: null, fields: {} });

            const formData = { name, description };

            const validation = validateCommunityForm(formData);
            if (!validation.isValid) {
                setError({ global: null, fields: validation.errors });
                return;
            }

            const response = await createNewCommunity({ formData });
            dispatch(addCommunity(response.data));
            setName('');
            setDescription('');
            navigation.goBack();
        } catch (err) {
            const backendErrors = err.response?.data?.error?.fields || {};
            setError({
                global: 'Unable to create community.',
                fields: backendErrors,
            });
            console.log('Unable to create community: ', err);
        } finally {
            setLoading(false);
        }
    };

    navigation.setOptions({
        headerTitle: '',
        headerStyle: { backgroundColor: '#f87171' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-3 p-1`} hitSlop={10}>
                <AntDesign name="arrowleft" size={22} color="white" />
            </Pressable>
        ),
    });

    return (
        <ScrollView
            style={tailwind`flex-1 bg-gray-50`}
            contentContainerStyle={tailwind`p-4`}
            keyboardShouldPersistTaps="handled"
        >
            {/* Hero banner */}
            <View style={[
                tailwind`bg-red-400 rounded-2xl p-5 mb-5 flex-row items-center`,
                { shadowColor: '#f87171', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
            ]}>
                <View style={tailwind`w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4`}>
                    <MaterialIcons name="group-add" size={26} color="white" />
                </View>
                <View style={tailwind`flex-1`}>
                    <Text style={tailwind`text-white text-base font-bold mb-0.5`}>Create a Community</Text>
                    <Text style={tailwind`text-red-100 text-xs`}>
                        Connect sports people with a shared passion.
                    </Text>
                </View>
            </View>

            {/* Global error */}
            {error.global && (
                <View style={tailwind`flex-row items-center bg-red-50 border border-red-200 rounded-xl p-3 mb-4`}>
                    <MaterialIcons name="error-outline" size={16} color="#ef4444" />
                    <Text style={tailwind`text-red-600 text-sm ml-2 flex-1`}>{error.global}</Text>
                </View>
            )}

            {/* Form card */}
            <View style={[
                tailwind`bg-white rounded-2xl p-5`,
                { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
            ]}>
                {/* Name field */}
                <View style={tailwind`mb-5`}>
                    <Text style={tailwind`text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2`}>
                        Community Name *
                    </Text>
                    <TextInput
                        style={[
                            tailwind`bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900`,
                            { borderWidth: 1, borderColor: error.fields?.name ? '#f87171' : '#e5e7eb' },
                        ]}
                        value={name}
                        onChangeText={(v) => {
                            setName(v);
                            if (error.fields?.name) setError(prev => ({ ...prev, fields: { ...prev.fields, name: null } }));
                        }}
                        placeholder="e.g. Mumbai Cricket Club"
                        placeholderTextColor="#9ca3af"
                        maxLength={60}
                        returnKeyType="next"
                    />
                    {error.fields?.name && (
                        <Text style={tailwind`text-red-500 text-xs mt-1.5 ml-1`}>
                            * {error.fields.name}
                        </Text>
                    )}
                    <Text style={tailwind`text-gray-400 text-xs mt-1.5 ml-1 text-right`}>
                        {name.length}/60
                    </Text>
                </View>

                {/* Description field */}
                <View>
                    <Text style={tailwind`text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2`}>
                        Description
                    </Text>
                    <TextInput
                        style={[
                            tailwind`bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900`,
                            { borderWidth: 1, borderColor: error.fields?.description ? '#f87171' : '#e5e7eb', minHeight: 90, textAlignVertical: 'top' },
                        ]}
                        value={description}
                        onChangeText={(v) => {
                            setDescription(v);
                            if (error.fields?.description) setError(prev => ({ ...prev, fields: { ...prev.fields, description: null } }));
                        }}
                        placeholder="What is this community about?"
                        placeholderTextColor="#9ca3af"
                        multiline
                        maxLength={200}
                    />
                    {error.fields?.description && (
                        <Text style={tailwind`text-red-500 text-xs mt-1.5 ml-1`}>
                            * {error.fields.description}
                        </Text>
                    )}
                    <Text style={tailwind`text-gray-400 text-xs mt-1.5 ml-1 text-right`}>
                        {description.length}/200
                    </Text>
                </View>
            </View>

            {/* Create button */}
            <Pressable
                onPress={handleCreateCommunity}
                disabled={loading}
                style={[
                    tailwind`mt-5 rounded-2xl py-4 items-center flex-row justify-center`,
                    loading ? tailwind`bg-gray-300` : tailwind`bg-red-400`,
                    { shadowColor: '#f87171', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
                ]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <>
                        <MaterialIcons name="group-add" size={18} color="white" />
                        <Text style={tailwind`text-white font-bold text-base ml-2`}>
                            Create Community
                        </Text>
                    </>
                )}
            </Pressable>

            <Text style={tailwind`text-center text-gray-400 text-xs mt-4`}>
                You'll be the admin of this community.
            </Text>
        </ScrollView>
    );
}

export default CreateCommunity;

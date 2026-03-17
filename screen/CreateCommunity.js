import React, { useState, useLayoutEffect } from 'react';
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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
                Create Community
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
                <AntDesign name="arrowleft" size={24} color="#e2e8f0" />
            </Pressable>
            ),
        });
    }, [navigation]);

    return (

        <ScrollView
            style={{ flex: 1, backgroundColor: '#0f172a' }}
            contentContainerStyle={tailwind`p-4`}
            keyboardShouldPersistTaps="handled"
        >

            {/* Hero Banner */}

            <View
                style={[
                    tailwind`rounded-2xl p-5 mb-5 flex-row items-center`,
                    { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }
                ]}
            >

                <View
                    style={[
                        tailwind`w-12 h-12 rounded-full items-center justify-center mr-4`,
                        { backgroundColor: '#1e293b' }
                    ]}
                >
                    <MaterialIcons name="group-add" size={26} color="#f87171" />
                </View>

                <View style={tailwind`flex-1`}>

                    <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700' }}>
                        Create a Community
                    </Text>

                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                        Connect sports people with a shared passion.
                    </Text>

                </View>

            </View>


            {/* Global Error */}

            {error.global && (

                <View
                    style={[
                        tailwind`flex-row items-center rounded-xl p-3 mb-4`,
                        { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#ef4444' }
                    ]}
                >

                    <MaterialIcons name="error-outline" size={16} color="#f87171" />

                    <Text style={{ color: '#f87171', marginLeft: 8, flex: 1 }}>
                        {error.global}
                    </Text>

                </View>

            )}


            {/* Form Card */}

            <View
                style={[
                    tailwind`rounded-2xl p-5`,
                    { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }
                ]}
            >

                {/* Name */}

                <View style={tailwind`mb-5`}>

                    <Text
                        style={{
                            color: '#94a3b8',
                            fontSize: 12,
                            fontWeight: '600',
                            marginBottom: 6
                        }}
                    >
                        COMMUNITY NAME *
                    </Text>

                    <TextInput
                        style={[
                            tailwind`rounded-xl px-4 py-3 text-sm`,
                            {
                                backgroundColor: '#020617',
                                color: '#f1f5f9',
                                borderWidth: 1,
                                borderColor: error.fields?.name ? '#f87171' : '#334155'
                            }
                        ]}
                        value={name}
                        onChangeText={(v) => {

                            setName(v);

                            if (error.fields?.name)
                                setError(prev => ({
                                    ...prev,
                                    fields: { ...prev.fields, name: null }
                                }));

                        }}
                        placeholder="e.g. Mumbai Cricket Club"
                        placeholderTextColor="#64748b"
                        maxLength={60}
                        returnKeyType="next"
                    />

                    {error.fields?.name && (
                        <Text style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>
                            * {error.fields.name}
                        </Text>
                    )}

                    <Text
                        style={{
                            color: '#64748b',
                            fontSize: 11,
                            marginTop: 6,
                            textAlign: 'right'
                        }}
                    >
                        {name.length}/60
                    </Text>

                </View>


                {/* Description */}

                <View>

                    <Text
                        style={{
                            color: '#94a3b8',
                            fontSize: 12,
                            fontWeight: '600',
                            marginBottom: 6
                        }}
                    >
                        DESCRIPTION
                    </Text>

                    <TextInput
                        style={[
                            tailwind`rounded-xl px-4 py-3 text-sm`,
                            {
                                backgroundColor: '#020617',
                                color: '#f1f5f9',
                                borderWidth: 1,
                                borderColor: error.fields?.description ? '#f87171' : '#334155',
                                minHeight: 90,
                                textAlignVertical: 'top'
                            }
                        ]}
                        value={description}
                        onChangeText={(v) => {

                            setDescription(v);

                            if (error.fields?.description)
                                setError(prev => ({
                                    ...prev,
                                    fields: { ...prev.fields, description: null }
                                }));

                        }}
                        placeholder="What is this community about?"
                        placeholderTextColor="#64748b"
                        multiline
                        maxLength={200}
                    />

                    {error.fields?.description && (
                        <Text style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>
                            * {error.fields.description}
                        </Text>
                    )}

                    <Text
                        style={{
                            color: '#64748b',
                            fontSize: 11,
                            marginTop: 6,
                            textAlign: 'right'
                        }}
                    >
                        {description.length}/200
                    </Text>

                </View>

            </View>


            {/* Create Button */}
            <Pressable
                onPress={handleCreateCommunity}
                disabled={loading}
                style={[
                    tailwind`mt-5 rounded-2xl py-4 items-center flex-row justify-center`,
                    loading ? { backgroundColor: '#334155' } : {backgroundColor: '#ef4444'}
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


            <Text
                style={{
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: 12,
                    marginTop: 16
                }}
            >
                You'll be the admin of this community.
            </Text>

        </ScrollView>
    );
}

export default CreateCommunity;
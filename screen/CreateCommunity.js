import React, {useState, useEffect} from 'react';
import {Pressable, View, TextInput, Text } from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector, useDispatch } from 'react-redux';
import { addCommunity } from '../redux/actions/actions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createNewCommunity } from '../services/communityServices';
import { validateCommunityForm } from '../utils/validation/communityValidation';
import { handleInlineError } from '../utils/errorHandler';

function CreateCommunity () {
    const navigation = useNavigation();
    
    const [name, setName] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [description, setDescription] = useState('');
    const dispatch = useDispatch();
    const community = useSelector((state) => state.community.community);

    const handleCreateCommunity = async () => {
        try {
            // Clear previous errors
            setError({
                global: null,
                fields: {},
            });

            const formData = {
                name,
                description,
            }

            const validation = validateCommunityForm(formData)
            console.log("Validation: ", validation)
            if(!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors,
                })
                return
            }
            const response = await createNewCommunity({formData: formData})
            dispatch(addCommunity(response.data));
            setName('');
            setDescription('');
            navigation.goBack();
        } catch (err) {
            const backendErrors = err.response?.data?.error?.fields || {};
            setError({
                global: "Unable to create community",
                fields: backendErrors,
            })
            console.error("Unable to create community: ", err);
        }
    }

    navigation.setOptions({
        headerTitle: '',
        headerStyle:{
            backgroundColor:tailwind.color('bg-red-400')
        },
        headerTintColor: tailwind.color('bg-white'),
        headerLeft: ()=> (
            <View style={tailwind`flex-row items-center gap-35 p-2`}>
                <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
            </View>
        ),
        headerRight:() => (
            <View style={tailwind`flex-row items-center mr-2 gap-18`}>
                <Pressable style={tailwind`p-2`} onPress={() => handleCreateCommunity()}>
                    <MaterialIcons name="send" size={24} color="white" />
                </Pressable>
            </View>
        ),
    });

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <View>
                <View style={tailwind`m-5 p-6`}>
                    <Text style={tailwind`text-xl text-black`} >Create a New Community</Text>
                    <Text style={tailwind`mb-5 text-black`}>This is place where a people with similar field area connect with each other.</Text>
                </View>
                <View style={tailwind`m-1 `}>
                    <TextInput  style={tailwind`p-2 m-3 w-full font-bold text-xl text-black bg-white`} type="input" value={name} onChangeText={setName} placeholder="Give the name to community" placeholderTextColor="black" />
                    {error?.fields.name && (
                        <Text style={tailwind`text-red-500 p-2 m-2`}>*{error?.fields?.name}</Text>
                    )}
                    <TextInput style={tailwind`p-2 m-3 bg-gray-300 w-full text-black text-lg bg-white`} type="input" value={description} onChangeText={setDescription} placeholder="Write something about the community" placeholderTextColor="black" />
                </View>
                {error.fields.global && (
                    <View style={tailwind`mx-3 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
                        <Text style={tailwind`text-red-700 text-sm`}>
                            *{error.fields.global}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

export default CreateCommunity;
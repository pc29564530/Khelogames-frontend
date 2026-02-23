import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import {
    View, Text, Pressable, TextInput, FlatList,
    ActivityIndicator, Image, Modal, ScrollView, Alert
} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useNavigation } from '@react-navigation/native';
import { formatToDDMMYY, formattedTime, convertToISOString } from '../utils/FormattedDateTime';

// Color + icon map keyed by role name from API
const ROLE_STYLE_MAP = {
    admin:            { color: '#ef4444', bg: '#fef2f2', icon: 'user-shield' },
    organizer:        { color: '#f87171', bg: '#fff1f2', icon: 'crown' },
    tournament_admin: { color: '#6366f1', bg: '#eef2ff', icon: 'shield-alt' },
    scorer:           { color: '#f59e0b', bg: '#fffbeb', icon: 'pencil-alt' },
    team_manager:     { color: '#10b981', bg: '#ecfdf5', icon: 'users' },
    coach:            { color: '#3b82f6', bg: '#eff6ff', icon: 'chalkboard-teacher' },
    normal:           { color: '#6b7280', bg: '#f9fafb', icon: 'user' },
};

// Roles that organizer should NOT be able to assign (system-level)
const HIDDEN_ROLES = ['admin', 'normal'];

const ManageRole = ({ route }) => {
    const { tournament } = route.params;
    const modalInputRef = useRef(null);
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userResults, setUserResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState({ global: null, fields: {} });
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [matchesForScorer, setMatchesForScorer] = useState([]);
    const [selectedMatchPublicID, setSelectedMatchPublicID] = useState('');
    const [showMatchesModal, setShowMatchesModal] = useState(false);

    const game = useSelector((state) => state.sportReducers.game);

    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`${BASE_URL}/get-all-roles`);
                // Filter out system roles organizer shouldn't assign
                const filtered = (res.data.data || []).filter(
                    (r) => !HIDDEN_ROLES.includes(r.name)
                );
                setRoles(filtered);
            } catch (err) {
                setError({ global: 'Unable to get roles', fields: {} });
                console.log('Unable to get all roles: ', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllRoles();
    }, []);

    const modifyRoles = (input) =>
        input.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    // Debounced search
    useEffect(() => {
        if (!search.trim()) {
            setUserResults([]);
            return;
        }
        const delay = setTimeout(() => onSearchUser(search), 500);
        return () => clearTimeout(delay);
    }, [search]);

    useEffect(() => {
        if (showModal) {
            setTimeout(() => modalInputRef?.current?.focus(), 100);
        }
    }, [showModal]);

    const onSearchUser = async (q) => {
        if (!q.trim()) return;
        setSearching(true);
        try {
            const res = await axiosInstance.post(`${BASE_URL}/search-user`, { name: q });
            setUserResults(res.data.data || []);
        } catch (err) {
            setError({
                global: "Unable to search user",
                fields: err?.response.data?.error.fields || {},
            });
            console.log("Unable to search user: ", err);
        } finally {
            setSearching(false);
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setShowModal(false);
        setSearch('');
        setUserResults([]);
    };

    const getResourcePublicID = () => {
        switch (selectedRole?.scope) {
            case 'tournament': return tournament.public_id;
            case 'match':      return selectedMatchPublicID;
            default:           return tournament.public_id;
        }
    };

    useEffect(() => {
      const getTournamentMatches = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem("AccessToken");
            const timestamp = new Date();
            const res = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllMatches`, {
                params: {
                    start_timestamp: timestamp
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = res.data.data;
            if (item?.length > 0) {
                const filterMatches = item.filter((it) => it?.tournament?.public_id === tournament.public_id);
                setMatchesForScorer(filterMatches);
            }
        } catch (err) {
            setError({
                global: "Unable to get matches",
                fields: err?.response?.data?.error?.fields,
            })
            console.log("Failed to get matches: ", err)
        } finally {
            setLoading(false);
        }
      }
      
      if(selectedRole?.name === "scorer") {
        getTournamentMatches()
      }
    },[selectedRole])

    const onSave = async () => {
        if (!selectedUser || !selectedRole) return;
        setSaving(true);
        setSuccessMsg('');
        try {
            await axiosInstance.post(`${BASE_URL}/assign-role`, {
                user_public_id:     selectedUser.public_id,
                role_name:          selectedRole.name,
                resource_type:      selectedRole.scope,
                resource_public_id: getResourcePublicID(),
            });
            setSuccessMsg(`${modifyRoles(selectedRole.name)} assigned to ${selectedUser.full_name}`);
            setSelectedRole(null);
            setSelectedUser(null);
        } catch (err) {
            Alert.alert('Error', 'Failed to assign role. Please try again.');
            console.log("Unable to assign role: ", err);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name = '') =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    navigation.setOptions({
        headerTitle: () => (
            <Text style={tailwind`text-xl font-bold text-white`}>Manage Role</Text>
        ),
        headerStyle: {
            backgroundColor: tailwind.color('red-400'),
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="white" />
            </Pressable>
        ),
    });

    useEffect(() => {
        if(selectedRole?.name === 'scorer') {
            setShowMatchesModal(true);
        }
    }, [selectedRole])

    return (
        <View style={tailwind`flex-1 bg-gray-50`}>
            {error?.global && (
                <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                    <MaterialIcons name="error-outline" size={64} color="#9ca3af" />
                    <Text style={tailwind`text-gray-500 text-sm mt-2 text-center`}>
                        {error?.global}
                    </Text>
                </View>
            )}
            <ScrollView contentContainerStyle={tailwind`px-4 py-5 pb-12`} keyboardShouldPersistTaps="handled">

                {/* Tournament Info Banner */}
                <View style={tailwind`bg-white rounded-2xl p-4 mb-5 flex-row items-center`}>
                    <View style={tailwind`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}>
                        <MaterialIcons name="emoji-events" size={20} color="#f87171" />
                    </View>
                    <View style={tailwind`flex-1`}>
                        <Text style={tailwind`text-xs text-gray-400 mb-0.5`}>Assigning role for</Text>
                        <Text style={tailwind`text-sm font-bold text-gray-800`} numberOfLines={1}>
                            {tournament?.name}
                        </Text>
                    </View>
                </View>

                {/* Success Message */}
                {successMsg !== '' && (
                    <View style={tailwind`bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex-row items-center`}>
                        <MaterialIcons name="check-circle" size={18} color="#10b981" />
                        <Text style={tailwind`text-green-700 text-sm ml-2 flex-1`}>{successMsg}</Text>
                        <Pressable onPress={() => setSuccessMsg('')}>
                            <MaterialIcons name="close" size={16} color="#10b981" />
                        </Pressable>
                    </View>
                )}

                {/* Select User */}
                <View style={tailwind`bg-white rounded-2xl p-4 mb-4`}>
                    <View style={tailwind`flex-row items-center mb-3`}>
                        <Text style={tailwind`text-sm font-bold text-gray-800`}>Select User</Text>
                    </View>

                    {/* Selected User Card */}
                    {selectedUser ? (
                        <View style={tailwind`flex-row items-center bg-gray-50 rounded-xl p-3`}>
                            {selectedUser.avatar_url ? (
                                <Image
                                    source={{ uri: selectedUser.avatar_url }}
                                    style={tailwind`w-11 h-11 rounded-full`}
                                />
                            ) : (
                                <View style={tailwind`w-11 h-11 rounded-full bg-red-100 items-center justify-center`}>
                                    <Text style={tailwind`text-red-400 font-bold text-sm`}>
                                        {getInitials(selectedUser.full_name)}
                                    </Text>
                                </View>
                            )}
                            <View style={tailwind`flex-1 ml-3`}>
                                <Text style={tailwind`text-sm font-semibold text-gray-800`}>
                                    {selectedUser.full_name}
                                </Text>
                                <Text style={tailwind`text-xs text-gray-400`}>@{selectedUser.username}</Text>
                            </View>
                            <Pressable
                                onPress={() => setSelectedUser(null)}
                                style={tailwind`w-7 h-7 rounded-full bg-gray-200 items-center justify-center`}
                            >
                                <MaterialIcons name="close" size={14} color="#6b7280" />
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => setShowModal(true)}
                            style={tailwind`flex-row items-center bg-gray-50 rounded-xl p-3 border border-dashed border-gray-300`}
                        >
                            <View style={tailwind`w-11 h-11 rounded-full bg-gray-100 items-center justify-center mr-3`}>
                                <MaterialIcons name="person-search" size={22} color="#9ca3af" />
                            </View>
                            <Text style={tailwind`text-sm text-gray-400`}>Tap to search and select a user</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#9ca3af" style={tailwind`ml-auto`} />
                        </Pressable>
                    )}
                </View>

                {/* Select Role */}
                <View style={tailwind`bg-white rounded-2xl p-4 mb-5`}>
                    <View style={tailwind`flex-row items-center mb-3`}>
                        <Text style={tailwind`text-sm font-bold text-gray-800`}>Select Role</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color="#f87171" style={tailwind`my-4`} />
                    ) : (
                        roles.map((opt, index) => {
                            const style = ROLE_STYLE_MAP[opt.name] || {
                                color: '#6b7280',
                                bg: '#f9fafb',
                                icon: 'user',
                            };
                            const isSelected = selectedRole?.id === opt.id;
                            return (
                                <Pressable
                                    key={opt.id ?? index}
                                    onPress={() => {setSelectedRole(opt);}}
                                    style={[
                                        tailwind`flex-row items-center p-3 rounded-xl mb-2.5 border`,
                                        isSelected
                                            ? { backgroundColor: style.bg, borderColor: style.color }
                                            : tailwind`bg-gray-50 border-gray-100`,
                                    ]}
                                >
                                    {/* Role Icon */}
                                    <View
                                        style={[
                                            tailwind`w-10 h-10 rounded-xl items-center justify-center mr-3`,
                                            { backgroundColor: isSelected ? style.color : '#f3f4f6' },
                                        ]}
                                    >
                                        <FontAwesome5
                                            name={style.icon}
                                            size={15}
                                            color={isSelected ? '#fff' : '#9ca3af'}
                                        />
                                    </View>

                                    {/* Role Info */}
                                    <View style={tailwind`flex-1`}>
                                        <Text
                                            style={[
                                                tailwind`text-sm font-semibold`,
                                                { color: isSelected ? style.color : '#1f2937' },
                                            ]}
                                        >
                                            {modifyRoles(opt.name)}
                                        </Text>
                                        <Text style={tailwind`text-xs text-gray-400 mt-0.5`}>
                                            {opt.description}
                                        </Text>
                                    </View>

                                    {/* Selected Check */}
                                    <View
                                        style={[
                                            tailwind`w-5 h-5 rounded-full border-2 items-center justify-center`,
                                            isSelected
                                                ? { backgroundColor: style.color, borderColor: style.color }
                                                : tailwind`border-gray-300`,
                                        ]}
                                    >
                                        {isSelected && (
                                            <MaterialIcons name="check" size={12} color="white" />
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </View>

                {/* Assign Button */}
                <Pressable
                    onPress={onSave}
                    disabled={!selectedUser || !selectedRole || saving}
                    style={[
                        tailwind`py-4 rounded-2xl items-center flex-row justify-center`,
                        selectedUser && selectedRole && !saving
                            ? tailwind`bg-red-400`
                            : tailwind`bg-gray-200`,
                    ]}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <MaterialIcons
                                name="check-circle"
                                size={18}
                                color={selectedUser && selectedRole ? 'white' : '#9ca3af'}
                                style={tailwind`mr-2`}
                            />
                            <Text
                                style={[
                                    tailwind`text-sm font-semibold`,
                                    selectedUser && selectedRole ? tailwind`text-white` : tailwind`text-gray-400`,
                                ]}
                            >
                                Assign Role
                            </Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>

            {/* User Search Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={tailwind`flex-1 bg-black/50 justify-end`}>
                    <View style={tailwind`bg-white rounded-t-3xl p-5`} >

                        {/* Modal Header */}
                        <View style={tailwind`flex-row justify-between items-center mb-4`}>
                            <Text style={tailwind`text-base font-bold text-gray-800`}>Search User</Text>
                            <Pressable
                                onPress={() => { setShowModal(false); setSearch(''); setUserResults([]); }}
                                style={tailwind`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                            >
                                <MaterialIcons name="close" size={18} color="#6b7280" />
                            </Pressable>
                        </View>

                        {/* Search Input */}
                        <View style={tailwind`flex-row items-center bg-gray-50 rounded-xl px-3 mb-4 border border-gray-100`}>
                            <MaterialIcons name="search" size={20} color="#9ca3af" />
                            <TextInput
                                ref={modalInputRef}
                                placeholder="Type a name to search..."
                                placeholderTextColor="#d1d5db"
                                value={search}
                                onChangeText={setSearch}
                                style={tailwind`flex-1 py-3 px-2 text-sm text-gray-800`}
                            />
                            {searching && <ActivityIndicator size="small" color="#f87171" />}
                            {search.length > 0 && !searching && (
                                <Pressable onPress={() => { setSearch(''); setUserResults([]); }}>
                                    <MaterialIcons name="cancel" size={18} color="#d1d5db" />
                                </Pressable>
                            )}
                        </View>

                        {/* Results */}
                        <View style={{ maxHeight: 320 }}>
                            {userResults.length > 0 ? (
                                <FlatList
                                    data={userResults}
                                    keyExtractor={(item) => String(item.id)}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <Pressable
                                            onPress={() => selectUser(item)}
                                            style={tailwind`flex-row items-center py-3 border-b border-gray-50`}
                                        >
                                            {item.avatar_url ? (
                                                <Image
                                                    source={{ uri: item.avatar_url }}
                                                    style={tailwind`w-11 h-11 rounded-full`}
                                                />
                                            ) : (
                                                <View style={tailwind`w-11 h-11 rounded-full bg-red-100 items-center justify-center`}>
                                                    <Text style={tailwind`text-red-400 font-bold text-sm`}>
                                                        {getInitials(item.full_name)}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={tailwind`flex-1 ml-3`}>
                                                <Text style={tailwind`text-sm font-semibold text-gray-800`}>
                                                    {item.full_name}
                                                </Text>
                                                <Text style={tailwind`text-xs text-gray-400`}>
                                                    @{item.username}
                                                </Text>
                                            </View>
                                            <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
                                        </Pressable>
                                    )}
                                />
                            ) : search.length > 0 && !searching ? (
                                <View style={tailwind`py-10 items-center`}>
                                    <MaterialIcons name="search-off" size={40} color="#e5e7eb" />
                                    <Text style={tailwind`text-gray-400 text-sm mt-2`}>No users found</Text>
                                    <Text style={tailwind`text-gray-300 text-xs mt-1`}>Try a different name</Text>
                                </View>
                            ) : (
                                <View style={tailwind`py-10 items-center`}>
                                    <MaterialIcons name="person-search" size={40} color="#e5e7eb" />
                                    <Text style={tailwind`text-gray-400 text-sm mt-2`}>Search by name</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showMatchesModal}
                animationType='slide'
                transparent
                onRequestClose={() => setShowMatchesModal(false)}
            >
                <View style={tailwind`flex-1 bg-black/50 justify-end`}>
                    <View style={tailwind`bg-white rounded-t-3xl p-5`}>
                        <View style={tailwind`flex-row justify-between items-center mb-4`}>
                            <Text style={tailwind`text-base font-bold text-gray-800`}>Select Match</Text>
                            <Pressable
                                onPress={() => setShowMatchesModal(false)}
                                style={tailwind`w-8 h-8 rounded-full bg-gray-100 items-center justify-center`}
                            >
                                <MaterialIcons name="close" size={18} color="#6b7280" />
                            </Pressable>
                        </View>
                        <FlatList
                            data={matchesForScorer}
                            keyExtractor={(item, index) => item?.public_id ?? String(index)}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => renderMatchCard(item, selectedMatchPublicID, setSelectedMatchPublicID, setShowMatchesModal)}
                            ListEmptyComponent={
                                <View style={tailwind`py-10 items-center`}>
                                    <MaterialIcons name="sports-cricket" size={40} color="#e5e7eb" />
                                    <Text style={tailwind`text-gray-400 text-sm mt-2`}>No matches found</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const renderMatchCard = (item, selectedMatchPublicID, setSelectedMatchPublicID, setShowMatchesModal) => {
        const isSelected = selectedMatchPublicID === item?.public_id;
        return (
            <Pressable
                key={item?.public_id}
                style={[
                    tailwind`mb-3 bg-white rounded-xl overflow-hidden border`,
                    isSelected ? tailwind`border-red-400` : tailwind`border-gray-100`,
                    {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2}
                ]}
                onPress={() => { setSelectedMatchPublicID(item.public_id); setShowMatchesModal(false); }}
            >

                {/* Match Content */}
                <View style={tailwind`p-4`}>
                    <View style={tailwind`flex-row items-center justify-between`}>
                        {/* Teams */}
                        <View style={tailwind`flex-1`}>
                            {/* Home Team */}
                            <View style={tailwind`flex-row items-center mb-3`}>
                                <View style={tailwind`w-6 h-6 rounded-full bg-gray-100 items-center justify-center overflow-hidden`}>
                                    {item?.homeTeam?.media_url ? (
                                        <Image
                                            source={{ uri: item.homeTeam.media_url }}
                                            style={tailwind`w-full h-full`}
                                        />
                                    ) : (
                                        <Text style={tailwind`text-red-400 font-bold text-md`}>
                                            {item?.homeTeam?.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <Text style={tailwind`text-gray-900 font-semibold ml-3 flex-1`} numberOfLines={1}>
                                    {item?.homeTeam?.name}
                                </Text>
                            </View>

                            {/* Away Team */}
                            <View style={tailwind`flex-row items-center`}>
                                <View style={tailwind`w-6 h-6 rounded-full bg-gray-100 items-center justify-center overflow-hidden`}>
                                    {item?.awayTeam?.media_url ? (
                                        <Image
                                            source={{ uri: item.awayTeam.media_url }}
                                            style={tailwind`w-full h-full`}
                                        />
                                    ) : (
                                        <Text style={tailwind`text-red-400 font-bold text-md`}>
                                            {item?.awayTeam?.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <Text style={tailwind`text-gray-900 font-semibold ml-3 flex-1`} numberOfLines={1}>
                                    {item?.awayTeam?.name}
                                </Text>
                            </View>
                        </View>
                        
                        {/* Vertical divider */}
                        <View style={tailwind`w-px bg-gray-100 my-3`} />

                        {/* Match Info */}
                        <View style={tailwind`items-end ml-4`}>
                            <Text style={tailwind`text-gray-600 text-xs font-semibold mb-1`}>
                                {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                            </Text>
                            {item?.status !== "not_started" ? (
                                <View style={tailwind`px-2 py-1 rounded bg-gray-100`}>
                                    <Text style={tailwind`text-xs font-semibold capitalize`}>
                                        {item?.status_code || item?.status}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={tailwind`text-gray-500 text-xs`}>
                                    {formattedTime(convertToISOString(item?.start_timestamp))}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
        </Pressable>
        )
    };

export default ManageRole;

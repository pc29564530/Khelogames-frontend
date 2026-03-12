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
    admin:            { color: '#ef4444', bg: '#ef444420', icon: 'user-shield' },
    organizer:        { color: '#f87171', bg: '#f8717120', icon: 'crown' },
    tournament_admin: { color: '#6366f1', bg: '#6366f120', icon: 'shield-alt' },
    scorer:           { color: '#f59e0b', bg: '#f59e0b20', icon: 'pencil-alt' },
    team_manager:     { color: '#10b981', bg: '#10b98120', icon: 'users' },
    coach:            { color: '#3b82f6', bg: '#3b82f620', icon: 'chalkboard-teacher' },
    normal:           { color: '#6b7280', bg: '#33415530', icon: 'user' },
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
            <Text style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}>Manage Role</Text>
        ),
        headerStyle: {
            backgroundColor: '#1e293b',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#334155',
        },
        headerTintColor: '#f1f5f9',
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="#f1f5f9" />
            </Pressable>
        ),
    });

    useEffect(() => {
        if(selectedRole?.name === 'scorer') {
            setShowMatchesModal(true);
        }
    }, [selectedRole])

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            {error?.global && (
                <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                    <MaterialIcons name="error-outline" size={64} color="#475569" />
                    <Text style={[tailwind`text-sm mt-2 text-center`, { color: '#64748b' }]}>
                        {error?.global}
                    </Text>
                </View>
            )}
            <ScrollView contentContainerStyle={tailwind`px-4 py-5 pb-12`} keyboardShouldPersistTaps="handled">

                {/* Tournament Info Banner */}
                <View style={[tailwind`rounded-2xl p-4 mb-5 flex-row items-center`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                    <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: '#f8717120' }]}>
                        <MaterialIcons name="emoji-events" size={20} color="#f87171" />
                    </View>
                    <View style={tailwind`flex-1`}>
                        <Text style={[tailwind`text-xs mb-0.5`, { color: '#64748b' }]}>Assigning role for</Text>
                        <Text style={[tailwind`text-sm font-bold`, { color: '#f1f5f9' }]} numberOfLines={1}>
                            {tournament?.name}
                        </Text>
                    </View>
                </View>

                {/* Success Message */}
                {successMsg !== '' && (
                    <View style={[tailwind`rounded-xl p-3 mb-4 flex-row items-center`, { backgroundColor: '#10b98115', borderWidth: 1, borderColor: '#10b98130' }]}>
                        <MaterialIcons name="check-circle" size={18} color="#4ade80" />
                        <Text style={[tailwind`text-sm ml-2 flex-1`, { color: '#4ade80' }]}>{successMsg}</Text>
                        <Pressable onPress={() => setSuccessMsg('')}>
                            <MaterialIcons name="close" size={16} color="#4ade80" />
                        </Pressable>
                    </View>
                )}

                {/* Select User */}
                <View style={[tailwind`rounded-2xl p-4 mb-4`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                    <View style={tailwind`flex-row items-center mb-3`}>
                        <Text style={[tailwind`text-sm font-bold`, { color: '#f1f5f9' }]}>Select User</Text>
                    </View>

                    {/* Selected User Card */}
                    {selectedUser ? (
                        <View style={[tailwind`flex-row items-center rounded-xl p-3`, { backgroundColor: '#0f172a' }]}>
                            {selectedUser.avatar_url ? (
                                <Image
                                    source={{ uri: selectedUser.avatar_url }}
                                    style={tailwind`w-11 h-11 rounded-full`}
                                />
                            ) : (
                                <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#f8717120' }]}>
                                    <Text style={[tailwind`font-bold text-sm`, { color: '#f87171' }]}>
                                        {getInitials(selectedUser.full_name)}
                                    </Text>
                                </View>
                            )}
                            <View style={tailwind`flex-1 ml-3`}>
                                <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                    {selectedUser.full_name}
                                </Text>
                                <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>@{selectedUser.username}</Text>
                            </View>
                            <Pressable
                                onPress={() => setSelectedUser(null)}
                                style={[tailwind`w-7 h-7 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}
                            >
                                <MaterialIcons name="close" size={14} color="#94a3b8" />
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => setShowModal(true)}
                            style={[tailwind`flex-row items-center rounded-xl p-3`, { backgroundColor: '#0f172a', borderWidth: 1, borderStyle: 'dashed', borderColor: '#334155' }]}
                        >
                            <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center mr-3`, { backgroundColor: '#334155' }]}>
                                <MaterialIcons name="person-search" size={22} color="#64748b" />
                            </View>
                            <Text style={[tailwind`text-sm`, { color: '#64748b' }]}>Tap to search and select a user</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#475569" style={tailwind`ml-auto`} />
                        </Pressable>
                    )}
                </View>

                {/* Select Role */}
                <View style={[tailwind`rounded-2xl p-4 mb-5`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                    <View style={tailwind`flex-row items-center mb-3`}>
                        <Text style={[tailwind`text-sm font-bold`, { color: '#f1f5f9' }]}>Select Role</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color="#f87171" style={tailwind`my-4`} />
                    ) : (
                        roles.map((opt, index) => {
                            const style = ROLE_STYLE_MAP[opt.name] || {
                                color: '#6b7280',
                                bg: '#33415530',
                                icon: 'user',
                            };
                            const isSelected = selectedRole?.id === opt.id;
                            return (
                                <Pressable
                                    key={opt.id ?? index}
                                    onPress={() => {setSelectedRole(opt);}}
                                    style={[
                                        tailwind`flex-row items-center p-3 rounded-xl mb-2.5`,
                                        { borderWidth: 1 },
                                        isSelected
                                            ? { backgroundColor: style.bg, borderColor: style.color }
                                            : { backgroundColor: '#0f172a', borderColor: '#334155' },
                                    ]}
                                >
                                    {/* Role Icon */}
                                    <View
                                        style={[
                                            tailwind`w-10 h-10 rounded-xl items-center justify-center mr-3`,
                                            { backgroundColor: isSelected ? style.color : '#334155' },
                                        ]}
                                    >
                                        <FontAwesome5
                                            name={style.icon}
                                            size={15}
                                            color={isSelected ? '#fff' : '#64748b'}
                                        />
                                    </View>

                                    {/* Role Info */}
                                    <View style={tailwind`flex-1`}>
                                        <Text
                                            style={[
                                                tailwind`text-sm font-semibold`,
                                                { color: isSelected ? style.color : '#f1f5f9' },
                                            ]}
                                        >
                                            {modifyRoles(opt.name)}
                                        </Text>
                                        <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]}>
                                            {opt.description}
                                        </Text>
                                    </View>

                                    {/* Selected Check */}
                                    <View
                                        style={[
                                            tailwind`w-5 h-5 rounded-full border-2 items-center justify-center`,
                                            isSelected
                                                ? { backgroundColor: style.color, borderColor: style.color }
                                                : { borderColor: '#475569' },
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
                        { backgroundColor: selectedUser && selectedRole && !saving ? '#f87171' : '#334155' },
                    ]}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <MaterialIcons
                                name="check-circle"
                                size={18}
                                color={selectedUser && selectedRole ? 'white' : '#475569'}
                                style={tailwind`mr-2`}
                            />
                            <Text
                                style={[
                                    tailwind`text-sm font-semibold`,
                                    { color: selectedUser && selectedRole ? '#fff' : '#475569' },
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
                    <View style={[tailwind`rounded-t-3xl p-5`, { backgroundColor: '#1e293b' }]}>

                        {/* Modal Header */}
                        <View style={tailwind`flex-row justify-between items-center mb-4`}>
                            <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>Search User</Text>
                            <Pressable
                                onPress={() => { setShowModal(false); setSearch(''); setUserResults([]); }}
                                style={[tailwind`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}
                            >
                                <MaterialIcons name="close" size={18} color="#94a3b8" />
                            </Pressable>
                        </View>

                        {/* Search Input */}
                        <View style={[tailwind`flex-row items-center rounded-xl px-3 mb-4`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
                            <MaterialIcons name="search" size={20} color="#64748b" />
                            <TextInput
                                ref={modalInputRef}
                                placeholder="Type a name to search..."
                                placeholderTextColor="#475569"
                                value={search}
                                onChangeText={setSearch}
                                style={[tailwind`flex-1 py-3 px-2 text-sm`, { color: '#f1f5f9' }]}
                            />
                            {searching && <ActivityIndicator size="small" color="#f87171" />}
                            {search.length > 0 && !searching && (
                                <Pressable onPress={() => { setSearch(''); setUserResults([]); }}>
                                    <MaterialIcons name="cancel" size={18} color="#475569" />
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
                                            style={[tailwind`flex-row items-center py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                        >
                                            {item.avatar_url ? (
                                                <Image
                                                    source={{ uri: item.avatar_url }}
                                                    style={tailwind`w-11 h-11 rounded-full`}
                                                />
                                            ) : (
                                                <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#f8717120' }]}>
                                                    <Text style={[tailwind`font-bold text-sm`, { color: '#f87171' }]}>
                                                        {getInitials(item.full_name)}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={tailwind`flex-1 ml-3`}>
                                                <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                                    {item.full_name}
                                                </Text>
                                                <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                                                    @{item.username}
                                                </Text>
                                            </View>
                                            <MaterialIcons name="chevron-right" size={20} color="#475569" />
                                        </Pressable>
                                    )}
                                />
                            ) : search.length > 0 && !searching ? (
                                <View style={tailwind`py-10 items-center`}>
                                    <MaterialIcons name="search-off" size={40} color="#475569" />
                                    <Text style={[tailwind`text-sm mt-2`, { color: '#64748b' }]}>No users found</Text>
                                    <Text style={[tailwind`text-xs mt-1`, { color: '#475569' }]}>Try a different name</Text>
                                </View>
                            ) : (
                                <View style={tailwind`py-10 items-center`}>
                                    <MaterialIcons name="person-search" size={40} color="#475569" />
                                    <Text style={[tailwind`text-sm mt-2`, { color: '#64748b' }]}>Search by name</Text>
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
                    <View style={[tailwind`rounded-t-3xl p-5`, { backgroundColor: '#1e293b' }]}>
                        <View style={tailwind`flex-row justify-between items-center mb-4`}>
                            <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>Select Match</Text>
                            <Pressable
                                onPress={() => setShowMatchesModal(false)}
                                style={[tailwind`w-8 h-8 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}
                            >
                                <MaterialIcons name="close" size={18} color="#94a3b8" />
                            </Pressable>
                        </View>
                        <FlatList
                            data={matchesForScorer}
                            keyExtractor={(item, index) => item?.public_id ?? String(index)}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => renderMatchCard(item, selectedMatchPublicID, setSelectedMatchPublicID, setShowMatchesModal)}
                            ListEmptyComponent={
                                <View style={tailwind`py-10 items-center`}>
                                    <MaterialIcons name="sports-cricket" size={40} color="#475569" />
                                    <Text style={[tailwind`text-sm mt-2`, { color: '#64748b' }]}>No matches found</Text>
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
        const isLive = item?.status === "live";
        return (
            <Pressable
                key={item?.public_id}
                style={[
                    tailwind`mb-3 rounded-xl overflow-hidden`,
                    { backgroundColor: '#0f172a', borderWidth: 1 },
                    { borderColor: isSelected ? '#f87171' : '#334155' },
                ]}
                onPress={() => { setSelectedMatchPublicID(item.public_id); setShowMatchesModal(false); }}
            >
                {/* Live accent bar */}
                {isLive && <View style={tailwind`h-0.5 bg-red-400`} />}

                {/* Match Content */}
                <View style={tailwind`p-4`}>
                    <View style={tailwind`flex-row items-center justify-between`}>
                        {/* Teams */}
                        <View style={tailwind`flex-1`}>
                            {/* Home Team */}
                            <View style={tailwind`flex-row items-center mb-3`}>
                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center overflow-hidden`, { backgroundColor: '#334155' }]}>
                                    {item?.homeTeam?.media_url ? (
                                        <Image
                                            source={{ uri: item.homeTeam.media_url }}
                                            style={tailwind`w-full h-full`}
                                        />
                                    ) : (
                                        <Text style={[tailwind`font-bold text-xs`, { color: '#f87171' }]}>
                                            {item?.homeTeam?.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <Text style={[tailwind`font-semibold ml-3 flex-1`, { color: '#f1f5f9' }]} numberOfLines={1}>
                                    {item?.homeTeam?.name}
                                </Text>
                            </View>

                            {/* Away Team */}
                            <View style={tailwind`flex-row items-center`}>
                                <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center overflow-hidden`, { backgroundColor: '#334155' }]}>
                                    {item?.awayTeam?.media_url ? (
                                        <Image
                                            source={{ uri: item.awayTeam.media_url }}
                                            style={tailwind`w-full h-full`}
                                        />
                                    ) : (
                                        <Text style={[tailwind`font-bold text-xs`, { color: '#f87171' }]}>
                                            {item?.awayTeam?.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <Text style={[tailwind`font-semibold ml-3 flex-1`, { color: '#f1f5f9' }]} numberOfLines={1}>
                                    {item?.awayTeam?.name}
                                </Text>
                            </View>
                        </View>

                        {/* Vertical divider */}
                        <View style={[tailwind`w-px my-3 ml-3`, { backgroundColor: '#334155' }]} />

                        {/* Match Info */}
                        <View style={tailwind`items-end ml-4`}>
                            <Text style={[tailwind`text-xs font-semibold mb-1`, { color: '#64748b' }]}>
                                {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                            </Text>
                            {item?.status !== "not_started" ? (
                                <View style={[tailwind`px-2 py-1 rounded`, { backgroundColor: isLive ? '#f8717120' : '#334155' }]}>
                                    <Text style={[tailwind`text-xs font-semibold capitalize`, { color: isLive ? '#f87171' : '#cbd5e1' }]}>
                                        {item?.status_code || item?.status}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={[tailwind`text-xs`, { color: '#cbd5e1' }]}>
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
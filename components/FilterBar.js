import {View, Text, Pressable, ActivityIndicator} from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const MatchesFilterBar = ({
  selectedDate,
  setIsDatePickerVisible,
  handleLocation,
  formattedDate,
  handleNextDate,
  handlePrevDate,
  isLoadingLocation = false,
  nearbyActive = false,
  setMatchMode,
}) => {
  return (
    <View
      style={[
        tailwind`px-4 py-3`,
        {
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#334155"
        }
      ]}
    >
      {/* DATE NAVIGATION */}
      <View style={tailwind`flex-row items-center justify-between mb-3`}>

        {/* LEFT ARROW */}
        <Pressable
          onPress={handlePrevDate}
          style={tailwind`p-2 rounded-full bg-slate-800`}
        >
          <AntDesign name="left" size={16} color="#e2e8f0" />
        </Pressable>

        {/* DATE */}
        <Pressable
          onPress={() => {setIsDatePickerVisible(true); setMatchMode('date')}}
          style={tailwind`flex-row items-center px-4 py-2 rounded-xl bg-slate-800`}
        >
          <AntDesign name="calendar" size={16} color="#94a3b8" />
          <Text style={[tailwind`ml-2 font-semibold`, {color: "#f1f5f9"}]}>
            {formattedDate(selectedDate)}
          </Text>
        </Pressable>

        {/* RIGHT ARROW */}
        <Pressable
          onPress={handleNextDate}
          style={tailwind`p-2 rounded-full bg-slate-800`}
        >
          <AntDesign name="right" size={16} color="#e2e8f0" />
        </Pressable>
      </View>

      {/* ACTION BUTTONS */}
      <View style={tailwind`flex-row justify-between`}>

        <Pressable
          onPress={() => { handleLocation();}}
          disabled={isLoadingLocation}
          style={[
            tailwind`flex-1 mr-2 py-2 rounded-xl items-center flex-row justify-center`,
            {
              backgroundColor: isLoadingLocation ? '#334155' : nearbyActive ? '#f87171' : '#1e293b',
              borderWidth: nearbyActive ? 0 : 1,
              borderColor: '#334155',
            }
          ]}
        >
          {isLoadingLocation ? (
            <>
              <ActivityIndicator size="small" color="#f87171" style={tailwind`mr-2`} />
              <Text style={[tailwind`text-sm font-medium`, { color: '#f1f5f9' }]}>
                Finding nearby...
              </Text>
            </>
          ) : (
            <Text style={[tailwind`text-sm font-medium`, { color: nearbyActive ? '#ffffff' : '#f1f5f9' }]}>
              📍 {nearbyActive ? 'Nearby' : 'Nearby'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {setMatchMode('live')}}
          style={tailwind`flex-1 ml-2 py-2 rounded-xl bg-red-500 items-center`}
        >
          <Text style={tailwind`text-white text-sm font-medium`}>
            🔴 Live
          </Text>
        </Pressable>

      </View>
    </View>
  );
};


const TYPE_FILTER_LABELS = {
  all: 'Scope',
  international: 'International',
  country: 'By Country',
  city: 'By City',
  nearby: 'Nearby',
};

const TYPE_FILTER_ICONS = {
  all: 'public',
  international: 'public',
  country: 'flag',
  city: 'location-city',
  nearby: 'near-me',
};

const STATUS_FILTER_LABELS = {
  all: 'Status',
  not_started: 'Upcoming',
  in_progress: 'Live',
  finished: 'Finished',
};

const STATUS_FILTER_ICONS = {
  all: 'schedule',
  not_started: 'schedule',
  in_progress: 'fiber-manual-record',
  finished: 'check-circle',
};

export const FilterBar = ({
  typeFilter,
  setTypeFilterModal,
  setStatusFilterModal,
  statusFilter
}) => {
  const typeLabel = TYPE_FILTER_LABELS[typeFilter] || 'Scope';
  const typeIcon = TYPE_FILTER_ICONS[typeFilter] || 'public';
  const statusLabel = STATUS_FILTER_LABELS[statusFilter] || 'Status';
  const statusIcon = STATUS_FILTER_ICONS[statusFilter] || 'schedule';

  return (
    <View
      style={[
        tailwind`flex-row px-4 py-2`,
        {
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#334155"
        }
      ]}
    >

      {/* SCOPE */}
      <Pressable
        onPress={() => setTypeFilterModal(true)}
        style={[
          tailwind`flex-row items-center px-4 py-2 rounded-xl mr-2`,
          typeFilter !== "all"
            ? tailwind`bg-red-500`
            : tailwind`bg-slate-800`
        ]}
      >
        <MaterialIcons
          name={typeIcon}
          size={16}
          color="#ffffff"
          style={tailwind`mr-1.5`}
        />
        <Text style={tailwind`text-white text-sm font-medium`}>
          {typeLabel}
        </Text>
      </Pressable>

      {/* STATUS */}
      <Pressable
        onPress={() => setStatusFilterModal(true)}
        style={[
          tailwind`flex-row items-center px-4 py-2 rounded-xl`,
          statusFilter !== "all"
            ? tailwind`bg-red-500`
            : tailwind`bg-slate-800`
        ]}
      >
        <MaterialIcons
          name={statusIcon}
          size={16}
          color={statusFilter === 'live' ? '#ffffff' : '#ffffff'}
          style={tailwind`mr-1.5`}
        />
        <Text style={tailwind`text-white text-sm font-medium`}>
          {statusLabel}
        </Text>
      </Pressable>

    </View>
  );
};
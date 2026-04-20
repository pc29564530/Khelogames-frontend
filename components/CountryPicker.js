import React, { useMemo, useState, useEffect } from 'react';
import {
 View,
 Text,
 Pressable,
 Modal,
 TextInput,
 FlatList,
 SafeAreaView,
} from 'react-native';
import tailwind from 'twrnc';

import { getAllCountries } from 'react-native-country-picker-modal';

export default function CountryPicker({
 visible,
 onClose,
 onSelectCountry,
}) {
 const [allCountries, setAllCountries] = useState(null);
 const [search, setSearch] = useState('');

 useEffect(() => {
    const getCountries = async () => {
        const countries = await getAllCountries();
        setAllCountries(countries);
    }
    getCountries();
 }, []);

 const filtered = useMemo(() => {
   return allCountries?.filter((item) =>
     item.name?.toLowerCase().includes(search.toLowerCase())
   );
 }, [allCountries, search]);

 const getFlagEmoji = (code) => {
  return code
    ?.toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
};

 return (
   <Modal visible={visible} animationType="slide">
     <SafeAreaView style={{ flex:1, backgroundColor:'#020617' }}>

       <View style={{ padding:20 }}>
         <Text style={{
           color:'white',
           fontSize:22,
           fontWeight:'700'
         }}>
           Select Country
         </Text>

         <TextInput
           placeholder="Search country..."
           placeholderTextColor="#64748b"
           value={search}
           onChangeText={setSearch}
           style={{
             marginTop:14,
             backgroundColor:'#0f172a',
             color:'white',
             borderRadius:14,
             padding:12
           }}
         />
       </View>

       <FlatList
            data={filtered}
            keyExtractor={(item) => item.cca2}
            renderItem={({ item }) => (
                <Pressable
                onPress={() => {
                    onSelectCountry(item);
                    onClose();
                }}
                style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#1e293b',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                >

                    <View style={tailwind`flex-row items-center gap-4`}>
                        <Text style={{ fontSize: 24 }}>
                            {getFlagEmoji(item.cca2)}
                        </Text>
                        <Text style={{ color: 'white', fontSize: 16 }}>
                        {item.name}
                        </Text>
                    </View>
                </Pressable>
            )}
        />

       <Pressable
         onPress={onClose}
         style={{
           margin:20,
           backgroundColor:'#1e293b',
           padding:16,
           borderRadius:14,
           alignItems:'center'
         }}
       >
         <Text style={{ color:'white' }}>Close</Text>
       </Pressable>

     </SafeAreaView>
   </Modal>
 );
}
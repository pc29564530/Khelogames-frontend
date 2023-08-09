import React from 'react';
import {Text, View, StyleSheet, Pressable,Item} from 'react-native';
import ForumIcon from '@mui/icons-material/Forum';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AddCommentIcon from '@mui/icons-material/AddComment'; 
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Community from './Community';
import HomeIcon from '@mui/icons-material/Home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation,  } from '@react-navigation/native';






function Footer () {
    const navigation = useNavigation();

    return (
        <View style={styles.footer}>
            <Pressable onPress={() => navigation.navigate('Community')} ><ForumIcon /></Pressable>       
            <Pressable style={styles.footText}><PeopleAltIcon/></Pressable>
            <Pressable style={styles.footText}><WidgetsIcon /></Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: 'relative',
        top: 20,
        left: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginEnd:0,
        width: '100%',
        padding: 10,
    },
});

export default Footer;
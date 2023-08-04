import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import ForumIcon from '@mui/icons-material/Forum';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import WidgetsIcon from '@mui/icons-material/Widgets';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';


function Footer () {
    return (
        <View style={styles.footer}>
            <Text style={styles.footText}><ForumIcon /></Text>
            <Text style={styles.footText}><PeopleAltIcon/></Text>
            <Text style={styles.footText}><WidgetsIcon /></Text>
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
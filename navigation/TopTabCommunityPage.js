import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import PostByCommunity from '../screen/PostByCommunity';
import CommunityMember from '../screen/CommunityMember';

function TopTabCommunityPage({item}) {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-black`,
                    tabBarStyle:tailwind`bg-white`,
                    headerShown:true
                }}
            >   
                <TopTab.Screen 
                    name="Post"
                    component={PostByCommunity}
                    initialParams={{item: item}}
                />
                <TopTab.Screen 
                    name="Member"
                    component={CommunityMember}
                    initialParams={{item: item}}
                />
        </TopTab.Navigator>
    );
}

export {TopTabCommunityPage};
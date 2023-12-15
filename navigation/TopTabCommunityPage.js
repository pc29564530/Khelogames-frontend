import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import tailwind from 'twrnc';
import PostByCommunity from '../screen/PostByCommunity';
import CommunityMember from '../screen/CommunityMember';

function TopTabCommunityPage({communityPageData}) {
    const TopTab = createMaterialTopTabNavigator();
    return (
        <TopTab.Navigator
                screenOptions={{
                    tabBarLabelStyle:tailwind`text-white`,
                    tabBarStyle:tailwind`bg-black`,
                    headerShown:true
                }}
            >   
                <TopTab.Screen 
                    name="PostByCommunity"
                    component={PostByCommunity}
                    initialParams={{communityPageData: communityPageData}}
                />
                <TopTab.Screen 
                    name="CommunityMember"
                    component={CommunityMember}
                    initialParams={{communityPageData: communityPageData}}
                />
        </TopTab.Navigator>
    );
}

export {TopTabCommunityPage};
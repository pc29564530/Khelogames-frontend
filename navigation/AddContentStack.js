import { createStackNavigator } from "@react-navigation/stack";
import AddContent from "../components/AddContent";
const AddStack = createStackNavigator();

const AddContentStack = ({navigation}) => {
   return (
       <AddStack.Navigator>
           <AddStack.Screen name="AddContent" component={AddContent} initialParams={navigation}/>
       </AddStack.Navigator>
   );
}

export default AddContentStack;
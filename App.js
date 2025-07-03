import React from "react";
import { FontAwesome5 } from "@expo/vector-icons"; // for Expo

import { NavigationContainer } from "@react-navigation/native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DhikrScreen from "./screens/DhikrScreen";
import TasbeehCounter from "./screens/TasbeehCounter";
import IstighfarScreen from "./screens/IstighfarScreen";
import DuroodScreen from "./screens/DuroodScreen";

const Tab = createBottomTabNavigator();

// const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "TasbeehCounter") {
              return (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === "Dhikr") {
              return (
                <FontAwesome5
                  name="praying-hands" // or try "dharmachakra"
                  size={size}
                  color={color}
                />
              );
            }
            // return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="TasbeehCounter" component={TasbeehCounter} />
        <Tab.Screen name="Dhikr" component={DhikrScreen} />
        <Tab.Screen
          name="Istighfar"
          component={IstighfarScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Durood"
          component={DuroodScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flower-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      {/* <Stack.Navigator initialRouteName="TasbeehCounter">
        <Stack.Screen name="TasbeehCounter" component={TasbeehCounter} />
        <Stack.Screen name="Dhikr" component={DhikrScreen} />
      </Stack.Navigator> */}
    </NavigationContainer>
  );
};

export default App;

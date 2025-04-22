import React from 'react';
import Constants from 'expo-constants';
import { Image, Platform } from "react-native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RestaurantsScreen from './screens/RestaurantsScreen';
import PeopleScreen from './screens/PeopleScreen';
import DecisionScreen from './screens/DecisionScreen'

const platformOS = Platform.OS.toLowerCase();
const tabs = createMaterialTopTabNavigator();


export const  MyTabs = () => {
    return (
      <tabs.Navigator
        initialRouteName="PeopleScreen"
        animationEnabled= {true}
        swipeEnabled= {true}
        backBehavior="none"
        lazy={true}
        tabBarPosition={platformOS === "android" ? "top" : "bottom"}
        tabBarOptions={{
          activeTintColor: "#ff0000",
          showIcon: true,
          style: {
            paddingTop: platformOS === "android" ? Constants.statusBarHeight : 0,
          },
        }}
      >
        <tabs.Screen
          name="PeopleScreen"
          component={PeopleScreen}
          options={{
            tabBarLabel: "People",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("./assets/task_icons/icon-people.png")}
                style={{ width: 32, height: 32, tintColor: color }}
              />
            ),
          }}
        />
        <tabs.Screen
          name="DecisionScreen"
          component={DecisionScreen}
          options={{
            tabBarLabel: "Decision",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("./assets/task_icons/icon-decision.png")}
                style={{ width: 32, height: 32, tintColor: color }}
              />
            ),
          }}
        />
        <tabs.Screen
          name="Restaurants"
          component={RestaurantsScreen}
          options={{
            tabBarLabel: "Restaurants",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("./assets/task_icons/icon-restaurants.png")}
                style={{ width: 32, height: 32, tintColor: color }}
              />
            ),
          }}
        />
      </tabs.Navigator>
    );
  }
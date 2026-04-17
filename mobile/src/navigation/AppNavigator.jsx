import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/tokens";

// Auth screens
import LoginScreen    from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Student screens
import StudentFeedScreen from "../screens/StudentFeedScreen";
import JobDetailScreen   from "../screens/JobDetailScreen";
import MyQRScreen        from "../screens/MyQRScreen";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

/* ── Shared Stack & Tab Options ─────────────────────────────── */
const darkStack = {
  headerStyle:      { backgroundColor: colors.bg },
  headerTitleStyle: { color: colors.textPrimary, fontWeight: "700" },
  headerTintColor:  colors.brandLight,
  contentStyle:     { backgroundColor: colors.bg },
};

const tabBar = {
  style: {
    backgroundColor: colors.bgCard,
    borderTopColor:  colors.border,
    height: 62,
    paddingBottom: 10,
  },
  labelStyle:           { fontSize: 11, fontWeight: "600" },
  activeTintColor:      colors.brandLight,
  inactiveTintColor:    colors.textMuted,
};

/* ── Student Tab Navigator ───────────────────────────────────── */
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...darkStack, tabBarStyle: tabBar.style, tabBarLabelStyle: tabBar.labelStyle, tabBarActiveTintColor: tabBar.activeTintColor, tabBarInactiveTintColor: tabBar.inactiveTintColor }}>
      <Tab.Screen
        name="Feed"
        component={StudentFeedStack}
        options={{
          headerShown: false,
          tabBarLabel: "Find Jobs",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="MyQR"
        component={MyQRScreen}
        options={{
          title: "My Applications",
          tabBarLabel: "My QR",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📲</Text>,
          ...darkStack,
        }}
      />
    </Tab.Navigator>
  );
}

/* ── Student Feed Stack (with Job Detail) ───────────────────── */
function StudentFeedStack() {
  return (
    <Stack.Navigator screenOptions={darkStack}>
      <Stack.Screen
        name="StudentFeed"
        component={StudentFeedScreen}
        options={{ title: "⚡ Part Time — Jobs" }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={({ route }) => ({ title: route.params?.job?.title || "Job Details" })}
      />
    </Stack.Navigator>
  );
}

/* ── Auth Stack ─────────────────────────────────────────────── */
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ ...darkStack, headerShown: false }}
    >
      <Stack.Screen name="Login"    component={LoginScreen}    />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

/* ── Root Navigator ─────────────────────────────────────────── */
export default function AppNavigator() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return null; // Splash handled by Expo

  return (
    <NavigationContainer>
      {currentUser && userProfile
        ? <StudentTabs />   // both roles go to student UI for now; expand for poster
        : <AuthStack />
      }
    </NavigationContainer>
  );
}

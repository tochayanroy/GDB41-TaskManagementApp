import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Login"
        options={{
          drawerLabel: 'Login',
          title: 'Login',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-in" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Register"
        options={{
          drawerLabel: 'Register',
          title: 'Register',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} /> 
          ),
        }}
      />
    </Drawer>
  );
}
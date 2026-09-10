import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { View, Badge, Flex, Heading, ActionButton, Text } from '@adobe/react-spectrum';
import SearchScreen from './pages/SearchScreen';
import SignupScreen from './pages/SignupScreen';
import authService from './auth/AuthService';
import networkManager from './offline/NetworkManager';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = authService.onAuthStateChange((u) => {
      setUser(u);
      setLoading(false);
    });

    const unsubscribeNetwork = networkManager.addListener((status) => {
      setIsOnline(status);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNetwork();
    };
  }, []);

  const handleLogout = () => {
    authService.logOut();
  };

  if (loading) return <View padding="size-400">Loading...</View>;

  return (
    <View minHeight="100vh" backgroundColor="gray-75">
      {/* Global Navbar */}
      <View 
        backgroundColor="gray-100" 
        paddingX="size-600" 
        paddingY="size-200" 
        borderWidth="thin" 
        borderColor="gray-300"
        UNSAFE_style={{ position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap="size-300">
            <Heading level={2} margin={0} UNSAFE_style={{ letterSpacing: '1px', fontWeight: '800' }}>BINAIRE</Heading>
            {!isOnline && (
              <Badge variant="negative">Offline (Cached Mode)</Badge>
            )}
          </Flex>
          {user && (
            <Flex alignItems="center" gap="size-300">
              <Text>Signed in as <b>{user.email}</b></Text>
              <ActionButton onPress={handleLogout} variant="secondary">Log Out</ActionButton>
            </Flex>
          )}
        </Flex>
      </View>

      <Routes>
        <Route path="/" element={user ? <SearchScreen /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={!user ? <SignupScreen /> : <Navigate to="/" />} />
      </Routes>
    </View>
  );
}

export default App;

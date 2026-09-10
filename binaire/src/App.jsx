import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { View, Badge, Flex, Heading, Button, Text, Header, Divider } from '@adobe/react-spectrum';
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
    <View minHeight="100vh" backgroundColor="gray-50">
      <View backgroundColor="gray-50" paddingX="size-800" paddingY="size-200">
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap="size-300">
            <Heading level={2} margin={0}>Binaire Models</Heading>
            {!isOnline && (
              <Badge variant="negative">Offline Mode</Badge>
            )}
          </Flex>
          {user && (
            <Flex alignItems="center" gap="size-300">
              <Text>{user.email}</Text>
              <Button onPress={handleLogout} variant="primary" style="outline">Log Out</Button>
            </Flex>
          )}
        </Flex>
      </View>
      <Divider size="S" />

      <Routes>
        <Route path="/" element={user ? <SearchScreen /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={!user ? <SignupScreen /> : <Navigate to="/" />} />
      </Routes>
    </View>
  );
}

export default App;

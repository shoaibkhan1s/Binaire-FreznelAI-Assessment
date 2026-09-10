import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { View, Badge, Flex } from '@adobe/react-spectrum';
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

  if (loading) return <View padding="size-400">Loading...</View>;

  return (
    <View minHeight="100vh">
      <Flex justifyContent="space-between" padding="size-200" backgroundColor="gray-200">
        <View />
        {!isOnline && (
          <Badge variant="negative">You are currently offline. Using cached data.</Badge>
        )}
      </Flex>
      <Routes>
        <Route path="/" element={user ? <SearchScreen /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={!user ? <SignupScreen /> : <Navigate to="/" />} />
      </Routes>
    </View>
  );
}

export default App;

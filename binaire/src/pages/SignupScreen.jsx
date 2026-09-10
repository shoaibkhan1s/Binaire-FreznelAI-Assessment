import React, { useState } from 'react';
import { Flex, View, Heading, TextField, Button, Text } from '@adobe/react-spectrum';
import authService from '../auth/AuthService';
import { useNavigate } from 'react-router-dom';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.signUp(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.logIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View padding="size-400">
      <Flex direction="column" alignItems="center" gap="size-200" marginTop="size-800">
        <Heading level={1}>Welcome</Heading>
        <Text>Please sign up or log in to continue.</Text>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
          <TextField 
            label="Email" 
            type="email" 
            value={email} 
            onChange={setEmail} 
            isRequired 
            width="100%"
          />
          <TextField 
            label="Password" 
            type="password" 
            value={password} 
            onChange={setPassword} 
            isRequired 
            width="100%"
          />
          
          {error && <Text color="negative">{error}</Text>}
          
          <Flex direction="row" gap="size-200" justifyContent="space-between" marginTop="size-200">
            <Button variant="primary" type="submit" isPending={loading}>Log In</Button>
            <Button variant="secondary" onPress={handleSignup} isPending={loading}>Sign Up</Button>
          </Flex>
        </form>
      </Flex>
    </View>
  );
}

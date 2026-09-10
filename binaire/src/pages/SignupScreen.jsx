import React, { useState } from 'react';
import { Flex, View, Heading, TextField, Button, Text, Form, IllustratedMessage, Content } from '@adobe/react-spectrum';
import authService from '../auth/AuthService';
import { useNavigate } from 'react-router-dom';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
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
    <View 
      padding="size-800" 
      minHeight="calc(100vh - 60px)" 
      backgroundColor="gray-50"
    >
      <Flex direction="column" alignItems="center" justifyContent="center" height="100%">
        <View 
          padding="size-600" 
          backgroundColor="gray-50" 
          borderWidth="thin" 
          borderColor="gray-300" 
          borderRadius="medium"
          width="400px"
        >
          <IllustratedMessage marginY="size-400">
            <Heading>Welcome</Heading>
            <Content>Sign in to access models</Content>
          </IllustratedMessage>

          <Form onSubmit={handleLogin} width="100%">
            <TextField 
              label="Email Address" 
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
            
            {error && <Text color="negative" marginY="size-100">{error}</Text>}
            
            <Flex direction="column" gap="size-200" marginTop="size-400">
              <Button variant="primary" type="submit" isPending={loading} width="100%">Log In</Button>
              <Button variant="secondary" onPress={handleSignup} isPending={loading} width="100%">Create Account</Button>
            </Flex>
          </Form>
        </View>
      </Flex>
    </View>
  );
}

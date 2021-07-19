import React, {useState, useEffect} from 'react';
import {Button, TextInput} from 'react-native';
import auth from '@react-native-firebase/auth';
import SmsRetriever from 'react-native-sms-retriever';

export default function App() {
  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  const [code, setCode] = useState('');

  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    console.log('user', user);
  }

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        // Stop the login flow / Navigate to next page
        console.log('user', user);
      }
    });
  }, []);

  async function confirmCode() {
    try {
      const data = await confirm.confirm(code);
      console.log(data);
    } catch (error) {
      console.log('Invalid code.');
    }
  }

  const onSmsListenerPressed = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();

      if (registered) {
        SmsRetriever.addSmsListener(onReceiveSms);
      }

      console.log(`SMS Listener Registered: ${registered}`);
    } catch (error) {
      console.log(`SMS Listener Error: ${JSON.stringify(error)}`);
    }
  };

  // Handlers
  const getOTP = str => {
    let match = str.match(/\b\d{4}\b/);
    return match && match[0];
  };

  const onReceiveSms = event => {
    const otp = event.message.replace(/[^-.0-9]/g, '');
    setCode(otp);
    console.log('Test', otp);
    SmsRetriever.removeSmsListener();
  };

  return (
    <>
      <TextInput value={code} onChangeText={text => setCode(text)} />
      <Button title="Confirm Code" onPress={() => confirmCode()} />
      <Button
        title="Phone Number Sign In"
        onPress={() => {
          signInWithPhoneNumber('+855 010758731');
          onSmsListenerPressed();
        }}
      />
    </>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/mypages.css';
import { useAuth } from '../context/AuthContext'; 
import { AuthContextType } from '../context/AuthContext';

export const MyPages = () => {
  const [subscriptionLevel, setSubscriptionLevel] = useState('');
  const { sessionId, userId } = useAuth() as AuthContextType;

  useEffect(() => {
    console.log("Session ID from AuthContext:", sessionId);
    if (!sessionId) {
      console.error('Session ID is missing');
      return;
    }

    axios.get('http://localhost:3000/subscription/session', { params: { sessionId } })
      .then(response => {
        console.log('Response from server:', response.data);
        setSubscriptionLevel(response.data.subscriptionLevel);
      })
      .catch(error => {
        console.error('There was an error fetching the subscription level!', error);
      });
  }, [sessionId]);

  const handleUpgradeDowngrade = (level: string) => {
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    axios.post('http://localhost:3000/subscription', { userId, subscriptionLevel: level })
      .then(response => {
        console.log('Updated subscription level to:', level); 
        setSubscriptionLevel(level);
        alert(response.data.message);
      })
      .catch(error => {
        console.error('There was an error updating the subscription level!', error);
      });
  };

  return (
    <div className="mypages-container">
      <h1 className="mypages-title">My Pages</h1>
      <p className="mypages-subscription">Current Subscription Level: <strong>{subscriptionLevel}</strong></p>

      <div className="mypages-buttons">
        <p className="mypages-change-text">Change Subscription Level:</p>
        <button
          onClick={() => handleUpgradeDowngrade('basic')}
          className="mypages-button"
        >
          Basic
        </button>
        <button
          onClick={() => handleUpgradeDowngrade('insights')}
          className="mypages-button"
        >
          Insight
        </button>
        <button
          onClick={() => handleUpgradeDowngrade('elite')}
          className="mypages-button"
        >
          Elite
        </button>
      </div>
    </div>
  );
};

export default MyPages;

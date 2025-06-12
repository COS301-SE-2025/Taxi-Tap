import React, { useState } from 'react';
import DriverOffline from './DriverOffline';
import DriverOnline from './DriverOnline';

export default function DriverHomeScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [todaysEarnings] = useState(0.00); 
  const handleGoOnline = () => {
    setIsOnline(true);
  };

  const handleGoOffline = () => {
    setIsOnline(false);
  };

  return (
    <>
      {isOnline ? (
        <DriverOnline 
          onGoOffline={handleGoOffline} 
          todaysEarnings={todaysEarnings}
        />
      ) : (
        <DriverOffline 
          onGoOnline={handleGoOnline} 
          todaysEarnings={todaysEarnings}
        />
      )}
    </>
  );
} 
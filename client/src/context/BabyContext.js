// context/BabyContext.js
import React, { createContext, useState, useEffect } from 'react';

export const BabyContext = createContext();

export const BabyProvider = ({ children }) => {
  const [selectedBabyId, setSelectedBabyId] = useState(localStorage.getItem('focusedBabyId') || '');

  useEffect(() => {
    if (selectedBabyId) {
      localStorage.setItem('focusedBabyId', selectedBabyId);
    } else {
      localStorage.removeItem('focusedBabyId');
    }
  }, [selectedBabyId]);

  return (
    <BabyContext.Provider value={{ selectedBabyId, setSelectedBabyId }}>
      {children}
    </BabyContext.Provider>
  );
};

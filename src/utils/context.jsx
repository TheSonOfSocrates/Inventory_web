import React, { createContext, useContext, useState } from 'react';

const MyContext = createContext();

const MyContextProvider = ({ children }) => {
  const [editableValue, setEditableValue] = useState(false);

  return (
    <MyContext.Provider value={{ editableValue, setEditableValue }}>
      {children}
    </MyContext.Provider>
  );
};

export { MyContext, MyContextProvider };

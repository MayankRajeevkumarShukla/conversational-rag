// src/hooks/useChatHistory.js

import { useState } from 'react';

const useChatHistory = () => {
  const [history, setHistory] = useState([]);

  const addMessage = (role, content) => {
    setHistory([...history, { role, content }]);
  };

  return [history, addMessage];
};

export default useChatHistory;

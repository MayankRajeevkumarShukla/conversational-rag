// src/components/Chat.jsx

import React, { useState, useEffect } from 'react';
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import setupVectorStore from '../vectorStoreSetup';

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [vectorStore, setVectorStore] = useState(null);
  const [ragChain, setRagChain] = useState(null);

  useEffect(() => {
    async function initialize() {
      const vectorStoreInstance = await setupVectorStore();
      setVectorStore(vectorStoreInstance);

      const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
      const prompt = await pull("rlm/rag-prompt");
      const chain = await createStuffDocumentsChain({
        llm,
        prompt,
        outputParser: new StringOutputParser(),
      });

      setRagChain(chain);
    }

    initialize();
  }, []);

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSubmit = async () => {
    if (!input || !ragChain) return;

    // Retrieve context and generate response
    const retriever = vectorStore.asRetriever();
    const context = await retriever.invoke(input);
    const response = await ragChain.invoke({
      context,
      question: input,
    });

    // Update chat history
    setChatHistory([...chatHistory, { role: 'user', content: input }, { role: 'ai', content: response }]);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" value={input} onChange={handleInputChange} />
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
};

export default Chat;

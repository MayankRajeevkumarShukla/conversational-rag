import { useState } from 'react';
import './App.css';
import setupVectorStore from './vectorStoreSetup'; // Import your setupVectorStore function

function App() {
  const [question, setQuestion] = useState(''); // State to hold the user's input question
  const [answer, setAnswer] = useState(''); // State to hold the AI's response
  const [chatHistory, setChatHistory] = useState([]); // State to manage chat history
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [vectorStore, setVectorStore] = useState(null); // State to hold the vector store instance

  // Initialize the vector store when the component mounts
  useState(() => {
    const initializeVectorStore = async () => {
      const store = await setupVectorStore();
      setVectorStore(store);
    };

    initializeVectorStore();
  }, []);

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate retrieval and generation
    try {
      const context = await vectorStore.asRetriever().invoke(question); // Retrieve relevant context
      const response = await vectorStore.llm.invoke({ question, context }); // Generate the response

      // Update the chat history
      const newChatHistory = [
        ...chatHistory,
        { type: 'user', text: question },
        { type: 'ai', text: response }
      ];

      setChatHistory(newChatHistory);
      setAnswer(response);
      setQuestion('');
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Vite + React + RAG Chat</h1>

      <div className="chat-container">
        {chatHistory.map((message, index) => (
          <div key={index} className={`chat-message ${message.type}`}>
            {message.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !question}>
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default App;

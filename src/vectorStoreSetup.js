// src/vectorStoreSetup.js

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fetchDocumentsFromDatabase from './dataBaseLoader'; // Import the custom database loader function

async function setupVectorStore() {
  try {
    // Fetch documents from the database
    const docs = await fetchDocumentsFromDatabase();

    // Check if documents were fetched successfully
    if (!docs || docs.length === 0) {
      console.error("No documents fetched from the database.");
      return null; // Return null or handle the scenario as needed
    }

    // Split documents into manageable chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });

    // Prepare the documents for splitting
    const formattedDocs = docs.map(doc => ({
      pageContent: doc.content, // Adjust this if your document structure is different
      metadata: { id: doc.id }   // You can add any metadata needed for your use case
    }));

    // Split documents into chunks
    const splits = await textSplitter.splitDocuments(formattedDocs);

    // Check if the API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key is missing. Please set it in the .env file.");
      return null; // Return null or handle the scenario as needed
    }

    // Create embeddings for the chunks and set up the vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(splits, new OpenAIEmbeddings({
      openAIApiKey: apiKey
    }));

    return vectorStore;
  } catch (error) {
    console.error("Error setting up vector store:", error);
    return null; // Return null or handle the error as needed
  }
}

export default setupVectorStore;

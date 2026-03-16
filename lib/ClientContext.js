"use client";

import { createContext, useContext, useState } from 'react';

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  const [clientId, setClientId] = useState(1);
  const [clientName, setClientName] = useState("Amit Sharma");
  
  const clients = [
    { id: 1, name: "Amit Sharma" },
    { id: 2, name: "Priya Patel" },
    { id: 3, name: "Rahul Verma" }
  ];

  const value = {
    clientId,
    clientName,
    setClient: (id) => {
      const client = clients.find(c => c.id === Number(id));
      if (client) {
        setClientId(client.id);
        setClientName(client.name);
      }
    },
    clients
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  return useContext(ClientContext);
}

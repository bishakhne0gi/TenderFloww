import React, { createContext, useContext, useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import "../flow/config";

export const FlowContext = createContext();

const FlowProvider = ({ children }) => {
  const [user, setUser] = useState({ loggedIn: null });
  const [txId, setTxId] = useState();
  const [status, setStatus] = useState();

  useEffect(() => {
    fcl.currentUser.subscribe((curruser) => {
      setUser(curruser);
    });
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      const transactionStatus = await fcl.tx(txId).onceSealed();
      setStatus(transactionStatus);
    };

    fetchStatus();
  }, [txId]);

  return (
    <FlowContext.Provider value={{ user, setTxId, status }}>
      {children}
    </FlowContext.Provider>
  );
};

export const FlowState = () => {
  return useContext(FlowContext);
};

export default FlowProvider;

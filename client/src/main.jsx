import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import FlowProvider from "./context/FlowProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FlowProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FlowProvider>
  </React.StrictMode>
);

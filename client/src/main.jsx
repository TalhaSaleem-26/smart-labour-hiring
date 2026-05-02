import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom"; 
import store from "./store/store.js";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>   
        <Toaster position="top-center" />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
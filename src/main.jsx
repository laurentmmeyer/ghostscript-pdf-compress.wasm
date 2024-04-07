import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Commercial from "./Commercial.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Pricing from "./Pricing.jsx";
import Success from "./Success.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Router>
      <Routes>
        <Route path="/" element={<Commercial />} />
        <Route
          path="/pricing"
          element={
            <Commercial>
              <Pricing />
            </Commercial>
          }
        />
        <Route
          path="/success"
          element={
            <Commercial>
              <Success />
            </Commercial>
          }
        />
      </Routes>
    </Router>
  </>,
);

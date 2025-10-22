import React from "react";
import {SparqlQueryInterface} from "./SparqlQueryInterface"
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
   <Router>
      <SparqlQueryInterface />
    </Router>
  )
}

export default App

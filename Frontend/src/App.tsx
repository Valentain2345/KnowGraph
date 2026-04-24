import {SparqlQueryInterface} from "./SparqlQueryInterface"
import { BrowserRouter as Router } from "react-router-dom";
import {SparqlProvider} from "./SparqlContext"
function App() {
  return (
   <Router>
      <SparqlProvider>
        <SparqlQueryInterface />
      </SparqlProvider>
    </Router>
  )
}

export default App

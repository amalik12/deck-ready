import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from '../Home';

function App() {
  return (
    <div className="App">
      <Router>
      <h1>Is Your Library Deck Ready?</h1>
      <input type="text" placeholder="Enter your Steam profile URL" />
        <Routes>
          {/* <Route path="/details">
            <Details />
          </Route> */}
          <Route path="/">
            <Home />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

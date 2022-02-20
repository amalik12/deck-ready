import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from '../Home';
import Details from '../Details';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/details" element={<Details />} />
          <Route index element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

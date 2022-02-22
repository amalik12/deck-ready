import {FormEventHandler, useState} from 'react';
import './Home.css';
import {useNavigate} from 'react-router-dom';

const Home = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    if (!url) {
      return;
    }
    navigate('/details', {state: {url}});
  };

  return (
    <div className="Home">
      <h1>Is Your Library Deck Ready?</h1>
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          id="profile-input"
          className="input"
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter your Steam profile URL"
        />
        <button className="submit-button" type="submit">
          Go
        </button>
      </form>
      <div className="or-text">or</div>
      <a href="/auth/steam" className="steam-button">
        Sign in with <i className="steam-icon fa-brands fa-steam-symbol" />
        Steam
      </a>
    </div>
  );
};
export default Home;

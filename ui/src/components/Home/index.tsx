import {FormEventHandler, useState} from 'react';
import './Home.css';
import {useLocation, useNavigate} from 'react-router-dom';

interface HomeState {
  error: string | null;
}
const Home = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state as HomeState;
  const error = state?.error;

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
      {error && (
        <div className="error-text">
          {error}
          {error.includes('Public') && (
            <a href="https://steamcommunity.com/my/edit/settings">
              privacy settings.
            </a>
          )}
        </div>
      )}
      <footer>This site is not affiliated with Steam or Valve.</footer>
    </div>
  );
};
export default Home;

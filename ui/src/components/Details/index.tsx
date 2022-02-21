import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import getGameDetails, {
  CompatibilityCategory,
  GameBuild,
  GameCompatibility,
  GameDetails,
} from '../../api';
import Modal from '../Modal/Modal';
import Game from './components/Game';
import TestResult from './components/TestResult';
import './Details.css';

interface DetailsState {
  url: string;
}

const Details = () => {
  const location = useLocation();
  const {url} = location.state as DetailsState;

  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState<GameDetails[]>([]);
  const [compatibility, setCompatibility] = useState<GameCompatibility>();
  const [gameName, setGameName] = useState('');
  const allGames = useRef<GameDetails[]>([]);

  const sortGames = (games: GameDetails[]) => {
    const verified = [];
    const playable = [];
    const unsupported = [];
    const unknown = [];
    for (const game of games) {
      switch (game.compatibility.category) {
        case CompatibilityCategory.Verified:
          verified.push(game);
          break;
        case CompatibilityCategory.Playable:
          playable.push(game);
          break;
        case CompatibilityCategory.Unsupported:
          unsupported.push(game);
          break;
        case CompatibilityCategory.Unknown:
          unknown.push(game);
          break;
        default:
          break;
      }
    }
    return [...verified, ...playable, ...unsupported, ...unknown];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getGameDetails(url);
      allGames.current = sortGames(data);
      setGames(allGames.current);
      setLoading(false);
    };
    fetchData();
  }, [url]);

  useEffect(() => {
    if (compatibility) {
      setIsOpen(true);
    }
  }, [compatibility]);

  useEffect(() => {
    if (!gameName) {
      setGames(allGames.current);
    } else {
      const newList = [];
      for (const game of allGames.current) {
        const stripName = (name: string) =>
          name
            .replaceAll(' ', '')
            .replaceAll('-', '')
            .replaceAll('™', '')
            .toLowerCase();
        const stripped = stripName(game.name);

        const queryStripped = stripName(gameName);
        if (stripped.startsWith(queryStripped)) {
          newList.push(game);
        }
      }
      setGames(newList);
    }
  }, [gameName]);

  const categoryName = compatibility
    ? CompatibilityCategory[compatibility.category]
    : 'Unknown';
  return (
    <div className="Details">
      {loading ? (
        <div className="sk-folding-cube">
          <div className="sk-cube1 sk-cube"></div>
          <div className="sk-cube2 sk-cube"></div>
          <div className="sk-cube4 sk-cube"></div>
          <div className="sk-cube3 sk-cube"></div>
        </div>
      ) : (
        <>
          <Modal
            isOpen={isOpen}
            dismiss={() => {
              setIsOpen(false);
              setCompatibility(undefined);
            }}
          >
            <div className="modal-header">
              <span className="modal-title">Compatibility</span>
              <div className="compatibility-status">
                <img
                  className="status-icon"
                  src={`/${categoryName.toLowerCase()}.svg`}
                />
                {categoryName}
              </div>
            </div>
            <div className="modal-body">
              <div className="category-description">
                {compatibility?.description}
              </div>
              {compatibility && (
                <>
                  {compatibility?.tests.map((test, index) => (
                    <TestResult key={index} test={test} />
                  ))}
                  <div className="test-info">
                    {compatibility.test_timestamp && (
                      <div className="test-stat">
                        <span className="stat-name">Tested on: </span>
                        <span className="stat-value">
                          {new Intl.DateTimeFormat(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }).format(
                            new Date(compatibility.test_timestamp * 1000)
                          )}
                        </span>
                      </div>
                    )}
                    {compatibility.recommended_build && (
                      <div className="test-stat">
                        <span className="stat-name">Tested version: </span>
                        <span className="stat-value">
                          {compatibility.recommended_build === GameBuild.Native
                            ? 'Native Linux'
                            : 'Proton'}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Modal>
          <input
            className="input search"
            type="text"
            value={gameName}
            onChange={e => setGameName(e.target.value)}
            placeholder="Search for a game"
          />
          {games.map(game => (
            <Game
              key={game.appId}
              game={game}
              setCompatibility={setCompatibility}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Details;

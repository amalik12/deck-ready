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
  const verfiedCount = useRef(0);
  const playableCount = useRef(0);
  const unsupportedCount = useRef(0);
  const unknownCount = useRef(0);

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
    verfiedCount.current = verified.length;
    playableCount.current = playable.length;
    unsupportedCount.current = unsupported.length;
    unknownCount.current = unknown.length;

    const makeDummyGame = (category: CompatibilityCategory): GameDetails => ({
      appId: -1,
      logo: '',
      name: '',
      compatibility: {
        category: category,
        description: '',
        test_timestamp: 0,
        tests: [],
        recommended_build: GameBuild.Proton,
      },
    });
    return [
      makeDummyGame(CompatibilityCategory.Verified),
      ...verified,
      makeDummyGame(CompatibilityCategory.Playable),
      ...playable,
      makeDummyGame(CompatibilityCategory.Unsupported),
      ...unsupported,
      makeDummyGame(CompatibilityCategory.Unknown),
      ...unknown,
    ];
  };

  const jumpToSection = (section: string) => {
    const element = document.getElementById(section + '-games');
    element?.scrollIntoView({behavior: 'smooth'});
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
        if (game.appId === -1 || stripped.startsWith(queryStripped)) {
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
          <h1 className="summary-text">{`${
            verfiedCount.current + playableCount.current
          } games in your library are confirmed to be playable on the Steam Deck.`}</h1>
          <div className="result-graph">
            <div
              className="graph-section item-verified"
              onClick={() => jumpToSection('verified')}
              style={{
                width:
                  (verfiedCount.current / allGames.current.length) * 100 + '%',
              }}
            />
            <div
              className="graph-section item-playable"
              onClick={() => jumpToSection('playable')}
              style={{
                width:
                  (playableCount.current / allGames.current.length) * 100 + '%',
              }}
            />
            <div
              className="graph-section item-unsupported"
              onClick={() => jumpToSection('unsupported')}
              style={{
                width:
                  (unsupportedCount.current / allGames.current.length) * 100 +
                  '%',
              }}
            />
            <div
              className="graph-section item-unknown"
              onClick={() => jumpToSection('unknown')}
            />
          </div>
          <div className="result-details">
            <div
              className="result-item compatibility-status"
              onClick={() => jumpToSection('verified')}
            >
              <div className="result-icon item-verified" />
              <div className="result-item-name">
                Verified{' '}
                {(
                  verfiedCount.current / allGames.current.length
                ).toLocaleString(undefined, {
                  style: 'percent',
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div
              className="result-item compatibility-status"
              onClick={() => jumpToSection('playable')}
            >
              <div className="result-icon item-playable" />
              <div className="result-item-name">
                Playable{' '}
                {(
                  playableCount.current / allGames.current.length
                ).toLocaleString(undefined, {
                  style: 'percent',
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div
              className="result-item compatibility-status"
              onClick={() => jumpToSection('unsupported')}
            >
              <div className="result-icon item-unsupported" />
              <div className="result-item-name">
                Unsupported{' '}
                {(
                  unsupportedCount.current / allGames.current.length
                ).toLocaleString(undefined, {
                  style: 'percent',
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div
              className="result-item compatibility-status"
              onClick={() => jumpToSection('unknown')}
            >
              <div className="result-icon item-unknown" />
              <div className="result-item-name">
                Unknown{' '}
                {(
                  unknownCount.current / allGames.current.length
                ).toLocaleString(undefined, {
                  style: 'percent',
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
          <div className="library-filter">
            <i className="search-icon fa-solid fa-magnifying-glass" />
            <input
              className="input search"
              type="text"
              value={gameName}
              onChange={e => setGameName(e.target.value)}
              placeholder="Search for a game"
            />
          </div>
          {games.map(game =>
            game.appId !== -1 ? (
              <Game
                key={game.appId}
                game={game}
                setCompatibility={setCompatibility}
              />
            ) : (
              <div
                id={`${CompatibilityCategory[
                  game.compatibility.category
                ].toLowerCase()}-games`}
              />
            )
          )}
        </>
      )}
    </div>
  );
};

export default Details;

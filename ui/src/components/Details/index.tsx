import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import getGameDetails, {
  CompatibilityCategory,
  GameBuild,
  GameCompatibility,
  GameDetails,
} from '../../api';
import CompatibilityModal from './components/CompatibilityModal';
import Game from './components/Game';
import './Details.css';

dayjs.extend(relativeTime);

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
  const [recentGames, setRecentGames] = useState<GameDetails[]>([]);
  const [showUpdates, setShowUpdates] = useState(true);

  const navigate = useNavigate();

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

  const jumpToGame = (appId: number) => {
    const element = document.getElementById('game-' + appId);
    element?.scrollIntoView({behavior: 'smooth'});
  };

  const categoryName = (game: GameDetails) =>
    CompatibilityCategory[game.compatibility.category].toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getGameDetails(url);
        allGames.current = sortGames(data);
        setGames(allGames.current);
        setLoading(false);
        const lastUpdatedList = [...allGames.current].sort(
          (a, b) =>
            (b?.compatibility?.test_timestamp || 0) -
            (a.compatibility.test_timestamp || 0)
        );
        const trimmedRecentList = [];
        const weekAgo = dayjs().subtract(1, 'week');
        for (const game of lastUpdatedList) {
          if (dayjs.unix(game?.compatibility?.test_timestamp) >= weekAgo) {
            trimmedRecentList.push(game);
          }
        }
        setRecentGames(trimmedRecentList);
      } catch (error) {
        navigate('/', {
          state: {error: (error as Error).message},
          replace: true,
        });
      }
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
          <CompatibilityModal
            compatibility={compatibility as GameCompatibility}
            dismissFn={() => {
              setIsOpen(false);
              setCompatibility(undefined);
            }}
            isOpen={isOpen}
          />
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
          {recentGames.length > 0 && (
            <>
              <h2 className="recent-updates">Recent updates</h2>
              <span
                onClick={() => setShowUpdates(value => !value)}
                className="updates-toggle"
              >
                {showUpdates ? 'hide' : 'show'}
              </span>
              <div
                className="recent-updates-list"
                style={{maxHeight: showUpdates ? 600 : 0}}
              >
                {recentGames.map(game => (
                  <div
                    onClick={() => jumpToGame(game.appId)}
                    className="recent-updates-detail"
                    key={game.appId}
                  >
                    <div className="compatibility-status">
                      <img
                        className="status-icon"
                        src={`/${categoryName(game)}.svg`}
                      />
                      {categoryName(game)}
                    </div>
                    <div className="recent-update-name">{game.name}</div>
                    <div className="update-time">
                      {dayjs.unix(game.compatibility.test_timestamp).fromNow()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
          <div className="library-list">
            {games.map(game =>
              game.appId !== -1 ? (
                <Game
                  key={game.appId}
                  game={game}
                  setCompatibility={setCompatibility}
                />
              ) : (
                <div
                  key={`${CompatibilityCategory[
                    game.compatibility.category
                  ].toLowerCase()}-games`}
                  id={`${CompatibilityCategory[
                    game.compatibility.category
                  ].toLowerCase()}-games`}
                  className="divider"
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Details;

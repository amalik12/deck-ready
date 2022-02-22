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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getGameDetails(url);
        allGames.current = sortGames(data);
        setGames(allGames.current);
        setLoading(false);
      } catch (error) {
        navigate('/', {
          state: {error: (error as any).message},
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

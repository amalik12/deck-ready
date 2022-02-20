import React from 'react';
import {CompatibilityCategory, GameDetails, TestResult} from '../../../api';
import './Game.css';

interface GameProps {
  game: GameDetails;
  setTests: (tests: TestResult[]) => void;
}

const Game: React.FC<GameProps> = ({game, setTests}) => {
  let statusIcon;
  switch (game.compatibility.category) {
    case CompatibilityCategory.Verified:
      statusIcon = '/verified.svg';
      break;
    case CompatibilityCategory.Playable:
      statusIcon = '/playable.svg';
      break;
    case CompatibilityCategory.Unsupported:
      statusIcon = '/unsupported.svg';
      break;
    case CompatibilityCategory.Unknown:
      statusIcon = '/unknown.svg';
      break;
    default:
      break;
  }

  const categoryName = CompatibilityCategory[game.compatibility.category];
  return (
    <div className={`Game ${categoryName.toLowerCase()}`}>
      <a
        className="game-link"
        href={`https:/store.steampowered.com/app/${game.appId}/`}
      >
        <img
          id="game-logo"
          loading="lazy"
          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
        />
      </a>
      <div className="game-info">
        <div className="game-name">{game.name}</div>
        <div className="compatibility-status">
          <img className="status-icon" src={statusIcon} />
          {categoryName}
        </div>
      </div>
      <button
        className="info-button"
        onClick={() => setTests(game.compatibility.tests)}
      >
        More info
      </button>
    </div>
  );
};

export default Game;

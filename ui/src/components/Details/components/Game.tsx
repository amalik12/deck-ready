import React from 'react';
import {
  CompatibilityCategory,
  GameCompatibility,
  GameDetails,
} from '../../../api';
import './Game.css';

interface GameProps {
  game: GameDetails;
  setCompatibility: (compatibility: GameCompatibility) => void;
}

const Game: React.FC<GameProps> = ({game, setCompatibility}) => {
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
          <img
            className="status-icon"
            src={`/${categoryName.toLowerCase()}.svg`}
          />
          {categoryName}
        </div>
      </div>
      <button
        className="info-button"
        onClick={() => setCompatibility(game.compatibility)}
      >
        More info
      </button>
    </div>
  );
};

export default Game;

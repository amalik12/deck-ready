import React, {useState} from 'react';
import {CompatibilityCategory, GameDetails} from '../../../api';
import Modal from '../../Modal/Modal';
import './Game.css';
import TestResult from './TestResult';

interface GameProps {
  game: GameDetails;
}

const Game: React.FC<GameProps> = ({game}) => {
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

  const [isOpen, setIsOpen] = useState(false);

  const categoryName = CompatibilityCategory[game.compatibility.category];

  console.log(isOpen);

  return (
    <div className={`Game ${categoryName.toLowerCase()}`}>
      <Modal isOpen={isOpen} dismiss={() => setIsOpen(false)}>
        <div className="modal-body">
          {game.compatibility.tests.map(test => (
            <TestResult test={test} />
          ))}
        </div>
      </Modal>
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
      <button className="info-button" onClick={() => setIsOpen(true)}>
        More info
      </button>
    </div>
  );
};

export default Game;

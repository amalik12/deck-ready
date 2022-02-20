import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import getGameDetails, {
  GameDetails,
  TestResult as TestResultInterface,
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
  const [tests, setTests] = useState<TestResultInterface[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getGameDetails(url);
      setGames(data);
      setLoading(false);
    };
    fetchData();
  }, [url]);

  useEffect(() => {
    if (tests.length > 0) {
      setIsOpen(true);
    }
  }, [tests]);

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
              setTests([]);
            }}
          >
            <div className="modal-body">
              {tests.map(test => (
                <TestResult test={test} />
              ))}
            </div>
          </Modal>
          {games.map(game => (
            <Game key={game.appId} game={game} setTests={setTests} />
          ))}
        </>
      )}
    </div>
  );
};

export default Details;

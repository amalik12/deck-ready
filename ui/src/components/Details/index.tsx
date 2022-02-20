import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import getGameDetails, {GameDetails} from '../../api';
import Game from './components/Game';

interface DetailsState {
  url: string;
}

const Details = () => {
  const location = useLocation();
  const {url} = location.state as DetailsState;

  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<GameDetails[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getGameDetails(url);
      setGames(data);
      setLoading(false);
    };
    fetchData();
  }, [url]);

  return (
    <div className="Details">
      {games.map(game => (
        <Game key={game.appId} game={game} />
      ))}
    </div>
  );
};

export default Details;

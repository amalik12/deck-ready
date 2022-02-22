import {Navigate, useParams} from 'react-router-dom';

const SigninRedirect = () => {
  const {id} = useParams();
  console.log('siginin');

  return (
    <Navigate
      to="/details"
      state={{url: 'https://steamcommunity.com/profiles/' + id}}
    />
  );
};

export default SigninRedirect;

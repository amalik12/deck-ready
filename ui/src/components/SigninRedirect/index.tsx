import {Navigate, useParams} from 'react-router-dom';

const SigninRedirect = () => {
  const {id} = useParams();

  return (
    <Navigate
      to="/details"
      state={{url: 'https://steamcommunity.com/profiles/' + id}}
    />
  );
};

export default SigninRedirect;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import Game from './pages/Game.tsx';
import { useSelector } from 'react-redux';
import { RootState } from './store/store.ts';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const ProtectedRoute = ({ Element }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  if (!isAuthenticated) {
    return <Navigate to='/login' />;
  }
  return <Element />;
};

const App = () => {
  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/' element={<ProtectedRoute Element={Game} />} />
          <Route path='/game' element={<ProtectedRoute Element={Game} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

import { Button, FormControl, Grid, Input, InputLabel } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authAction, authThunk } from '../store/authSlice.ts';
import { AppDispatch, RootState } from '../store/store.ts';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { gameThunk } from '../store/gameSlice.ts';

const SignUp = () => {
  const { username, password } = useSelector(
    (state: RootState) => state.auth.userCredentialsInput,
  );
  const dispatch = useDispatch<AppDispatch>();
  const { error: apiError, status: apiStatus } = useSelector(
    (state: RootState) => state.auth.apiState.signup,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (apiStatus === 'fulfilled') {
      dispatch(gameThunk.start());
      const timer = setTimeout(() => {
        dispatch(authAction.clearCredentials());
        dispatch(authAction.clearApiError({ api: 'signup' }));
        navigate('/game', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (apiStatus === 'rejected') {
      const timer = setTimeout(() => {
        dispatch(authAction.clearApiError({ api: 'signup' }));
      }, 2000);
      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [apiStatus, dispatch, navigate]);

  return (
    <Grid
      container
      spacing={4}
      direction='column'
      alignItems='center'
      justifyContent='center'
      sx={{ minHeight: '100vh' }}
    >
      <Grid item>
        <Typography
          color={apiStatus === 'rejected' ? '#c1121f' : '#588157'}
          style={
            apiStatus === 'rejected' || apiStatus === 'fulfilled'
              ? { visibility: 'visible' }
              : { visibility: 'hidden' }
          }
        >
          {apiStatus === 'rejected'
            ? apiError?.message
            : 'Signup Successful ✔'}
        </Typography>
      </Grid>
      <Grid item></Grid>
      <Grid item>
        <FormControl>
          <InputLabel htmlFor='username'>Username</InputLabel>
          <Input
            id='username'
            type='username'
            placeholder='Username'
            onChange={(e) =>
              dispatch(authAction.setUsernameInCredentials(e.target.value))
            }
            value={username}
          />
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl>
          <InputLabel htmlFor='password'>Password</InputLabel>
          <Input
            id='password'
            type='password'
            placeholder='Password'
            onChange={(e) =>
              dispatch(authAction.setPasswordInCredentials(e.target.value))
            }
            value={password}
          />
        </FormControl>
      </Grid>
      <Grid item>
        <Grid
          container
          spacing={2}
          alignItems='center'
          justifyContent='center'
          marginTop={2}
        >
          <Grid item>
            <Button type='button' onClick={() => navigate('/login')}>
              Sign In ❓
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              type='submit'
              disabled={apiStatus !== 'idle'}
              onClick={() =>
                dispatch(
                  authThunk.signup({
                    username,
                    password,
                  }),
                )
              }
            >
              Sign Up
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SignUp;

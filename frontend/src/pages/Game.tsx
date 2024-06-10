import { Button, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { authThunk } from '../store/authSlice.ts';
import { AppDispatch, RootState } from '../store/store.ts';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { gameAction, gameThunk } from '../store/gameSlice.ts';
import Typography from '@mui/material/Typography';
import './Game.css';

const Game = () => {
  const dispatch = useDispatch<AppDispatch>();
  const chips = useSelector((state: RootState) => state.game.gameState.chips);
  const bet = useSelector((state: RootState) => state.game.gameState.bet);
  const stake = useSelector((state: RootState) => state.game.gameState.stake);
  const diceRoll = useSelector(
    (state: RootState) => state.game.gameState.diceRoll,
  );
  const winRate = useSelector(
    (state: RootState) => state.game.gameState.winRate,
  );
  const delta = useSelector((state: RootState) => state.game.gameState.delta);
  const apiStatus = useSelector(
    (state: RootState) => state.game.apiState.rollDie.status,
  );
  const apiError = useSelector(
    (state: RootState) => state.game.apiState.rollDie.error,
  );

  return (
    // 1 Grid for entire Page
    <Grid
      container
      spacing={2}
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
      direction='row'
    >
      <Grid item>
        <Typography
          color={apiStatus === 'rejected' ? '#c1121f' : '#588157'}
          style={
            apiStatus === 'rejected'
              ? { visibility: 'visible' }
              : { visibility: 'hidden' }
          }
        >
          {apiStatus === 'rejected'
            ? apiError?.message
            : `Some Error Occurred ❌`}
        </Typography>
      </Grid>
      <Grid
        container
        spacing={2}
        justifyContent='center'
        alignItems='center'
        minHeight='70vh'
        direction='row'
      >
        {/* Left Grid */}
        <Grid
          item
          xs={6}
          container
          spacing={6}
          direction='column'
          alignItems='center'
        >
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h6' className='heading'>
              Set Bet
            </Typography>
          </Grid>
          <Grid
            item
            xs={6}
            container
            justifyContent='center'
            alignItems='center'
          >
            <Grid item xs={2} container justifyContent='center'>
              <Button
                variant={bet === '7u' ? 'contained' : 'outlined'}
                onClick={() => dispatch(gameAction.setBet('7u'))}
              >
                7 <ArrowDownwardIcon />
              </Button>
            </Grid>
            <Grid item xs={2} container justifyContent='center'>
              <Button
                variant={bet === '7' ? 'contained' : 'outlined'}
                onClick={() => dispatch(gameAction.setBet('7'))}
              >
                7
              </Button>
            </Grid>
            <Grid item xs={2} container justifyContent='center'>
              <Button
                variant={bet === '7d' ? 'contained' : 'outlined'}
                onClick={() => dispatch(gameAction.setBet('7d'))}
              >
                7 <ArrowUpwardIcon />
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h6' className='heading'>
              Set Stake
            </Typography>
          </Grid>
          <Grid item xs={6} container justifyContent='center'>
            <Grid item xs={2} container justifyContent='center'>
              <Button
                variant={stake === 100 ? 'contained' : 'outlined'}
                onClick={() => dispatch(gameAction.setStake(100))}
              >
                100
              </Button>
            </Grid>
            <Grid item xs={2} container justifyContent='center'>
              <Button
                variant={stake === 200 ? 'contained' : 'outlined'}
                onClick={() => dispatch(gameAction.setStake(200))}
              >
                200
              </Button>
            </Grid>
            <Grid item xs={2} container justifyContent='center'>
              <Button
                variant={stake === 500 ? 'contained' : 'outlined'}
                onClick={() => dispatch(gameAction.setStake(500))}
              >
                500
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={6} container justifyContent='center'>
            <Grid item xs={2} container justifyContent='center'>
              <Button
                variant='contained'
                onClick={() => dispatch(gameThunk.rollDie())}
              >
                Roll Die
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {/* Right Grid */}
        <Grid
          item
          xs={6}
          container
          spacing={6}
          direction='column'
          alignItems='center'
        >
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h5' className='heading'>
              Chips: {chips}
            </Typography>
          </Grid>
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h5' className='heading'>
              Last Bet: {bet}
            </Typography>
          </Grid>
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h5' className='heading'>
              Last Stake: {stake}
            </Typography>
          </Grid>
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h5' className='heading'>
              Last Dice Roll:{' '}
              {diceRoll.length > 0
                ? `[ ${diceRoll[0]}, ${diceRoll[1]} ]`
                : `[]`}
            </Typography>
          </Grid>
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h5' className='heading'>
              Last Win Rate: {winRate}
            </Typography>
          </Grid>
          <Grid item xs={2} container justifyContent='center'>
            <Typography variant='h5' className='heading'>
              Delta: {delta}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} container spacing={2}>
        {/* Reset Below Grid */}
        <Grid item xs={6} container justifyContent='right'>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => {
              dispatch(gameAction.clearApiError({ api: 'rollDie' }));
              dispatch(gameThunk.clearSession());
              dispatch(gameThunk.start());
            }}
          >
            Reset
          </Button>
        </Grid>
        {/* Logout Below Grid */}
        <Grid item xs={6} container justifyContent='left'>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => {
              dispatch(gameAction.clearApiError({ api: 'rollDie' }));
              dispatch(authThunk.logout());
              dispatch(gameThunk.clearSession());
            }}
          >
            Logout
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Game;

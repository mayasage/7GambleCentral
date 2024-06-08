import './App.css'
import {
  Button,
  Grid,
  Typography,
} from "@mui/material";
import {SetStateAction, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import { RootState, AppDispatch } from './store/store';
import { fetchDiceRoll } from './store/gameSlice';
import StakeOption from "./components/StakeOption.tsx";

function App() {
  const [selectedStake1, setSelectedStake1] = useState(null);
  const [selectedStake2, setSelectedStake2] = useState(null);

  const handleStakeClick1 = (value: string | SetStateAction<null>) => {
    // @ts-ignore
    setSelectedStake1(value);
  };

  const handleStakeClick2 = (value: string | SetStateAction<null>) => {
    // @ts-ignore
    setSelectedStake2(value);
  };

  const dispatch = useDispatch<AppDispatch>();
  const { chips, diceRoll, loading, error } = useSelector((state: RootState) => state.game);

  const handleBetClick = async () => {
    try {
      console.log(`chips: ${chips}`);
      console.log(`diceRoll: ${diceRoll}`);
      console.log(`loading: ${loading}`);
      console.log(`error: ${error}`);
      await dispatch(fetchDiceRoll());
    } catch (error) {
      console.error('Error fetching die roll:', error);
    }
  };

  return (
    <>
      <div className="container">
        {error && <p>Error: {error.toString()}</p>}
        <Typography variant="h1" component="h1" gutterBottom>
          Chips
        </Typography>
        <Typography variant="h2" component="h2" gutterBottom>
          5000
        </Typography>
        <Typography variant="h4" component="h3" gutterBottom>
          Stake
        </Typography>
        <Grid container spacing={2}>
          {[100, 200, 300].map((v) => (
            <StakeOption
              key={v}
              selectedStake={selectedStake1}
              value={v}
              label={v}
              onClick={handleStakeClick1}
            />
          ))}
        </Grid>
      </div>
      <Typography variant="h4" component="h3" gutterBottom style={{marginTop: '20px'}}>
        On
      </Typography>
      <Grid container spacing={2}>
        {["7 up", "7", "7 down"].map((v) => (
          <StakeOption
            key={v}
            selectedStake={selectedStake2}
            value={v}
            label={v}
            onClick={handleStakeClick2}
          />
        ))}
      </Grid>
      {diceRoll.length > 0 && (
        <Typography variant="body1">Dice rolled: {diceRoll.join(', ')}</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={handleBetClick}
        sx={{
          height: '50px', // Adjust the height to match the stake box height
          marginTop: '20px',
        }}
      >
        Bet
      </Button>
    </>
  )
}

export default App;
// StakeOption.js
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Grid} from "@mui/material";

// @ts-ignore
const StakeOption = ({selectedStake, value, label, onClick}) => {
  return (
    <Grid item xs={4}>
      <Box
        onClick={() => onClick(value)}
        sx={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          backgroundColor: selectedStake === value ? '#3f51b5' : 'white',
          color: selectedStake === value ? 'white' : '#3f51b5',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5">{label}</Typography>
      </Box>
    </Grid>
  );
};

export default StakeOption;

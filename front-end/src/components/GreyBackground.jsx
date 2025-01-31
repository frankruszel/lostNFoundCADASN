import React from 'react';
import { Box } from '@mui/material';
function GreyBackground() {
  return (
    <Box pt={0} mt={0} sx={{ backgroundColor: "#f0f0f0", height: "100%", position: "absolute", zIndex: -1 , left: 0, right: 0, top: 0 }}></Box>
  );
}
export default GreyBackground;
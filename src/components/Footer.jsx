import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';


function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function Footer() {
  return (
 
    
     <Box
        sx={{
          marginTop: 8
         
        }}
      
      >
          <Container  maxWidth="sm">
            <Box textAlign="center">
               <Copyright />
            </Box>
        
          </Container>
        
     </Box>
   
  );
}

export default Footer;

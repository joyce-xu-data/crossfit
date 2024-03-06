import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { UserProvider } from './UserContext';
import SignUp from './SignUp';
import Login from './Login';
import Logs from './Logs';
import Milestone from './Milestone';
import Progress from './Progress';
import { orange } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: orange[300],
    },
    secondary: {
      main: orange[600],
    },
  },
});

function App() {
  return (
       <ThemeProvider theme={defaultTheme}>
   <Router>
     <UserProvider>
    <div className="App">
      <header className="App-header">
        <Header/>
      </header>
 
      <main>
         {/* Define the root route "/" */}
            <Routes>
              {/* <Route path="/" element={<Home/>} > </Route> */}
              <Route path ="/SignUp" element ={<SignUp/>}> </Route>
              <Route path ="/" element ={<Login/>}> </Route>
              <Route path ="/Logs" element ={<Logs/>}> </Route>
              <Route path ="/Milestone" element ={<Milestone/>}> </Route>
              <Route path ="/Progress" element ={<Progress/>}> </Route>

            
           
            </Routes>
      </main>
        
      <footer><Footer/>
      </footer>

    </div>
    </UserProvider>
   </Router>
   </ThemeProvider>
  );
}

export default App;


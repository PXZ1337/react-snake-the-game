import React from 'react';
import './App.css'
import {GameBoard} from './GameBoard'

import './App.css';

function App() {
  return (
    <>
      <h1>Snake The Game</h1>
        <GameBoard height={500} width={500}/>
    </>
    );
}

export default App;

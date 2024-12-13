import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ROOMS, CHARACTERS, UPGRADE_CARDS, RESCUE_CARDS } from './config/gameConfig';
import GameBoard from './components/GameBoard';
import CharacterMat from './components/CharacterMat';
import DiceArea from './components/DiceArea';
import UpgradeStore from './components/UpgradeStore';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
`;

const CharacterMatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

function App() {
  const [gameState, setGameState] = useState({
    currentPlayer: "Lion Leader",
    players: Object.keys(CHARACTERS),
    playerPositions: Object.fromEntries(
      Object.keys(CHARACTERS).map(character => [character, 0])
    ),
    board: Object.fromEntries(
      Object.keys(ROOMS).map(roomId => [roomId, { fireTokens: roomId === '0' ? 0 : 1 }])
    ),
    store: UPGRADE_CARDS.slice(0, 3),
    rescueCards: RESCUE_CARDS.map(animal => ({ 
      animal, 
      rescued: false, 
      location: Math.floor(Math.random() * 10) + 1,
      faceUp: false
    })),
    playerTokens: Object.fromEntries(
      Object.keys(CHARACTERS).map(character => [
        character, 
        { water: 0, fire: 0 }  
      ])
    ),
    currentTurn: {
      phase: 'rolling',
      rollsRemaining: 3,
      diceResults: Array(4).fill(null),
      keptDice: Array(4).fill(null),
      movement: 0,
      water: 0,
      fire: 0
    }
  });

  const handleDiceRoll = () => {
    const symbols = ['🦶🏿', '💧', '🔥'];
    
    setGameState(prev => {
      const newDiceResults = prev.currentTurn.diceResults.map((die, index) => 
        prev.currentTurn.keptDice[index] !== null 
          ? prev.currentTurn.keptDice[index]
          : symbols[Math.floor(Math.random() * symbols.length)]
      );

      return {
        ...prev,
        currentTurn: {
          ...prev.currentTurn,
          diceResults: newDiceResults,
          rollsRemaining: prev.currentTurn.rollsRemaining - 1
        }
      };
    });
  };

  const handleDiceKeep = (index) => {
    setGameState(prev => {
      const updatedKeptDice = [...prev.currentTurn.keptDice];
      updatedKeptDice[index] = updatedKeptDice[index] === null 
        ? prev.currentTurn.diceResults[index] 
        : null;

      return {
        ...prev,
        currentTurn: {
          ...prev.currentTurn,
          keptDice: updatedKeptDice
        }
      };
    });
  };

  const handleConfirmDiceRoll = () => {
    const waterGained = gameState.currentTurn.keptDice.filter(die => die === '💧').length;
    const fireRolls = gameState.currentTurn.keptDice.filter(die => die === '🔥').length;
    
    setGameState(prev => {
      const updatedBoard = { ...prev.board };
      const currentPlayer = prev.currentPlayer;
      const updatedTokens = {
        ...prev.playerTokens,
        [currentPlayer]: {
          ...prev.playerTokens[currentPlayer],
          water: prev.playerTokens[currentPlayer].water + waterGained
        }
      };
      
      // Only add fire if we rolled fire dice
      if (fireRolls > 0 && fireRolls <= 10) {
        const targetRoom = fireRolls.toString();
        if (updatedBoard[targetRoom]) {
          updatedBoard[targetRoom] = {
            ...updatedBoard[targetRoom],  // Preserve existing room properties
            fireTokens: (updatedBoard[targetRoom].fireTokens || 0) + 1
          };
        }
      }
      
      return {
        ...prev,
        board: updatedBoard,
        playerTokens: updatedTokens,
        currentTurn: {
          ...prev.currentTurn,
          phase: 'actions',
          movement: prev.currentTurn.keptDice.filter(die => die === '🦶🏿').length,
          diceResults: Array(4).fill(null),  // Reset dice results
          keptDice: Array(4).fill(null)      // Reset kept dice
        }
      };
    });
  };

  const handleMove = (roomId) => {
    if (gameState.currentTurn.movement <= 0) return;
    
    const currentRoom = gameState.playerPositions[gameState.currentPlayer];
    if (!ROOMS[currentRoom].adjacentRooms.includes(parseInt(roomId))) return;

    setGameState(prev => ({
      ...prev,
      playerPositions: {
        ...prev.playerPositions,
        [prev.currentPlayer]: parseInt(roomId)
      },
      currentTurn: {
        ...prev.currentTurn,
        movement: prev.currentTurn.movement - 1
      }
    }));
  };

  const handlePutOutFire = (roomId) => {
    setGameState(prev => {
      const currentPlayer = prev.currentPlayer;
      const currentRoom = prev.board[roomId];
      
      // Update fire tokens in room and player's tokens
      const updatedBoard = {
        ...prev.board,
        [roomId]: {
          ...currentRoom,
          fireTokens: currentRoom.fireTokens - 1
        }
      };
      
      const updatedTokens = {
        ...prev.playerTokens,
        [currentPlayer]: {
          ...prev.playerTokens[currentPlayer],
          water: prev.playerTokens[currentPlayer].water - 1,
          fire: prev.playerTokens[currentPlayer].fire + 1
        }
      };
      
      return {
        ...prev,
        board: updatedBoard,
        playerTokens: updatedTokens
      };
    });
  };

  const handleEndTurn = () => {
    setGameState(prev => {
      const currentPlayerIndex = prev.players.indexOf(prev.currentPlayer);
      const nextPlayerIndex = (currentPlayerIndex + 1) % prev.players.length;
      
      return {
        ...prev,
        currentPlayer: prev.players[nextPlayerIndex],
        currentTurn: {
          phase: 'rolling',
          rollsRemaining: 3,
          diceResults: Array(4).fill(null),
          keptDice: Array(4).fill(null),
          movement: 0,
          water: 0,
          fire: 0
        }
      };
    });
  };

  return (
    <AppContainer>
      <Title>🚒 Animal City Firefighters 🐾</Title>
      
      <CharacterMatsContainer>
        {gameState.players.map(character => (
          <CharacterMat
            key={character}
            character={character}
            isCurrentPlayer={gameState.currentPlayer === character}
            tokens={gameState.playerTokens[character]}
            characterDetails={CHARACTERS[character]}
          />
        ))}
      </CharacterMatsContainer>

      <GameBoard
        rooms={ROOMS}
        gameState={gameState}
        onRoomClick={handleMove}
      />

      <DiceArea
        currentTurn={gameState.currentTurn}
        onRoll={handleDiceRoll}
        onKeep={handleDiceKeep}
        onConfirm={handleConfirmDiceRoll}
      />

      {gameState.currentTurn.phase === 'actions' && (
        <div>
          {gameState.board[gameState.playerPositions[gameState.currentPlayer]] && 
           gameState.board[gameState.playerPositions[gameState.currentPlayer]].fireTokens > 0 && (
            <button 
              onClick={() => handlePutOutFire(gameState.playerPositions[gameState.currentPlayer])}
              disabled={gameState.playerTokens[gameState.currentPlayer].water <= 0}
            >
              Put Out Fire (Water Left: {gameState.playerTokens[gameState.currentPlayer].water})
            </button>
          )}
          <button onClick={handleEndTurn}>End Turn</button>
        </div>
      )}

      <UpgradeStore
        cards={gameState.store}
        playerTokens={gameState.playerTokens[gameState.currentPlayer]}
        onBuyCard={(index) => {
          // TODO: Implement card buying logic
          console.log(`Buying card: ${gameState.store[index].name}`);
        }}
      />
    </AppContainer>
  );
}

export default App;

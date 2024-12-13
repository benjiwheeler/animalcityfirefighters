import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ROOMS, CHARACTERS, UPGRADE_CARDS, RESCUE_CARDS, CHARACTERS_ORDER } from './config/gameConfig';
import GameBoard from './components/GameBoard';
import CharacterMat from './components/CharacterMat';
import DiceArea from './components/DiceArea';
import UpgradeStore from './components/UpgradeStore';
import GameLog from './components/GameLog';

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
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
`;

function App() {
  const [gameState, setGameState] = useState(() => {
    const initialBoard = Object.entries(ROOMS).reduce((board, [roomId, room]) => {
      if (room.fireSpaces > 0 && roomId !== '0') {  // Skip outside (room 0)
        board[roomId] = {
          numFireTokens: 1
        };
      }
      return board;
    }, {});

    const initialState = {
      currentPlayer: Object.keys(CHARACTERS)[0],
      players: Object.keys(CHARACTERS),
      playerPositions: Object.fromEntries(
        Object.keys(CHARACTERS).map(character => [character, 0])
      ),
      board: initialBoard,
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
          { numWaterTokens: 0, fire: 0 }  
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
      },
      log: [
        { type: 'game', text: '🎮 Animal City Firefighters begins!' },
        { type: 'turn', text: "It's Lion's turn" }
      ]
    };

    return initialState;
  });

  const [logMessages, setLogMessages] = useState([{
    message: 'Game started! Each room begins with 1 fire token.',
    type: 'phase',
    timestamp: Date.now()
  }]);

  const addLogMessage = (message, type) => {
    setLogMessages(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  const handleRoll = () => {
    setGameState(prev => {
      const newDice = prev.currentTurn.diceResults.map((die, index) => 
        prev.currentTurn.keptDice[index] !== null ? die : 
        ['🦶🏿', '🦶🏿', '💧', '💧', '🔥', '🔥'][Math.floor(Math.random() * 6)]
      );

      const newDiceString = newDice
        .map((die, i) => prev.currentTurn.keptDice[i] === null ? die : '(kept)')
        .join(' ');
      
      addLogMessage(`${prev.currentPlayer} rolled: ${newDiceString}`, 'roll');
      
      return {
        ...prev,
        currentTurn: {
          ...prev.currentTurn,
          diceResults: newDice,
          rollsRemaining: prev.currentTurn.rollsRemaining - 1
        }
      };
    });
  };

  const handleKeepDie = (index) => {
    setGameState(prev => {
      const newKeptDice = [...prev.currentTurn.keptDice];
      newKeptDice[index] = newKeptDice[index] === null ? 
        prev.currentTurn.diceResults[index] : null;
      
      return {
        ...prev,
        currentTurn: {
          ...prev.currentTurn,
          keptDice: newKeptDice
        }
      };
    });
  };

  const handleConfirmRoll = () => {
    setGameState(prev => {
      // First, calculate new fire tokens
      const newBoard = { ...prev.board };
      const numFireRolled = prev.currentTurn.diceResults.filter(die => die === '🔥').length;
      const numWaterRolled = prev.currentTurn.diceResults.filter(die => die === '💧').length;
      const movements = prev.currentTurn.diceResults.filter(die => die === '🦶🏿').length;

      if (numFireRolled > 0) {
        addLogMessage(
          `At least one fire was rolled... prepare for flames!!`,
          'fire'
        );
        // Room number matches number of fire symbols rolled
        if (numFireRolled in ROOMS) {
          const currentNumFireTokens = (newBoard[numFireRolled]?.numFireTokens || 0);
          const newNumFireTokens = currentNumFireTokens === 0 ? 1 : 
                            currentNumFireTokens >= 1 ? currentNumFireTokens * 2 : 
                            currentNumFireTokens;
          
          const finalNumFireTokens = Math.min(newNumFireTokens, ROOMS[numFireRolled].fireSpaces);

          newBoard[numFireRolled] = {
            ...newBoard[numFireRolled],
            numFireTokens: finalNumFireTokens
          };

          if (currentNumFireTokens === 0) {
            addLogMessage(
              `Fire breaks out in ${ROOMS[numFireRolled].name}!`,
              'fire'
            );
          } else {
            addLogMessage(
              `Fire spreads in ${ROOMS[numFireRolled].name}! (${currentNumFireTokens} → ${finalNumFireTokens} flames)`,
              'fire'
            );
          }

          if (finalNumFireTokens === ROOMS[numFireRolled].fireSpaces) {
            addLogMessage(
              `Warning: ${ROOMS[numFireRolled].name} has reached maximum fire capacity!`,
              'warning'
            );
          }
        }
      }

      if (numWaterRolled > 0) {
        addLogMessage(
          `${prev.currentPlayer} collected ${numWaterRolled} water token${numWaterRolled > 1 ? 's' : ''}`,
          'action'
        );
      }

      if (movements > 0) {
        addLogMessage(
          `${prev.currentPlayer} can move ${movements} space${movements > 1 ? 's' : ''}`,
          'action'
        );
      }

      addLogMessage(
        `${prev.currentPlayer}'s rolling phase ends - entering actions phase`,
        'phase'
      );

      const currentNumWaterTokens = prev.playerTokens[prev.currentPlayer].numWaterTokens || 0;
      const newNumWaterTokens = Math.min(
        currentNumWaterTokens + numWaterRolled,
        CHARACTERS[prev.currentPlayer].maxWaterTokens
      );

      return {
        ...prev,
        board: newBoard,
        playerTokens: {
          ...prev.playerTokens,
          [prev.currentPlayer]: {
            ...prev.playerTokens[prev.currentPlayer],
            numWaterTokens: newNumWaterTokens
          }
        },
        currentTurn: {
          ...prev.currentTurn,
          phase: 'actions',
          movement: movements,
          numWaterRolled,
          numFireRolled,
          diceResults: [],
          keptDice: Array(4).fill(null)
        }
      };
    });
  };

  const handleRoomClick = (roomId) => {
    if (gameState.currentTurn.phase === 'actions' && gameState.currentTurn.movement > 0) {
      const currentRoomId = gameState.playerPositions[gameState.currentPlayer];
      const currentRoom = ROOMS[currentRoomId];
      const targetRoom = ROOMS[roomId];
      console.log("gameState: ", gameState);
      console.log("currentRoom: ", currentRoom, "; currentRoomId: ", currentRoomId, "; roomId: ", roomId);

      // Check if the target room is adjacent to the current room
      if (currentRoom.adjacentRooms.includes(Number(roomId))) {
        setGameState(prev => {
          const newMovement = prev.currentTurn.movement - 1;
          
          addLogMessage(
            `${prev.currentPlayer} moves from ${ROOMS[currentRoomId].name} to ${targetRoom.name}`,
            'move'
          );

          return {
            ...prev,
            playerPositions: {
              ...prev.playerPositions,
              [prev.currentPlayer]: Number(roomId)
            },
            currentTurn: {
              ...prev.currentTurn,
              movement: newMovement
            }
          };
        });
      }
    }
  };

  const handlePutOutFire = (roomId) => {
    if (gameState.playerTokens[gameState.currentPlayer].numWaterTokens > 0) {
      setGameState(prev => {
        const room = ROOMS[roomId];
        const currentFires = prev.board[roomId]?.numFireTokens || 0;
        const waterUsed = Math.min(prev.playerTokens[gameState.currentPlayer].numWaterTokens, currentFires);
        const remainingFires = Math.max(0, currentFires - waterUsed);
        
        addLogMessage(
          `${prev.currentPlayer} put out ${waterUsed} ${waterUsed === 1 ? 'fire' : 'fires'} in ${room.name}`,
          'action'
        );
        
        return {
          ...prev,
          board: {
            ...prev.board,
            [roomId]: {
              ...prev.board[roomId],
              numFireTokens: remainingFires
            }
          },
          playerTokens: {
            ...prev.playerTokens,
            [prev.currentPlayer]: {
              ...prev.playerTokens[prev.currentPlayer],
              numWaterTokens: prev.playerTokens[prev.currentPlayer].numWaterTokens - waterUsed
            }
          }
        };
      });
    }
  };

  const handleEndTurn = () => {
    setGameState(prev => {
      const currentPlayerIndex = prev.players.indexOf(prev.currentPlayer);
      const nextPlayer = prev.players[(currentPlayerIndex + 1) % prev.players.length];
      
      addLogMessage(`${prev.currentPlayer}'s turn ends`, 'turn');
      addLogMessage(`It's ${nextPlayer}'s turn`, 'turn');
      
      return {
        ...prev,
        currentPlayer: nextPlayer,
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
            isCurrentPlayer={character === gameState.currentPlayer}
            gameState={gameState}
          />
        ))}
      </CharacterMatsContainer>

      <GameBoard
        rooms={ROOMS}
        gameState={gameState}
        onRoomClick={handleRoomClick}
        onPutOutFire={handlePutOutFire}
      />

      <DiceArea
        diceResults={gameState.currentTurn.diceResults}
        keptDice={gameState.currentTurn.keptDice}
        rollsRemaining={gameState.currentTurn.rollsRemaining}
        onRoll={handleRoll}
        onKeep={handleKeepDie}
        onConfirm={handleConfirmRoll}
      />

      {gameState.currentTurn.phase === 'actions' && (
        <div>
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

      <GameLog messages={logMessages} />
    </AppContainer>
  );
}

export default App;

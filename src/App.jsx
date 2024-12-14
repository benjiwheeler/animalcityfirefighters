import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ROOMS, CHARACTERS, UPGRADE_CARDS, RESCUE_CARDS, CHARACTERS_ORDER } from './config/gameConfig';
import GameBoard from './components/GameBoard';
import CharacterMat from './components/CharacterMat';
import DiceArea from './components/DiceArea';
import ActionArea from './components/ActionArea';
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

const DiceAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #2ecc71;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #27ae60;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
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
        Object.keys(CHARACTERS).map(character => [character, 0]),
      ),
      board: initialBoard,
      store: UPGRADE_CARDS.slice(0, 3),
      rescueCards: RESCUE_CARDS.map(animal => ({ 
        animal, 
        rescued: false, 
        location: Math.floor(Math.random() * 10) + 1,
        faceUp: false,
      })),
      playerTokens: Object.fromEntries(
        Object.keys(CHARACTERS).map(character => [
          character, 
          { 
            numWaterTokens: 0, 
            numFireTokens: 0,
          },
        ]),
      ),
      currentTurn: {
        phase: 'rolling',
        rollsRemaining: 3,
        diceResults: Array(4).fill(null),
        keptDice: Array(4).fill(null),
        numMovementsRemaining: 0,
        numWaterTokensCollected: 0,
        numFireTokensCollected: 0,
      },
      log: [
        { type: 'game', text: '🎮 Animal City Firefighters begins!', },
        { type: 'turn', text: "It's Lion's turn", },
      ],
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

  // Define dice faces
  const FRIENDLY_DIE = ['👣', '👣', '👣👣', '💧', '💧', '💧💧'];
  const DANGEROUS_DIE = ['🔥', '🔥🔥', '🔥🔥', '🔥🔥🔥', '👣', '💧'];

  const handleRoll = () => {
    setGameState(prev => {
      const newDice = prev.currentTurn.diceResults.map((die, index) => {
        if (prev.currentTurn.keptDice[index] !== null) return die;
        // First die is friendly, rest are dangerous
        const diceArray = index === 0 ? FRIENDLY_DIE : DANGEROUS_DIE;
        return diceArray[Math.floor(Math.random() * 6)];
      });

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

      // Count total flames, water drops, and movements
      const numTotalFlamesRolled = prev.currentTurn.diceResults.reduce((sum, die) => {
        if (die === '🔥') return sum + 1;
        if (die === '🔥🔥') return sum + 2;
        if (die === '🔥🔥🔥') return sum + 3;
        return sum;
      }, 0);

      const numWaterTokensCollected = prev.currentTurn.diceResults.reduce((sum, die) => {
        if (die === '💧') return sum + 1;
        if (die === '💧💧') return sum + 2;
        return sum;
      }, 0);

      const numMovementsRemaining = prev.currentTurn.diceResults.reduce((sum, die) => {
        if (die === '👣') return sum + 1;
        if (die === '👣👣') return sum + 2;
        return sum;
      }, 0);

      if (numTotalFlamesRolled > 0) {
        addLogMessage(
          `${numTotalFlamesRolled} flames were rolled... prepare for fire!!`,
          'fire'
        );
        // Room number matches total number of fire symbols rolled
        if (numTotalFlamesRolled in ROOMS) {
          const numFiresInCurRoom = (newBoard[numTotalFlamesRolled]?.numFireTokens || 0);
          const numNewFireTokens = numFiresInCurRoom === 0 ? 1 : 
                            numFiresInCurRoom >= 1 ? numFiresInCurRoom * 2 : 
                            numFiresInCurRoom;
          
          const numFinalFireTokens = Math.min(numNewFireTokens, ROOMS[numTotalFlamesRolled].fireSpaces);

          newBoard[numTotalFlamesRolled] = {
            ...newBoard[numTotalFlamesRolled],
            numFireTokens: numFinalFireTokens
          };

          if (numFiresInCurRoom === 0) {
            addLogMessage(
              `Fire breaks out in ${ROOMS[numTotalFlamesRolled].name}!`,
              'fire'
            );
          } else {
            addLogMessage(
              `Fire spreads in ${ROOMS[numTotalFlamesRolled].name}! (${numFiresInCurRoom} → ${numFinalFireTokens} flames)`,
              'fire'
            );
          }

          if (numFinalFireTokens === ROOMS[numTotalFlamesRolled].fireSpaces) {
            addLogMessage(
              `Warning: ${ROOMS[numTotalFlamesRolled].name} has reached maximum fire capacity!`,
              'warning'
            );
          }
        }
      }

      if (numWaterTokensCollected > 0) {
        addLogMessage(
          `${prev.currentPlayer} collected ${numWaterTokensCollected} water token${numWaterTokensCollected > 1 ? 's' : ''}`,
          'action'
        );
      }

      if (numMovementsRemaining > 0) {
        addLogMessage(
          `${prev.currentPlayer} can move ${numMovementsRemaining} space${numMovementsRemaining > 1 ? 's' : ''}`,
          'action'
        );
      }

      addLogMessage(
        `${prev.currentPlayer}'s rolling phase ends - entering actions phase`,
        'phase'
      );

      const numCurrentWaterTokens = prev.playerTokens[prev.currentPlayer].numWaterTokens || 0;
      const numFinalWaterTokens = Math.min(
        numCurrentWaterTokens + numWaterTokensCollected,
        CHARACTERS[prev.currentPlayer].maxWaterTokens
      );

      return {
        ...prev,
        board: newBoard,
        playerTokens: {
          ...prev.playerTokens,
          [prev.currentPlayer]: {
            ...prev.playerTokens[prev.currentPlayer],
            numWaterTokens: numFinalWaterTokens
          }
        },
        currentTurn: {
          ...prev.currentTurn,
          phase: 'actions',
          numMovementsRemaining,
          numWaterTokensCollected,
          numFireTokensCollected: numTotalFlamesRolled,
          diceResults: [],
          keptDice: Array(4).fill(null)
        }
      };
    });
  };

  const handleRoomClick = (roomId) => {
    if (gameState.currentTurn.phase === 'actions' && gameState.currentTurn.numMovementsRemaining > 0) {
      const currentRoomId = gameState.playerPositions[gameState.currentPlayer];
      const currentRoom = ROOMS[currentRoomId];
      const targetRoom = ROOMS[roomId];
      console.log("gameState: ", gameState);
      console.log("currentRoom: ", currentRoom, "; currentRoomId: ", currentRoomId, "; roomId: ", roomId);

      // Check if the target room is adjacent to the current room
      if (currentRoom.adjacentRooms.includes(Number(roomId))) {
        setGameState(prev => {
          const newNumMovementsRemaining = prev.currentTurn.numMovementsRemaining - 1;
          
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
              numMovementsRemaining: newNumMovementsRemaining
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
        const numFiresInCurRoom = prev.board[roomId]?.numFireTokens || 0;
        const numWaterTokensUsed = Math.min(prev.playerTokens[gameState.currentPlayer].numWaterTokens, numFiresInCurRoom);
        const numFiresRemainingInCurRoom = Math.max(0, numFiresInCurRoom - numWaterTokensUsed);
        
        addLogMessage(
          `${prev.currentPlayer} put out ${numWaterTokensUsed} ${numWaterTokensUsed === 1 ? 'fire' : 'fires'} in ${room.name}`,
          'action'
        );
        
        return {
          ...prev,
          board: {
            ...prev.board,
            [roomId]: {
              ...prev.board[roomId],
              numFireTokens: numFiresRemainingInCurRoom
            }
          },
          playerTokens: {
            ...prev.playerTokens,
            [prev.currentPlayer]: {
              ...prev.playerTokens[prev.currentPlayer],
              numWaterTokens: prev.playerTokens[prev.currentPlayer].numWaterTokens - numWaterTokensUsed,
              numFireTokens: Math.min(
                prev.playerTokens[prev.currentPlayer].numFireTokens + numWaterTokensUsed,
                CHARACTERS[prev.currentPlayer].maxFireTokens
              )
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
          numMovementsRemaining: 0,
          numWaterTokensCollected: 0,
          numFireTokensCollected: 0
        }
      };
    });
  };

  return (
    <AppContainer>
      <Title>🚒 Animal City Firefighters 🐾</Title>
      
      <ActionArea
        diceResults={gameState.currentTurn.diceResults}
        keptDice={gameState.currentTurn.keptDice}
        rollsRemaining={gameState.currentTurn.rollsRemaining}
        onRoll={handleRoll}
        onKeep={handleKeepDie}
        onConfirm={handleConfirmRoll}
        gameState={gameState}
        onRoomClick={handleRoomClick}
        onPutOutFire={handlePutOutFire}
        rooms={ROOMS}
        onEndTurn={handleEndTurn}
      />

      <CharacterMatsContainer>
        {Object.keys(CHARACTERS).map(character => (
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

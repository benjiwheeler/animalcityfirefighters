import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ROOMS, CHARACTERS, UPGRADE_CARDS, RESCUE_CARDS, CHARACTERS_ORDER } from './config/gameConfig';
import GameBoard from './components/GameBoard';
import CharacterMat from './components/CharacterMat';
import DiceArea from './components/DiceArea';
import ActionArea from './components/ActionArea';
import UpgradeStore from './components/UpgradeStore';
import GameLog from './components/GameLog';
import AnimatedFlame from './components/AnimatedFlame';

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

  const [flameAnimation, setFlameAnimation] = useState(null);

  const diceAreaRef = useRef(null);

  const addLogMessage = (message, type) => {
    setLogMessages(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  // Dice configuration
  const FRIENDLY_DIE = ['🦶🏿', '🦶🏿', '🦶🏿🦶🏿', '💧', '💧', '💧💧'];
  const DANGEROUS_DIE = ['🔥', '🔥🔥', '🔥🔥', '🔥🔥🔥', '🦶🏿', '🦶🏿'];

  const countFireSpaces = (dice) => {
    const fireRoll = dice.reduce((total, die) => {
      if (die === '🔥') return total + 1;
      if (die === '🔥🔥') return total + 2;
      if (die === '🔥🔥🔥') return total + 3;
      return total;
    }, 0);
    return fireRoll > 0 ? fireRoll : null;
  };

  const countWaterTokens = (dice) => {
    return dice.reduce((total, die) => {
      if (die === '💧') return total + 1;
      if (die === '💧💧') return total + 2;
      return total;
    }, 0);
  };

  const countMovements = (dice) => {
    const moveRoll = dice.reduce((total, die) => {
      if (die === '🦶🏿') return total + 1;
      if (die === '🦶🏿🦶🏿') return total + 2;
      return total;
    }, 0);
    return moveRoll;
  };

  const handleRoll = () => {
    setGameState(prev => {
      const newDiceResults = prev.currentTurn.diceResults.map((die, index) => {
        if (prev.currentTurn.keptDice[index]) return prev.currentTurn.keptDice[index];
        // First die is friendly, rest are dangerous
        const diceArray = index === 0 ? FRIENDLY_DIE : DANGEROUS_DIE;
        return diceArray[Math.floor(Math.random() * 6)];
      });

      const newDiceString = newDiceResults
        .map((die, i) => prev.currentTurn.keptDice[i] ? '(kept)' : die)
        .join(' ');
      
      addLogMessage(`${prev.currentPlayer} rolled: ${newDiceString}`, 'roll');
      
      const newRollsRemaining = prev.currentTurn.rollsRemaining - 1;
      
      // Auto-confirm if this was the last roll
      if (newRollsRemaining === 0) {
        const allDice = newDiceResults.map((die, index) => 
          prev.currentTurn.keptDice[index] || die
        );
        
        const fireSpaces = countFireSpaces(allDice);
        const waterTokens = countWaterTokens(allDice);
        const movements = countMovements(allDice);

        if (fireSpaces !== null) {
          addLogMessage(
            `${fireSpaces} flames were rolled... prepare for fire!!`,
            'fire'
          );
        }

        if (waterTokens > 0) {
          addLogMessage(
            `${prev.currentPlayer} collected ${waterTokens} water token${waterTokens > 1 ? 's' : ''}`,
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
        
        // Auto-confirm after processing the roll
        setTimeout(() => {
          handleConfirmRoll();
        }, 500);

        return {
          ...prev,
          currentTurn: {
            ...prev.currentTurn,
            phase: 'actions',
            diceResults: allDice,
            keptDice: Array(4).fill(null),
            rollsRemaining: 0,
            numMovementsRemaining: movements,
            numWaterTokensCollected: waterTokens,
            numFireTokensCollected: fireSpaces || 0
          }
        };
      }
      
      return {
        ...prev,
        currentTurn: {
          ...prev.currentTurn,
          diceResults: newDiceResults,
          rollsRemaining: newRollsRemaining
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

  const spreadFlames = (board, startingRoom) => {
    let currentRoom = startingRoom;
    let remainingFlames;
    let newBoard = { ...board };
    const visitedRooms = new Set([currentRoom]);
    
    // Calculate initial flames to add
    const currentRoomFlames = newBoard[currentRoom]?.numFireTokens || 0;
    if (currentRoomFlames === 0) {
      remainingFlames = 1; // First flame in room
    } else {
      remainingFlames = currentRoomFlames; // Double the flames
    }
    
    while (remainingFlames > 0) {
      const currentRoomCapacity = ROOMS[currentRoom].fireSpaces;
      const currentRoomFlames = newBoard[currentRoom]?.numFireTokens || 0;
      const spaceAvailable = currentRoomCapacity - currentRoomFlames;
      
      if (spaceAvailable > 0) {
        // Add as many flames as possible to current room
        const flamesToAdd = Math.min(spaceAvailable, remainingFlames);
        newBoard[currentRoom] = {
          ...newBoard[currentRoom],
          numFireTokens: currentRoomFlames + flamesToAdd
        };
        remainingFlames -= flamesToAdd;
        
        addLogMessage(
          currentRoomFlames === 0
            ? `Fire breaks out in ${ROOMS[currentRoom].name}!`
            : `Fire spreads in ${ROOMS[currentRoom].name}! (${currentRoomFlames} → ${currentRoomFlames + flamesToAdd} flames)`,
          'fire'
        );

        if (currentRoomFlames + flamesToAdd === currentRoomCapacity) {
          addLogMessage(
            `Warning: ${ROOMS[currentRoom].name} has reached maximum fire capacity!`,
            'warning'
          );
        }
      }
      
      if (remainingFlames > 0) {
        // Move to next room for overflow
        const nextRoom = ROOMS[currentRoom].nextFireSpreadRoom;
        if (nextRoom === undefined || visitedRooms.has(nextRoom)) {
          // If there's no next room defined or we've been here before, the fire is out of control
          addLogMessage(
            "🚨 GAME OVER: The fire has spread out of control! The building is lost...",
            'warning'
          );
          remainingFlames = 0;  // Stop spreading fire
          break;
        }
        currentRoom = nextRoom;
        visitedRooms.add(currentRoom);
        addLogMessage(
          `Fire overflows to ${ROOMS[currentRoom].name}!`,
          'fire'
        );
      }
    }
    
    return newBoard;
  };

  const handleConfirmRoll = () => {
    console.log('handleConfirmRoll - Starting');
    setGameState(prev => {
      const allDice = prev.currentTurn.diceResults.map((die, index) => 
        prev.currentTurn.keptDice[index] || die
      );
      
      const fireSpaces = countFireSpaces(allDice);
      const waterTokens = countWaterTokens(allDice);
      const movements = countMovements(allDice);

      // Update player tokens
      const updatedPlayerTokens = {
        ...prev.playerTokens,
        [prev.currentPlayer]: {
          ...prev.playerTokens[prev.currentPlayer],
          numWaterTokens: prev.playerTokens[prev.currentPlayer].numWaterTokens + waterTokens
        }
      };

      // Spread fire if fire tokens were rolled
      let updatedBoard = prev.board;
      if (fireSpaces) {
        updatedBoard = spreadFlames(prev.board, fireSpaces);
      }

      const newState = {
        ...prev,
        board: updatedBoard,
        playerTokens: updatedPlayerTokens,
        currentTurn: {
          ...prev.currentTurn,
          phase: 'actions',
          diceResults: allDice,
          keptDice: Array(4).fill(null),
          rollsRemaining: 0,
          numMovementsRemaining: movements,
          numWaterTokensCollected: waterTokens,
          numFireTokensCollected: fireSpaces || 0
        }
      };

      console.log('handleConfirmRoll - New phase will be:', newState.currentTurn.phase);
      return newState;
    });
    console.log('handleConfirmRoll - After state update');
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
    if (gameState.playerTokens[gameState.currentPlayer].numWaterTokens > 0 && 
        gameState.board[roomId]?.numFireTokens > 0) {
      setGameState(prev => {
        const room = ROOMS[roomId];
        
        addLogMessage(
          `${prev.currentPlayer} put out 1 fire in ${room.name}`,
          'action'
        );
        
        return {
          ...prev,
          board: {
            ...prev.board,
            [roomId]: {
              ...prev.board[roomId],
              numFireTokens: prev.board[roomId].numFireTokens - 1
            }
          },
          playerTokens: {
            ...prev.playerTokens,
            [prev.currentPlayer]: {
              ...prev.playerTokens[prev.currentPlayer],
              numWaterTokens: prev.playerTokens[prev.currentPlayer].numWaterTokens - 1,
              numFireTokens: Math.min(
                prev.playerTokens[prev.currentPlayer].numFireTokens + 1,
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
      
      <div ref={diceAreaRef}>
        <DiceArea
          diceResults={gameState.currentTurn.diceResults}
          keptDice={gameState.currentTurn.keptDice}
          rollsRemaining={gameState.currentTurn.rollsRemaining}
          onRoll={handleRoll}
          onKeep={handleKeepDie}
          onConfirm={handleConfirmRoll}
          gameState={gameState}
        />
      </div>

      {flameAnimation && (
        <AnimatedFlame
          startPosition={flameAnimation.startPosition}
          endPosition={flameAnimation.endPosition}
          onAnimationEnd={() => setFlameAnimation(null)}
        />
      )}

      <ActionArea
        key={`action-area-${gameState.currentTurn.phase || 'none'}`}
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

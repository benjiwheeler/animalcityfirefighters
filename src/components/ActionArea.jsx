import React from 'react';
import styled from 'styled-components';
import DiceArea from './DiceArea';

const ActionAreaContainer = styled.div`
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

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.variant === 'fire' ? '#f44336' : '#4caf50'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  transition: background-color 0.2s;
  opacity: ${props => props.$disabled ? 0.6 : 1};

  &:hover {
    background-color: ${props => props.$disabled ? 
      (props.variant === 'fire' ? '#f44336' : '#4caf50') : 
      (props.variant === 'fire' ? '#d32f2f' : '#45a049')};
  }
`;

const EndTurnButton = styled(ActionButton)`
  background-color: #2196f3;
  margin-top: 10px;

  &:hover {
    background-color: #1976d2;
  }
`;

const ActionArea = ({ 
  diceResults, 
  keptDice, 
  rollsRemaining, 
  onRoll, 
  onKeep, 
  onConfirm,
  gameState,
  onRoomClick,
  onPutOutFire,
  rooms,
  onEndTurn,
}) => {
  const getAdjacentRooms = (currentRoomId) => {
    const currentRoom = rooms[currentRoomId];
    const adjacentRooms = [];
    
    Object.entries(rooms).forEach(([id, room]) => {
      if (currentRoom.adjacentRooms.includes(parseInt(id)) || 
          room.adjacentRooms.includes(parseInt(currentRoomId))) {
        adjacentRooms.push({
          id: parseInt(id),
          name: room.name,
        });
      }
    });
    
    return adjacentRooms;
  };

  const getCurrentRoom = () => {
    if (!gameState?.playerPositions || !gameState?.currentPlayer) return null;
    return gameState.playerPositions[gameState.currentPlayer];
  };

  const canPutOutFire = (roomId) => {
    if (!gameState?.currentTurn?.phase || !gameState?.playerTokens || !gameState?.board) return false;
    return gameState.currentTurn.phase === 'actions' &&
           gameState.playerTokens[gameState.currentPlayer]?.numWaterTokens > 0 &&
           gameState.board[roomId]?.numFireTokens > 0;
  };

  const isValidMove = (roomId) => {
    if (!gameState?.currentTurn?.phase || !gameState?.currentTurn?.numMovementsRemaining) return false;
    if (gameState.currentTurn.phase !== 'actions' || 
        gameState.currentTurn.numMovementsRemaining <= 0) {
      return false;
    }
    
    const currentRoom = getCurrentRoom();
    if (!currentRoom) return false;
    
    return rooms[currentRoom].adjacentRooms.includes(parseInt(roomId)) || 
           rooms[roomId].adjacentRooms.includes(parseInt(currentRoom));
  };

  return (
    <ActionAreaContainer>
      <DiceArea
        diceResults={diceResults}
        keptDice={keptDice}
        rollsRemaining={rollsRemaining}
        onRoll={onRoll}
        onKeep={onKeep}
        onConfirm={onConfirm}
      />
      
      {gameState?.currentTurn?.phase === 'actions' && (
        <>
          {gameState.currentTurn.numMovementsRemaining > 0 && (
            <ActionButtonGroup>
              {getAdjacentRooms(getCurrentRoom())?.map(room => (
                <ActionButton
                  key={room.id}
                  onClick={() => onRoomClick(room.id)}
                  $disabled={!isValidMove(room.id)}
                >
                  Move to {room.name}
                </ActionButton>
              ))}
            </ActionButtonGroup>
          )}
          
          {canPutOutFire(getCurrentRoom()) && (
            <ActionButtonGroup>
              <ActionButton
                variant="fire"
                onClick={() => onPutOutFire(getCurrentRoom())}
              >
                Put Out Fire
              </ActionButton>
            </ActionButtonGroup>
          )}

          <EndTurnButton onClick={onEndTurn}>
            End Turn
          </EndTurnButton>
        </>
      )}
    </ActionAreaContainer>
  );
};

export default ActionArea;

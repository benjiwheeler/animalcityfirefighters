import React from 'react';
import styled from 'styled-components';

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
  cursor: ${props => props.$isEnabled ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.$isEnabled ? 1 : 0.5};
  pointer-events: ${props => props.$isEnabled ? 'auto' : 'none'};
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$isEnabled ? 
      (props.variant === 'fire' ? '#d32f2f' : '#45a049') : 
      (props.variant === 'fire' ? '#f44336' : '#4caf50')};
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
    const currentPlayerRoom = gameState.playerPositions[gameState.currentPlayer];
    if (currentPlayerRoom === undefined || currentPlayerRoom === null) return false;
    
    return gameState.currentTurn.phase === 'actions' &&
           gameState.playerTokens[gameState.currentPlayer]?.numWaterTokens > 0 &&
           gameState.board[roomId]?.numFireTokens > 0;
  };

  const isValidMove = (roomId) => {
    if (!gameState?.currentTurn?.phase) return false;
    if (gameState.currentTurn.phase !== 'actions' || 
        !gameState.currentTurn.numMovementsRemaining || 
        gameState.currentTurn.numMovementsRemaining <= 0) {
      return false;
    }
    
    const currentRoom = gameState.playerPositions[gameState.currentPlayer];
    if (currentRoom === undefined || currentRoom === null) return false;
    
    const currentRoomObj = rooms[currentRoom];
    return currentRoomObj.adjacentRooms.includes(parseInt(roomId));
  };

  return (
    <ActionAreaContainer>
      {gameState?.currentTurn?.phase === 'actions' && (
        <>
          {gameState.currentTurn.numMovementsRemaining > 0 && (
            <ActionButtonGroup>
              <div style={{ 
                display: 'flex',
                alignItems: 'center'
              }}>
                Move to:
              </div>
              {getAdjacentRooms(getCurrentRoom())?.map(room => (
                <ActionButton
                  key={room.id}
                  onClick={() => onRoomClick(room.id)}
                  $isEnabled={isValidMove(room.id)}
                >
                  {room.name}
                </ActionButton>
              ))}
              <div style={{ 
                display: 'flex',
                alignItems: 'center'
              }}>
                ({gameState.currentTurn.numMovementsRemaining} moves remaining)
              </div>
            </ActionButtonGroup>
          )}
          
          {canPutOutFire(getCurrentRoom()) && (
            <ActionButtonGroup>
              <ActionButton
                variant="fire"
                onClick={() => onPutOutFire(getCurrentRoom())}
                $isEnabled={true}
              >
                Put Out Fire ( {gameState.playerTokens[gameState.currentPlayer].numWaterTokens})
              </ActionButton>
            </ActionButtonGroup>
          )}

          <EndTurnButton 
            onClick={onEndTurn}
            $isEnabled={true}
          >
            End Turn
          </EndTurnButton>
        </>
      )}
    </ActionAreaContainer>
  );
};

export default ActionArea;

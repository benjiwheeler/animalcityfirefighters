import React from 'react';
import styled from 'styled-components';
import { CHARACTERS, WAYPOINTS } from '../config/gameConfig';

const BoardContainer = styled.div`
  position: relative;
  width: 1100px;
  height: 900px;
  margin: 0 auto 30px;
  background-color: #f5f6fa;
  border-radius: 10px;
  padding: 20px;
`;

const Room = styled.div`
  position: absolute;
  min-width: ${props => props.width}px;
  min-height: ${props => props.height}px;
  padding: 10px;
  background-color: ${props => props.$isOutside ? '#e8f5e9' : props.$isValidMove ? '#e8f5e9' : '#fff'};
  border: 2px solid ${props => props.$isValidMove ? '#4caf50' : '#95a5a6'};
  border-radius: 8px;
  cursor: ${props => props.$isValidMove ? 'pointer' : 'default'};
  transform: translate(${props => props.x}px, ${props => props.y}px);
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$isValidMove ? '#c8e6c9' : '#f8f9fa'};
  }
`;

const RoomTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #2c3e50;
`;

const FireSpaces = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
`;

const FireSpace = styled.div`
  opacity: ${props => props.$isFilled ? 1 : 0.3};
  transition: opacity 0.2s ease;
`;

const CharactersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

const CharacterToken = styled.div`
  display: inline-flex;
  align-items: center;
  margin: 2px;
  padding: 4px;
  font-size: 24px;
  filter: ${props => props.$isCurrentPlayer ? 'drop-shadow(0 0 4px #2ecc71)' : 'none'};
  transition: filter 0.3s ease;
  cursor: help;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ConnectionLines = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const ActionControls = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
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

const GameBoard = ({ rooms, gameState, onRoomClick, onPutOutFire }) => {
  const isValidMove = (roomId) => {
    if (gameState.currentTurn.phase !== 'actions' || gameState.currentTurn.movement <= 0) {
      return false;
    }
    
    const currentRoom = gameState.playerPositions[gameState.currentPlayer];
    return rooms[currentRoom].adjacentRooms.includes(parseInt(roomId)) || 
           rooms[roomId].adjacentRooms.includes(parseInt(currentRoom));
  };

  const getCharactersInRoom = (roomId) => {
    return (
      <CharactersContainer>
        {Object.entries(gameState.playerPositions)
          .filter(([_, position]) => position === parseInt(roomId))
          .map(([character]) => (
            <CharacterToken 
              key={character}
              $isCurrentPlayer={character === gameState.currentPlayer}
              title={`${character}${CHARACTERS[character].specialty ? ` • ${CHARACTERS[character].specialty}` : ''}`}
            >
              {CHARACTERS[character].emoji}
            </CharacterToken>
          ))}
      </CharactersContainer>
    );
  };

  const getAdjacentRooms = (currentRoomId) => {
    const currentRoom = rooms[currentRoomId];
    const adjacentRooms = [];
    
    // Check rooms that list this room as adjacent
    Object.entries(rooms).forEach(([id, room]) => {
      if (currentRoom.adjacentRooms.includes(parseInt(id)) || 
          room.adjacentRooms.includes(parseInt(currentRoomId))) {
        adjacentRooms.push({
          id: parseInt(id),
          name: room.name
        });
      }
    });
    
    return adjacentRooms;
  };

  const getCurrentRoom = () => gameState.playerPositions[gameState.currentPlayer];

  const canPutOutFire = (roomId) => {
    return gameState.currentTurn.phase === 'actions' &&
           gameState.playerTokens[gameState.currentPlayer].numWaterTokens > 0 &&
           gameState.board[roomId]?.numFireTokens > 0;
  };

  const handleMove = (roomId) => {
    if (isValidMove(roomId)) {
      onRoomClick(roomId);
    }
  };

  const renderConnection = (startRoom, endRoom) => {
    const waypoint = WAYPOINTS[`${startRoom.id}-${endRoom.id}`];
    
    if (waypoint) {
      // If there's a waypoint, render two lines
      return (
        <g key={`${startRoom.id}-${endRoom.id}`}>
          <line 
            x1={startRoom.position.x + (startRoom.width / 2)}
            y1={startRoom.position.y + (startRoom.height / 2)}
            x2={waypoint.x}
            y2={waypoint.y}
            stroke="#95a5a6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line 
            x1={waypoint.x}
            y1={waypoint.y}
            x2={endRoom.position.x + (endRoom.width / 2)}
            y2={endRoom.position.y + (endRoom.height / 2)}
            stroke="#95a5a6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <circle
            cx={waypoint.x}
            cy={waypoint.y}
            r={3}
            fill="#95a5a6"
          />
        </g>
      );
    }

    // If no waypoint, render direct line
    return (
      <line 
        key={`${startRoom.id}-${endRoom.id}`}
        x1={startRoom.position.x + (startRoom.width / 2)}
        y1={startRoom.position.y + (startRoom.height / 2)}
        x2={endRoom.position.x + (endRoom.width / 2)}
        y2={endRoom.position.y + (endRoom.height / 2)}
        stroke="#95a5a6"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    );
  };

  return (
    <BoardContainer>
      <ConnectionLines>
        {Object.entries(rooms).flatMap(([roomId, room]) => 
          room.adjacentRooms.map(adjRoomId => {
            if (parseInt(roomId) > adjRoomId) return null;
            return renderConnection(
              { id: parseInt(roomId), ...room },
              { id: adjRoomId, ...rooms[adjRoomId] }
            );
          }).filter(Boolean)
        )}
      </ConnectionLines>

      {Object.entries(rooms).map(([roomId, room]) => {
        const validMove = isValidMove(roomId);
        const isOutside = roomId === '0';
        const roomState = gameState.board[roomId] || { numFireTokens: 0 };
        
        return (
          <Room
            key={roomId}
            x={room.position.x}
            y={room.position.y}
            width={room.width}
            height={room.height}
            $isValidMove={validMove}
            $isOutside={isOutside}
            onClick={() => validMove && onRoomClick(roomId)}
          >
            <div>{room.name}</div>
            {!isOutside && (
              <FireSpaces>
                {Array.from({ length: room.fireSpaces }).map((_, index) => (
                  <FireSpace 
                    key={index}
                    $isFilled={index < roomState.numFireTokens}
                  >
                    🔥
                  </FireSpace>
                ))}
              </FireSpaces>
            )}
            {getCharactersInRoom(roomId)}
          </Room>
        );
      })}

      {gameState.currentTurn.phase === 'actions' && (
        <ActionControls>
          {gameState.currentTurn.movement > 0 && (
            <ActionButtonGroup>
              {getAdjacentRooms(getCurrentRoom()).map(room => (
                <ActionButton
                  key={room.id}
                  onClick={() => handleMove(room.id)}
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
                Put out fire in {rooms[getCurrentRoom()].name}
              </ActionButton>
            </ActionButtonGroup>
          )}
        </ActionControls>
      )}
    </BoardContainer>
  );
};

export default GameBoard;

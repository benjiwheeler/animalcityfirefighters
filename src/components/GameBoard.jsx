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
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$isValidMove ? '#c8e6c9' : '#f8f9fa'};
    transform: translate(${props => props.x}px, ${props => props.y}px) 
               ${props => props.$isValidMove ? 'scale(1.02)' : 'scale(1)'};
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

const ConnectionLine = styled.line`
  stroke: #95a5a6;
  stroke-width: 2;
  stroke-dasharray: 5,5;
`;

const MoveButton = styled.button`
  background-color: ${props => props.$isValidMove ? '#4caf50' : '#ccc'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 2px;
  cursor: ${props => props.$isValidMove ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.$isValidMove ? '1' : '0.5'};
  pointer-events: ${props => props.$isValidMove ? 'auto' : 'none'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$isValidMove ? '#45a049' : '#ccc'};
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.disabled ? '#ccc' : '#2196f3'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 2px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.5' : '1'};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.disabled ? '#ccc' : '#1976d2'};
  }
`;

const GameBoard = ({ rooms, gameState, onRoomClick, onPutOutFire }) => {
  const isValidMove = (roomId) => {
    // Basic state checks
    if (!gameState?.currentTurn?.phase || !gameState?.playerPositions) return false;
    
    // Must be in actions phase with movements remaining
    if (gameState.currentTurn.phase !== 'actions' || 
        gameState.currentTurn.numMovementsRemaining === undefined || 
        gameState.currentTurn.numMovementsRemaining <= 0) {
      return false;
    }
    
    // Get current room and check if target is adjacent
    const currentRoom = gameState.playerPositions[gameState.currentPlayer];
    if (currentRoom === undefined || currentRoom === null) return false;
    
    const currentRoomObj = rooms[currentRoom];
    return currentRoomObj.adjacentRooms.includes(parseInt(roomId));
  };

  const getCurrentRoom = () => gameState.playerPositions[gameState.currentPlayer];

  const canPutOutFire = (roomId) => {
    if (!gameState?.currentTurn?.phase || !gameState?.playerTokens || !gameState?.board) return false;
    const currentPlayerRoom = gameState.playerPositions[gameState.currentPlayer];
    if (currentPlayerRoom === undefined || currentPlayerRoom === null) return false;
    
    return gameState.currentTurn.phase === 'actions' &&
           gameState.playerTokens[gameState.currentPlayer]?.numWaterTokens > 0 &&
           gameState.board[roomId]?.numFireTokens > 0 &&
           currentPlayerRoom === parseInt(roomId);
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

  const renderConnection = (room1Id, room2Id) => {
    const room1 = rooms[room1Id];
    const room2 = rooms[room2Id];

    const waypointKey = `${Math.min(room1Id, room2Id)}-${Math.max(room1Id, room2Id)}`;
    const waypoints = WAYPOINTS[waypointKey];

    // If we have waypoints, draw path segments through them
    if (waypoints) {
      // Create array of points including start and end room centers
      const allPoints = [
        { x: room1.position.x + room1.width/2, y: room1.position.y + room1.height/2 },
        ...waypoints,
        { x: room2.position.x + room2.width/2, y: room2.position.y + room2.height/2 }
      ];

      return (
        <g key={`connection-${room1Id}-${room2Id}`}>
          {allPoints.map((point, index) => {
            if (index === 0) return null; // Skip first point as it's just the start
            const prevPoint = allPoints[index - 1];
            return (
              <ConnectionLine
                key={`segment-${index}`}
                x1={prevPoint.x}
                y1={prevPoint.y}
                x2={point.x}
                y2={point.y}
              />
            );
          })}
        </g>
      );
    }

    // If no waypoints, draw direct line
    return (
      <ConnectionLine
        key={`connection-${room1Id}-${room2Id}`}
        x1={room1.position.x + room1.width/2}
        y1={room1.position.y + room1.height/2}
        x2={room2.position.x + room2.width/2}
        y2={room2.position.y + room2.height/2}
      />
    );
  };

  const handleRoomClick = (roomId) => {
    if (isValidMove(roomId)) {
      onRoomClick(roomId);
    }
  };

  return (
    <BoardContainer className="board-container">
      <ConnectionLines>
        {Object.entries(rooms).flatMap(([roomId, room]) => 
          room.adjacentRooms.map(adjRoomId => {
            // Only render connection once per pair of rooms
            if (parseInt(roomId) > adjRoomId) return null;
            return renderConnection(roomId, adjRoomId);
          }).filter(Boolean)
        )}
      </ConnectionLines>

      {Object.entries(rooms).map(([id, room]) => {
        const validMove = isValidMove(id);
        const canExtinguish = canPutOutFire(id);
        const isOutside = id === '0';
        const roomState = gameState.board[id] || { numFireTokens: 0 };
        
        return (
          <Room
            key={id}
            id={`room-${id}`}
            x={room.position.x}
            y={room.position.y}
            width={room.width}
            height={room.height}
            $isValidMove={validMove}
            $isOutside={isOutside}
            onClick={() => handleRoomClick(id)}
          >
            <div>{room.name}</div>
            {!isOutside && (
              <FireSpaces>
                {Array(room.fireSpaces).fill(null).map((_, index) => (
                  <FireSpace
                    key={index}
                    $isFilled={index < (roomState.numFireTokens || 0)}
                  >
                    🔥
                  </FireSpace>
                ))}
              </FireSpaces>
            )}
            {getCharactersInRoom(id)}
            {validMove && (
              <MoveButton
                $isValidMove={true}
                onClick={() => handleRoomClick(id)}
              >
                Move Here
              </MoveButton>
            )}
            {canExtinguish && (
              <ActionButton
                onClick={() => onPutOutFire(id)}
              >
                Put Out Fire
              </ActionButton>
            )}
          </Room>
        );
      })}
    </BoardContainer>
  );
};

export default GameBoard;

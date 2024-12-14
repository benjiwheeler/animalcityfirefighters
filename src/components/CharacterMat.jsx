import React from 'react';
import styled from 'styled-components';
import { ROOMS, CHARACTERS } from '../config/gameConfig';

const MatContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin: 8px;
  width: 220px;
  box-shadow: ${props => props.$isCurrentPlayer ? '0 0 12px #2ecc71' : '0 2px 4px rgba(0,0,0,0.1)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CharacterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const CharacterEmoji = styled.div`
  font-size: 32px;
  filter: ${props => props.$isCurrentPlayer ? 'drop-shadow(0 0 4px #2ecc71)' : 'none'};
`;

const CharacterInfo = styled.div`
  flex: 1;
`;

const CharacterName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
`;

const Specialty = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  font-style: italic;
`;

const Location = styled.div`
  font-size: 14px;
  color: #34495e;
  margin-top: 4px;
`;

const TokenSection = styled.div`
  display: flex;
  gap: 16px;
  margin: 12px 0;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const TokenGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const TokenCount = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  span {
    font-size: 20px;
  }
`;

const Capacity = styled.div`
  font-size: 12px;
  color: #95a5a6;
`;

const AbilitySection = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: #34495e;
`;

const AbilityTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
  color: #2c3e50;
`;

const AbilityList = styled.ul`
  margin: 0;
  padding-left: 20px;
  li {
    margin: 2px 0;
  }
`;

const MovesRemaining = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${props => props.$hasMovesLeft ? '#e8f5e9' : '#f5f5f5'};
  border-radius: 6px;
  margin-top: 8px;
  font-size: 14px;
  color: ${props => props.$hasMovesLeft ? '#2e7d32' : '#9e9e9e'};
  transition: all 0.3s ease;

  span {
    font-size: 18px;
  }
`;

const CharacterMat = ({ character, isCurrentPlayer, gameState }) => {
  const characterDetails = CHARACTERS[character];
  const position = gameState.playerPositions[character];
  const tokens = gameState.playerTokens[character];
  const currentTurn = isCurrentPlayer ? gameState.currentTurn : null;

  return (
    <MatContainer $isCurrentPlayer={isCurrentPlayer}>
      <CharacterHeader>
        <CharacterEmoji $isCurrentPlayer={isCurrentPlayer}>
          {characterDetails.emoji}
        </CharacterEmoji>
        <CharacterInfo>
          <CharacterName>{character}</CharacterName>
          <Specialty>{characterDetails.specialty}</Specialty>
          <Location>In: {ROOMS[position].name}</Location>
        </CharacterInfo>
      </CharacterHeader>

      <TokenSection>
        <TokenGroup>
          <TokenCount>
            <span>💧</span> {tokens.numWaterTokens}
          </TokenCount>
          <Capacity>max {characterDetails.maxWaterTokens}</Capacity>
        </TokenGroup>
        <TokenGroup>
          <TokenCount>
            <span>🔥</span> {tokens.numFireTokens}
          </TokenCount>
          <Capacity>max {characterDetails.maxFireTokens}</Capacity>
        </TokenGroup>
      </TokenSection>

      <AbilitySection>
        <AbilityTitle>Special Abilities</AbilityTitle>
        <AbilityList>
          {Object.entries(characterDetails.abilities).map(([type, description]) => (
            <li key={type}>{description}</li>
          ))}
        </AbilityList>
      </AbilitySection>

      {isCurrentPlayer && currentTurn?.phase === 'actions' && (
        <MovesRemaining $hasMovesLeft={currentTurn.numMovementsRemaining > 0}>
          <span>🦶🏿</span> {currentTurn.numMovementsRemaining} moves remaining
        </MovesRemaining>
      )}
    </MatContainer>
  );
};

export default CharacterMat;

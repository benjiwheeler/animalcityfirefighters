import React from 'react';
import styled from 'styled-components';

const MatContainer = styled.div`
  border: 3px solid ${props => props.isCurrentPlayer ? '#f1c40f' : '#2c3e50'};
  border-radius: 10px;
  padding: 15px;
  width: 220px;
  background-color: white;
  opacity: ${props => props.isCurrentPlayer ? 1 : 0.8};
  transition: all 0.3s ease;
  box-shadow: ${props => props.isCurrentPlayer ? '0 0 15px rgba(241, 196, 15, 0.5)' : 'none'};
`;

const MatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const CharacterName = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
`;

const CharacterEmoji = styled.span`
  font-size: 24px;
`;

const AbilitiesSection = styled.div`
  margin-bottom: 15px;
`;

const AbilityText = styled.p`
  margin: 5px 0;
  font-size: 14px;
  color: #34495e;
`;

const TokenStorage = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const TokenSection = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TokenCount = styled.span`
  font-size: 14px;
  color: #2c3e50;
  font-weight: bold;
`;

const MaxCarry = styled.p`
  margin: 5px 0;
  font-size: 14px;
  color: #7f8c8d;
`;

const CharacterMat = ({ character, isCurrentPlayer, tokens, characterDetails }) => {
  return (
    <MatContainer isCurrentPlayer={isCurrentPlayer}>
      <MatHeader>
        <CharacterName>{character}</CharacterName>
        <CharacterEmoji>{characterDetails.emoji}</CharacterEmoji>
      </MatHeader>
      
      <AbilitiesSection>
        {Object.entries(characterDetails.abilities).map(([trigger, effect]) => (
          <AbilityText key={trigger}>
            {trigger === 'water' && '💧'}
            {trigger === 'fire' && '🔥'}
            {trigger === 'mixed' && '💧🔥'}: {effect}
          </AbilityText>
        ))}
      </AbilitiesSection>

      <MaxCarry>
        Max Carry: {characterDetails.maxCarry === Infinity ? '∞' : characterDetails.maxCarry} animal{characterDetails.maxCarry !== 1 && 's'}
      </MaxCarry>

      <TokenStorage>
        <TokenSection>
          <span>💧</span>
          <TokenCount>{tokens.water}/{characterDetails.waterCapacity}</TokenCount>
        </TokenSection>
        <TokenSection>
          <span>🔥</span>
          <TokenCount>{tokens.fire}/{characterDetails.fireCapacity}</TokenCount>
        </TokenSection>
      </TokenStorage>
    </MatContainer>
  );
};

export default CharacterMat;

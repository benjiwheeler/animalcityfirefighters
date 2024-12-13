import React from 'react';
import styled from 'styled-components';

const DiceContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const DiceRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
`;

const Die = styled.span`
  font-size: 32px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  background-color: ${props => props.$isKept ? '#e1f5fe' : 'transparent'};
  border: 2px solid ${props => props.$isKept ? '#03a9f4' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  background-color: ${props => props.$disabled ? '#bdc3c7' : '#3498db'};
  color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$disabled ? '#bdc3c7' : '#2980b9'};
  }

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const RollsRemaining = styled.p`
  text-align: center;
  color: #7f8c8d;
  margin: 10px 0;
`;

const DiceArea = ({ currentTurn, onRoll, onKeep, onConfirm }) => {
  const { phase, rollsRemaining, diceResults, keptDice } = currentTurn;

  if (phase !== 'rolling') return null;

  return (
    <DiceContainer>
      <RollsRemaining>
        Rolls Remaining: {rollsRemaining}
      </RollsRemaining>

      <DiceRow>
        {diceResults.map((die, index) => (
          <Die
            key={index}
            onClick={() => onKeep(index)}
            $isKept={keptDice[index] !== null}
          >
            {die}
          </Die>
        ))}
      </DiceRow>

      <div>
        <Button 
          onClick={onRoll}
          $disabled={rollsRemaining <= 0 || diceResults.length === 0}
        >
          Roll Dice
        </Button>
        <Button 
          onClick={onConfirm}
          $disabled={diceResults.length === 0}
        >
          Confirm Roll
        </Button>
      </div>
    </DiceContainer>
  );
};

export default DiceArea;

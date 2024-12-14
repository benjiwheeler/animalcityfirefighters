import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const DiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DiceRow = styled.div`
  display: flex;
  gap: 12px;
`;

const Die = styled.button`
  width: 60px;
  height: 60px;
  border: 2px solid ${props => props.$isKept ? '#2ecc71' : '#e0e0e0'};
  border-radius: 12px;
  background: white;
  font-size: ${props => props.children?.length > 1 ? '18px' : '24px'};
  line-height: 1;
  cursor: ${props => props.$isRolling ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$isRolling && !props.$isKept ? 0.7 : 1};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;

  &:hover {
    transform: ${props => !props.$isRolling && !props.$isKept ? 'translateY(-2px)' : 'none'};
    border-color: ${props => !props.$isRolling && !props.$isKept ? '#3498db' : props.$isKept ? '#2ecc71' : '#e0e0e0'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$primary ? '#2ecc71' : '#3498db'};
  color: white;
  font-weight: bold;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover {
    opacity: ${props => props.$disabled ? 0.5 : 0.9};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const DICE_FACES = ['', '', '', '', '', ''];
const INITIAL_SPEED = 50;
const SPEED_MULTIPLIER = 1.5;
const MAX_SPEED = 500;

const DiceArea = ({ diceResults = [], keptDice = [], rollsRemaining = 0, onRoll, onKeep, onConfirm }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [animatingDice, setAnimatingDice] = useState(Array(4).fill('?'));
  const [animationSpeed, setAnimationSpeed] = useState(INITIAL_SPEED);
  const timeoutRef = useRef(null);
  const frameRef = useRef(0);

  // Effect to handle the animation loop
  useEffect(() => {
    if (!isRolling) return;

    const updateDice = () => {
      setAnimatingDice(prev => 
        prev.map((_, index) => 
          keptDice[index] !== null ? diceResults[index] : 
          DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)]
        )
      );

      const nextSpeed = animationSpeed * SPEED_MULTIPLIER;
      if (nextSpeed > MAX_SPEED) {
        setIsRolling(false);
        setAnimationSpeed(INITIAL_SPEED);
        // Schedule onRoll callback after state updates are complete
        setTimeout(() => onRoll(), 0);
      } else {
        setAnimationSpeed(nextSpeed);
        timeoutRef.current = setTimeout(updateDice, nextSpeed);
      }
    };

    timeoutRef.current = setTimeout(updateDice, animationSpeed);
    frameRef.current++;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isRolling, animationSpeed, keptDice, diceResults, onRoll]);

  // Reset animation state when diceResults change
  useEffect(() => {
    if (!isRolling) {
      setAnimatingDice(diceResults.map(die => die || '?'));
      setAnimationSpeed(INITIAL_SPEED);
      frameRef.current = 0;
    }
  }, [diceResults, isRolling]);

  const handleRoll = () => {
    setIsRolling(true);
    setAnimationSpeed(INITIAL_SPEED);
  };

  const handleKeep = (index) => {
    if (!isRolling && diceResults[index]) {
      onKeep(index);
    }
  };

  return (
    <DiceContainer>
      <DiceRow>
        {Array(4).fill(null).map((_, index) => (
          <Die
            key={index}
            onClick={() => handleKeep(index)}
            $isKept={keptDice[index] !== null}
            $isRolling={isRolling}
            disabled={isRolling && keptDice[index] === null}
          >
            {keptDice[index] || animatingDice[index]}
          </Die>
        ))}
      </DiceRow>
      
      <ButtonRow>
        <ActionButton
          onClick={handleRoll}
          disabled={rollsRemaining === 0 || isRolling}
          $disabled={rollsRemaining === 0 || isRolling}
        >
          {isRolling ? 'Rolling...' : `Roll (${rollsRemaining} left)`}
        </ActionButton>
        
        <ActionButton
          onClick={onConfirm}
          disabled={isRolling || diceResults.every(die => !die)}
          $disabled={isRolling || diceResults.every(die => !die)}
          $primary
        >
          Confirm Roll
        </ActionButton>
      </ButtonRow>
    </DiceContainer>
  );
};

export default DiceArea;

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const LogContainer = styled.div`
  position: fixed;
  right: 20px;
  top: 20px;
  width: 300px;
  max-height: 500px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const LogHeader = styled.div`
  padding: 12px;
  background-color: #2c3e50;
  color: white;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
`;

const LogContent = styled.div`
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 400px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #bdc3c7;
    border-radius: 4px;
  }
`;

const LogEntry = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;

  ${props => {
    switch (props.$type) {
      case 'turn':
        return 'color: #2ecc71; font-weight: bold;';
      case 'move':
        return 'color: #3498db;';
      case 'action':
        return 'color: #9b59b6;';
      case 'fire':
        return 'color: #e74c3c;';
      case 'roll':
        return 'color: #f39c12;';
      case 'warning':
        return 'background-color: #fff3cd; color: #856404;';
      case 'phase':
        return 'color: #7f8c8d; font-style: italic;';
      default:
        return 'color: #2c3e50;';
    }
  }}
`;

const GameLog = ({ messages }) => {
  const logContentRef = useRef(null);

  useEffect(() => {
    if (logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <LogContainer>
      <LogHeader>🎲 Game Log</LogHeader>
      <LogContent ref={logContentRef}>
        {messages.map((message, index) => (
          <LogEntry key={`${index}-${message.timestamp}`} $type={message.type}>
            {message.message}
          </LogEntry>
        ))}
      </LogContent>
    </LogContainer>
  );
};

export default GameLog;

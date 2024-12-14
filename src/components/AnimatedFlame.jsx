import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const moveFlame = (startX, startY, endX, endY) => keyframes`
  0% {
    transform: translate(${startX}px, ${startY}px);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.6;
  }
  100% {
    transform: translate(${endX}px, ${endY}px);
    opacity: 0;
  }
`;

const FlameEmoji = styled.div`
  position: fixed;
  font-size: 24px;
  pointer-events: none;
  z-index: 1000;
  will-change: transform;
  animation: ${props => moveFlame(props.$startX, props.$startY, props.$endX, props.$endY)} 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

const AnimatedFlame = ({ startPosition, endPosition, onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 1000); // Match this with the animation duration

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <FlameEmoji
      $startX={startPosition.x}
      $startY={startPosition.y}
      $endX={endPosition.x}
      $endY={endPosition.y}
    >
      🔥
    </FlameEmoji>
  );
};

export default AnimatedFlame;

import React from 'react';
import styled from 'styled-components';

const StoreContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StoreTitle = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const Card = styled.div`
  width: 200px;
  padding: 15px;
  border: 2px solid #3498db;
  border-radius: 8px;
  background-color: white;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
`;

const CardEffect = styled.p`
  color: #7f8c8d;
  font-size: 14px;
  margin: 10px 0;
`;

const CostSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
`;

const TokenCost = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #2c3e50;
`;

const BuyButton = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 5px;
  background-color: ${props => props.$canAfford ? '#2ecc71' : '#bdc3c7'};
  color: white;
  cursor: ${props => props.$canAfford ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$canAfford ? '#27ae60' : '#bdc3c7'};
  }
`;

const UpgradeStore = ({ cards, playerTokens, onBuyCard }) => {
  const canAffordCard = (card) => {
    return (
      playerTokens.water >= (card.buyCost.water || 0) &&
      playerTokens.fire >= (card.buyCost.fire || 0)
    );
  };

  return (
    <StoreContainer>
      <StoreTitle>Upgrade Store</StoreTitle>
      <CardsContainer>
        {cards.map((card, index) => {
          const affordable = canAffordCard(card);
          
          return (
            <Card key={index}>
              <CardTitle>{card.name}</CardTitle>
              <CardEffect>{card.effect}</CardEffect>
              <CostSection>
                {card.buyCost.water > 0 && (
                  <TokenCost>
                    <span>💧</span>
                    {card.buyCost.water}
                  </TokenCost>
                )}
                {card.buyCost.fire > 0 && (
                  <TokenCost>
                    <span>🔥</span>
                    {card.buyCost.fire}
                  </TokenCost>
                )}
              </CostSection>
              <BuyButton
                onClick={() => onBuyCard(index)}
                $canAfford={affordable}
                disabled={!affordable}
              >
                Buy Card
              </BuyButton>
            </Card>
          );
        })}
      </CardsContainer>
    </StoreContainer>
  );
};

export default UpgradeStore;

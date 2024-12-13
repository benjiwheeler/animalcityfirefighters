// Room adjacencies follow a one-way definition rule:
// Each connection between rooms is only defined once, where the room with the lower ID
// lists its connection to the room with the higher ID. For example, if room 2 is connected
// to room 5, this connection will only appear in room 2's adjacentRooms list, not in room 5's.
// The GameBoard component checks both directions when determining if rooms are adjacent.

export const ROOMS = {
  0: { 
    name: "Outside", 
    fireSpaces: 0,
    adjacentRooms: [2, 5, 9],
    position: { x: 0, y: 0 },
    width: 500,
    height: 200
  },
  1: { 
    name: "Laundry Room", 
    fireSpaces: 2, 
    nextRoom: 2,
    adjacentRooms: [10],
    position: { x: 800, y: 280 },
    width: 140,
    height: 70
  },
  2: { 
    name: "Kitchen", 
    fireSpaces: 5, 
    nextRoom: 3,
    adjacentRooms: [7, 10],
    position: { x: 600, y: 280 },
    width: 160,
    height: 70
  },
  3: { 
    name: "Master Bathroom", 
    fireSpaces: 1, 
    nextRoom: 4,
    adjacentRooms: [4],
    position: { x: 350, y: 280 },
    width: 120,
    height: 70
  },
  4: { 
    name: "Master Bedroom", 
    fireSpaces: 3, 
    nextRoom: 5,
    adjacentRooms: [5],
    position: { x: 100, y: 280 },
    width: 180,
    height: 70
  },
  5: { 
    name: "Front Hallway", 
    fireSpaces: 1, 
    nextRoom: 6,
    adjacentRooms: [6, 7],
    position: { x: 100, y: 450 },
    width: 200,
    height: 70
  },
  6: { 
    name: "Den", 
    fireSpaces: 7, 
    nextRoom: 7,
    adjacentRooms: [7],
    position: { x: 100, y: 580 },
    width: 160,
    height: 140
  },
  7: { 
    name: "Dining Room", 
    fireSpaces: 6, 
    nextRoom: 8,
    adjacentRooms: [8, 10],
    position: { x: 380, y: 450 },
    width: 250,
    height: 270
  },
  8: { 
    name: "Main Bathroom", 
    fireSpaces: 4, 
    nextRoom: 9,
    adjacentRooms: [],
    position: { x: 700, y: 580 },
    width: 180,
    height: 150
  },
  9: { 
    name: "Garage", 
    fireSpaces: 8, 
    nextRoom: 10,
    adjacentRooms: [10],
    position: { x: 1000, y: 280 },
    width: 120,
    height: 360
  },
  10: { 
    name: "Back Hallway", 
    fireSpaces: 1, 
    nextRoom: 1,
    adjacentRooms: [],
    position: { x: 700, y: 450 },
    width: 240,
    height: 70
  }
};

export const WAYPOINTS = {
  "0-5": { x: 40, y: 400 },  // waypoint for connection between Outside (0) and room 5
  "0-9": { x: 800, y: 200 }   // waypoint for connection between Outside (0) and room 9
};

export const CHARACTERS = {
  "Lion Leader": {
    emoji: "🦁",
    abilities: { water: "another player puts out flame", fire: "move another player 1 room" },
    maxCarry: 1,
    waterCapacity: 4,
    fireCapacity: 4,
    startRoom: 0
  },
  "Orca": {
    emoji: "🐳",
    abilities: { water: "put out flame 1 room away" },
    maxCarry: 1,
    waterCapacity: 6,
    fireCapacity: 3,
    startRoom: 0
  },
  "Golden Retriever": {
    emoji: "🐕",
    abilities: { mixed: "pick up additional rescue" },
    maxCarry: Infinity,
    waterCapacity: 4,
    fireCapacity: 4,
    startRoom: 0
  },
  "Cheetah": {
    emoji: "🐆",
    abilities: { water: "move 1 room", fire: "move 1 room" },
    maxCarry: 0,
    waterCapacity: 4,
    fireCapacity: 6,
    startRoom: 0
  }
};

export const UPGRADE_CARDS = [
  {
    name: "Hose Junction",
    buyCost: { water: 7, fire: 3 },
    effect: "Players can give and receive Water Tokens",
    useCost: "free"
  },
  {
    name: "Fire Truck Quick Assist",
    buyCost: { water: 4, fire: 4 },
    effect: "Remove all flames from a room",
    useCost: "free, discard after use"
  },
  {
    name: "External Hose Quick Assist",
    buyCost: { water: 3, fire: 3 },
    effect: "Remove 3 flames from a room",
    useCost: "free, discard after use"
  }
];

export const RESCUE_CARDS = [
  "Parakeet",
  "Puppy",
  "Goldfish",
  "Kitten",
  "Hamster",
  "Mouse",
  "Rat",
  "Koala"
];

// Room adjacencies follow a one-way definition rule:
// Each connection between rooms is only defined once, where the room with the lower ID
// lists its connection to the room with the higher ID. For example, if room 2 is connected
// to room 5, this connection will only appear in room 2's adjacentRooms list, not in room 5's.
// The GameBoard component checks both directions when determining if rooms are adjacent.

// First define the base ROOMS configuration
const BASE_ROOMS = [
  // Room 0: Outside
  { 
    name: "Outside", 
    fireSpaces: 0,
    adjacentRooms: [2, 5, 9],
    nextFireSpreadRoom: 1,
    position: { x: 0, y: 0 },
    width: 500,
    height: 200
  },
  // Room 1: Laundry Room
  { 
    name: "Laundry Room", 
    fireSpaces: 2,
    adjacentRooms: [10],
    nextFireSpreadRoom: 2,
    position: { x: 800, y: 280 },
    width: 140,
    height: 70
  },
  // Room 2: Kitchen
  { 
    name: "Kitchen", 
    fireSpaces: 5,
    adjacentRooms: [7, 10],
    nextFireSpreadRoom: 3,
    position: { x: 600, y: 280 },
    width: 160,
    height: 70
  },
  // Room 3: Master Bathroom
  { 
    name: "Master Bathroom", 
    fireSpaces: 1,
    adjacentRooms: [4],
    nextFireSpreadRoom: 4,
    position: { x: 350, y: 280 },
    width: 120,
    height: 70
  },
  // Room 4: Master Bedroom
  { 
    name: "Master Bedroom", 
    fireSpaces: 3,
    adjacentRooms: [5],
    nextFireSpreadRoom: 5,
    position: { x: 100, y: 280 },
    width: 180,
    height: 70
  },
  // Room 5: Front Hallway
  { 
    name: "Front Hallway", 
    fireSpaces: 1,
    adjacentRooms: [6, 7],
    nextFireSpreadRoom: 6,
    position: { x: 100, y: 430 },
    width: 200,
    height: 70
  },
  // Room 6: Den
  { 
    name: "Den", 
    fireSpaces: 7,
    adjacentRooms: [7],
    nextFireSpreadRoom: 7,
    position: { x: 100, y: 580 },
    width: 160,
    height: 140
  },
  // Room 7: Dining Room
  { 
    name: "Dining Room", 
    fireSpaces: 6,
    adjacentRooms: [8, 10],
    nextFireSpreadRoom: 8,
    position: { x: 380, y: 430 },
    width: 250,
    height: 270
  },
  // Room 8: Main Bathroom
  { 
    name: "Main Bathroom", 
    fireSpaces: 4,
    adjacentRooms: [9],
    nextFireSpreadRoom: 9,
    position: { x: 700, y: 580 },
    width: 180,
    height: 150
  },
  // Room 9: Garage
  { 
    name: "Garage", 
    fireSpaces: 8,
    adjacentRooms: [10],
    nextFireSpreadRoom: 1,  // Loops back to 1
    position: { x: 1000, y: 280 },
    width: 120,
    height: 360
  },
  // Room 10: Back Hallway
  { 
    name: "Back Hallway", 
    fireSpaces: 1,
    adjacentRooms: [],
    nextFireSpreadRoom: 1,
    position: { x: 700, y: 430 },
    width: 240,
    height: 70
  }
];

// Process the rooms to ensure bidirectional adjacency
const processRooms = (rooms) => {
  const processed = [...rooms]; // Shallow copy is fine since we're not modifying nested objects
  
  // For each room
  rooms.forEach((room, roomId) => {
    // For each adjacent room in this room's list
    room.adjacentRooms.forEach(adjRoomId => {
      // Make sure the adjacent room has this room in its list
      if (!processed[adjRoomId].adjacentRooms.includes(roomId)) {
        processed[adjRoomId].adjacentRooms.push(roomId);
      }
    });
  });

  return processed;
};

// Export the processed ROOMS with bidirectional adjacency
export const ROOMS = processRooms(BASE_ROOMS);
console.log(ROOMS);

export const WAYPOINTS = {
  "0-5": { x: 40, y: 400 },  // waypoint for connection between Outside (0) and room 5
  "0-9": { x: 970, y: 140 }   // waypoint for connection between Outside (0) and room 9
};

export const CHARACTERS = {
  "Lion": {
    emoji: "🦁",
    specialty: "Leader",
    abilities: {
      water: "Can give water tokens to other firefighters",
      fire: "Can take fire tokens from other firefighters",
      mixed: "Can exchange tokens with other firefighters"
    },
    maxCarry: 2,
    maxWaterTokens: 3,
    maxFireTokens: 3,
    startRoom: 0
  },
  "Orca": {
    emoji: "🐳",
    specialty: "Water Master",
    abilities: { water: "put out flame 1 room away" },
    maxCarry: 1,
    maxWaterTokens: 6,
    maxFireTokens: 3,
    startRoom: 0
  },
  "Golden Retriever": {
    emoji: "🐕",
    specialty: "Rescue Expert",
    abilities: { mixed: "pick up additional rescue" },
    maxCarry: Infinity,
    maxWaterTokens: 4,
    maxFireTokens: 4,
    startRoom: 0
  },
  "Cheetah": {
    emoji: "🐆",
    specialty: "Scout",
    abilities: { water: "move 1 room", fire: "move 1 room" },
    maxCarry: 0,
    maxWaterTokens: 4,
    maxFireTokens: 6,
    startRoom: 0
  }
};

/* Potential future characters:
  "Elephant": {
    emoji: "🐘",
    specialty: "Tank",
    abilities: { water: "put out 2 flames at once" },
    maxCarry: 1,
    maxWaterTokens: 5,
    maxFireTokens: 2,
    startRoom: 0
  },
  "Kangaroo": {
    emoji: "🦘",
    specialty: "Jumper",
    abilities: { move: "can jump over 1 room" },
    maxCarry: 1,
    maxWaterTokens: 3,
    maxFireTokens: 3,
    startRoom: 0
  }
*/

// Define the order of characters for turns
export const CHARACTERS_ORDER = ["Lion", "Orca", "Golden Retriever", "Cheetah"];

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

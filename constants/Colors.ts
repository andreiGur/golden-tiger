const red = '#D7263D'; // Vibrant Red
const gold = '#FFD700'; // Gold
const black = '#000000'; // Black
const white = '#FFFFFF';

export default {
  light: {
    text: black,
    background: white,
    tint: red, // Use red for high-energy elements
    tabIconDefault: gold, // Gold for default icons
    tabIconSelected: red, // Red for selected tab
    highlight: red,
    premium: gold,
    card: '#F5F5F5', // Light card background
  },
  dark: {
    text: gold, // Gold text for contrast
    background: black,
    tint: red,
    tabIconDefault: gold,
    tabIconSelected: red,
    highlight: red,
    premium: gold,
    card: '#1A1A1A', // Dark card background
  },
};

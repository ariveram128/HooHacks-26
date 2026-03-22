// Stub for @elevenlabs/react-native on web
const React = require('react');

// Provider just renders children
function ElevenLabsProvider({ children }) {
  return children;
}

// useConversation returns a no-op object
function useConversation() {
  return {
    status: 'disconnected',
    startSession: async () => {},
    endSession: async () => {},
    setMicMuted: () => {},
    sendContextualUpdate: () => {},
    sendUserMessage: () => {},
    sendUserActivity: () => {},
  };
}

module.exports = {
  ElevenLabsProvider,
  useConversation,
  default: ElevenLabsProvider,
};

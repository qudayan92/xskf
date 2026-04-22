import React from 'react';
import AgentPanel from './AgentPanel';
import CollabPanel from './CollabPanel';

const RightPanelComposite: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AgentPanel />
      <CollabPanel />
    </div>
  );
};

export default RightPanelComposite;
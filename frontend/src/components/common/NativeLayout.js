import React, { useEffect } from 'react';
import BottomTabs from './BottomTabs';
import './NativeLayout.css';

/**
 * Layout wrapper for native Capacitor app screens
 * Includes bottom navigation tabs and proper safe area handling
 */
const NativeLayout = ({ children }) => {
  useEffect(() => {
    // Add native-app class to body for global styling
    document.body.classList.add('native-app');
    
    return () => {
      document.body.classList.remove('native-app');
    };
  }, []);

  return (
    <div className="native-layout">
      <main className="native-layout-content">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
};

export default NativeLayout;

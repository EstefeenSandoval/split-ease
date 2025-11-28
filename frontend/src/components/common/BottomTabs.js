import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faReceipt, 
  faBell, 
  faCog 
} from '@fortawesome/free-solid-svg-icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import './BottomTabs.css';

const tabs = [
  { path: '/dashboard', icon: faHome, label: 'Inicio' },
  { path: '/grupos', icon: faUsers, label: 'Grupos' },
  { path: '/gastos', icon: faReceipt, label: 'Gastos' },
  { path: '/notificaciones', icon: faBell, label: 'Alertas' },
  { path: '/opciones', icon: faCog, label: 'Ajustes' },
];

const BottomTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabPress = async (path) => {
    if (location.pathname !== path) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available
      }
      navigate(path);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bottom-tabs">
      <div className="bottom-tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            type="button"
            className={`bottom-tab ${isActive(tab.path) ? 'active' : ''}`}
            onClick={() => handleTabPress(tab.path)}
            aria-label={tab.label}
          >
            <div className="bottom-tab-icon-wrapper">
              <FontAwesomeIcon icon={tab.icon} className="bottom-tab-icon" />
              {isActive(tab.path) && <span className="bottom-tab-indicator" />}
            </div>
            <span className="bottom-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomTabs;

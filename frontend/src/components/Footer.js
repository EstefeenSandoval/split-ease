import React, { useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [hoveredLinks, setHoveredLinks] = useState({});
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const footerSections = [
    {
      title: 'Producto',
      links: ['Características', 'Precios', 'Cómo funciona', 'Actualizaciones']
    },
    {
      title: 'Empresa',
      links: ['Acerca de', 'Blog', 'Carreras', 'Prensa']
    },
    {
      title: 'Soporte',
      links: ['Centro de ayuda', 'Contacto', 'Estado del servicio', 'Seguridad']
    },
    {
      title: 'Legal',
      links: ['Términos de servicio', 'Política de privacidad', 'Cookies', 'Licencias']
    }
  ];

  const socialIcons = [
    { icon: '📘', name: 'Facebook' },
    { icon: '🐦', name: 'Twitter' },
    { icon: '📷', name: 'Instagram' },
    { icon: '💼', name: 'LinkedIn' }
  ];

  const handleLinkHover = (sectionIndex, linkIndex, isHovered) => {
    setHoveredLinks(prev => ({
      ...prev,
      [`${sectionIndex}-${linkIndex}`]: isHovered
    }));
  };

  const handleSocialHover = (index, isHovered) => {
    setHoveredSocial(isHovered ? index : null);
  };

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo and description section */}
          <div>
            <div className="footer-logo">
              <span className="footer-logo-icon">💲</span>
              <span className="footer-logo-text">SplitEase</span>
            </div>
            <p className="footer-description">
              La forma más fácil de dividir gastos entre amigos. Simplicidad, seguridad y transparencia en cada transacción.
            </p>
            <div className="footer-social-links">
              {socialIcons.map((social, index) => (
                <button
                  key={index}
                  className={`footer-social-link ${hoveredSocial === index ? 'footer-social-link-hover' : ''}`}
                  onMouseEnter={() => handleSocialHover(index, true)}
                  onMouseLeave={() => handleSocialHover(index, false)}
                  title={social.name}
                  onClick={() => console.log(`Clicked on ${social.name}`)}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer sections */}
          {footerSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="footer-section-title">
                {section.title}
              </h3>
              <ul className="footer-links-list">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="footer-link-item">
                    <button
                      className={`footer-link ${hoveredLinks[`${sectionIndex}-${linkIndex}`] ? 'footer-link-hover' : ''}`}
                      onMouseEnter={() => handleLinkHover(sectionIndex, linkIndex, true)}
                      onMouseLeave={() => handleLinkHover(sectionIndex, linkIndex, false)}
                      onClick={() => console.log(`Clicked on ${link}`)}
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="footer-bottom">
          <p>
            &copy; 2025 SplitEase. Todos los derechos reservados. | Hecho con ❤️ para simplificar tus finanzas
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
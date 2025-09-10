import React, { useState } from 'react';
import './Footer.css';
import logo2 from '../assets/logo2.png'; 

const Footer = () => {
  const [hoveredLinks, setHoveredLinks] = useState({});
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const styles = {
    footer: {
      background: 'linear-gradient(135deg, #252627 0%, #2e3138 100%)',
      color: 'white',
      padding: '3rem 0 1rem',
      marginTop: '4rem',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    footerContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem',
    },
    footerSection: {
      // Base styles for footer sections
    },
    footerLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '1rem',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#bcebcb',
    },
    logoIcon: {
      fontSize: '1.5rem',
    },
    footerDescription: {
      color: '#ccc',
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
    },
    socialLink: {
      display: 'inline-block',
      width: '40px',
      height: '40px',
      background: '#498467',
      color: 'white',
      borderRadius: '50%',
      textAlign: 'center',
      lineHeight: '40px',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: 'none',
      fontSize: '1rem',
    },
    socialLinkHover: {
      background: '#bcebcb',
      transform: 'translateY(-2px)',
    },
    sectionTitle: {
      color: '#bcebcb',
      marginBottom: '1rem',
      fontSize: '1.2rem',
      fontWeight: '600',
    },
    linksList: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    linkItem: {
      marginBottom: '0.5rem',
    },
    link: {
      color: '#ccc',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      cursor: 'pointer',
    },
    linkHover: {
      color: '#bcebcb',
    },
    footerBottom: {
      borderTop: '1px solid #444',
      paddingTop: '1rem',
      textAlign: 'center',
      color: '#999',
    },
    // Media queries para mobile
    '@media (max-width: 768px)': {
      footerContent: {
        gridTemplateColumns: '1fr',
        textAlign: 'center',
      },
      socialLinks: {
        justifyContent: 'center',
      },
    },
  };

  const footerSections = [
    {
      title: 'Acerca De',
      links: ['Características', 'Cómo funciona', 'Actualizaciones', 'Precios']
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
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.footerContent}>
          {/* Logo and description section */}
          <div style={styles.footerSection}>
            <div style={styles.footerLogo}>
              <img src={logo2} alt="Logo" className="header-logo-img" />
              <span style={styles.logoText}>SplitEase</span>
            </div>
            <p style={styles.footerDescription}>
              La forma más fácil de dividir gastos entre amigos. Simplicidad, seguridad y transparencia en cada transacción.
            </p>
            <div style={styles.socialLinks}>
              {socialIcons.map((social, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.socialLink,
                    ...(hoveredSocial === index ? styles.socialLinkHover : {})
                  }}
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
            <div key={sectionIndex} style={styles.footerSection}>
              <h3 style={styles.sectionTitle}>
                {section.title}
              </h3>
              <ul style={styles.linksList}>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} style={styles.linkItem}>
                    <button
                      style={{
                        ...styles.link,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: 'inherit',
                        ...(hoveredLinks[`${sectionIndex}-${linkIndex}`] ? styles.linkHover : {})
                      }}
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
        
        <div style={styles.footerBottom}>
          <p>
            &copy; 2025 SplitEase. Todos los derechos reservados. | Hecho con ❤️ para simplificar tus finanzas
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
/**
 * Email Helper - Utilidad para envío de correos electrónicos
 * Usa Mailjet como proveedor SMTP
 */

const Mailjet = require('node-mailjet');
require('dotenv').config();

// Configuración de Mailjet
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE
});

// URL base del frontend
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://split-ease.up.railway.app';

// Configuración del remitente
const SENDER_EMAIL = process.env.MJ_SENDER_EMAIL || 'noreply@splitease.com';
const SENDER_NAME = process.env.MJ_SENDER_NAME || 'SplitEase';

/**
 * Plantilla HTML base para todos los emails
 */
const getBaseTemplate = (content, previewText = '') => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>SplitEase</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .button { width: 100% !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                💰 SplitEase
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Divide gastos, no amistades
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                Este es un mensaje automático de SplitEase.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Si no solicitaste esta acción, puedes ignorar este correo de forma segura.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Copyright -->
        <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} SplitEase. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Genera botón de acción para los emails
 */
const getActionButton = (text, url, color = '#667eea') => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
  <tr>
    <td align="center">
      <a href="${url}" class="button" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, ${color} 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 50px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

/**
 * Envía email de verificación de cuenta
 */
const sendVerificationEmail = async (email, nombre, token) => {
  const verificationUrl = `${FRONTEND_URL}/verificar-email/${token}`;
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
      ¡Bienvenido a SplitEase, ${nombre}! 🎉
    </h2>
    
    <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Estamos emocionados de tenerte con nosotros. Para comenzar a dividir gastos con tus amigos, solo necesitas verificar tu correo electrónico.
    </p>
    
    <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Haz clic en el siguiente botón para activar tu cuenta:
    </p>
    
    ${getActionButton('Verificar mi Email', verificationUrl)}
    
    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
      O copia y pega este enlace en tu navegador:
    </p>
    <p style="margin: 0; padding: 12px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #667eea; font-size: 13px;">
      ${verificationUrl}
    </p>
    
    <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ⏰ <strong>Importante:</strong> Este enlace expirará en 24 horas.
      </p>
    </div>
  `;

  const htmlContent = getBaseTemplate(content, `¡Hola ${nombre}! Verifica tu email para comenzar a usar SplitEase.`);

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: SENDER_EMAIL,
            Name: SENDER_NAME
          },
          To: [
            {
              Email: email,
              Name: nombre
            }
          ],
          Subject: '✉️ Verifica tu email - SplitEase',
          HTMLPart: htmlContent
        }
      ]
    });
    
    console.log('Email de verificación enviado a:', email);
    return { success: true, messageId: result.body.Messages[0].To[0].MessageID };
  } catch (error) {
    console.error('Error enviando email de verificación:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envía email de recuperación de contraseña
 */
const sendPasswordResetEmail = async (email, nombre, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
      Recupera tu contraseña 🔐
    </h2>
    
    <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta de SplitEase.
    </p>
    
    <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Haz clic en el siguiente botón para crear una nueva contraseña:
    </p>
    
    ${getActionButton('Restablecer Contraseña', resetUrl, '#ef4444')}
    
    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
      O copia y pega este enlace en tu navegador:
    </p>
    <p style="margin: 0; padding: 12px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #667eea; font-size: 13px;">
      ${resetUrl}
    </p>
    
    <div style="margin-top: 30px; padding: 20px; background-color: #fee2e2; border-radius: 12px; border-left: 4px solid #ef4444;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        ⏰ <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.
      </p>
    </div>
    
    <p style="margin-top: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu cuenta permanecerá segura.
    </p>
  `;

  const htmlContent = getBaseTemplate(content, `Hola ${nombre}, aquí está tu enlace para restablecer tu contraseña de SplitEase.`);

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: SENDER_EMAIL,
            Name: SENDER_NAME
          },
          To: [
            {
              Email: email,
              Name: nombre
            }
          ],
          Subject: '🔐 Restablece tu contraseña - SplitEase',
          HTMLPart: htmlContent
        }
      ]
    });
    
    console.log('Email de reset de contraseña enviado a:', email);
    return { success: true, messageId: result.body.Messages[0].To[0].MessageID };
  } catch (error) {
    console.error('Error enviando email de reset:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envía email de confirmación de cambio de perfil
 */
const sendProfileChangeVerificationEmail = async (email, nombre, token, cambios) => {
  const verifyUrl = `${FRONTEND_URL}/verificar-cambio/${token}`;
  
  // Construir lista de cambios
  let cambiosHtml = '<ul style="margin: 15px 0; padding-left: 20px; color: #4b5563;">';
  if (cambios.nuevoNombre) {
    cambiosHtml += `<li style="margin-bottom: 8px;">Nombre: <strong>${cambios.nombreActual}</strong> → <strong>${cambios.nuevoNombre}</strong></li>`;
  }
  if (cambios.nuevoEmail) {
    cambiosHtml += `<li style="margin-bottom: 8px;">Email: <strong>${cambios.emailActual}</strong> → <strong>${cambios.nuevoEmail}</strong></li>`;
  }
  cambiosHtml += '</ul>';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
      Confirma los cambios en tu perfil 📝
    </h2>
    
    <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hola <strong>${nombre}</strong>, recibimos una solicitud para modificar la información de tu cuenta de SplitEase.
    </p>
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 12px;">
      <p style="margin: 0 0 10px; color: #374151; font-weight: 600;">Cambios solicitados:</p>
      ${cambiosHtml}
    </div>
    
    <p style="margin: 0 0 15px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Si tú realizaste estos cambios, haz clic en el siguiente botón para confirmarlos:
    </p>
    
    ${getActionButton('Confirmar Cambios', verifyUrl, '#10b981')}
    
    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
      O copia y pega este enlace en tu navegador:
    </p>
    <p style="margin: 0; padding: 12px; background-color: #f3f4f6; border-radius: 8px; word-break: break-all; color: #667eea; font-size: 13px;">
      ${verifyUrl}
    </p>
    
    <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ⏰ <strong>Importante:</strong> Este enlace expirará en 24 horas.
      </p>
    </div>
    
    <div style="margin-top: 15px; padding: 20px; background-color: #fee2e2; border-radius: 12px; border-left: 4px solid #ef4444;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        ⚠️ <strong>¿No fuiste tú?</strong> Si no solicitaste estos cambios, ignora este correo y considera cambiar tu contraseña por seguridad.
      </p>
    </div>
  `;

  const htmlContent = getBaseTemplate(content, `Hola ${nombre}, confirma los cambios en tu perfil de SplitEase.`);

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: SENDER_EMAIL,
            Name: SENDER_NAME
          },
          To: [
            {
              Email: email,
              Name: nombre
            }
          ],
          Subject: '📝 Confirma los cambios en tu perfil - SplitEase',
          HTMLPart: htmlContent
        }
      ]
    });
    
    console.log('Email de cambio de perfil enviado a:', email);
    return { success: true, messageId: result.body.Messages[0].To[0].MessageID };
  } catch (error) {
    console.error('Error enviando email de cambio de perfil:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Genera un token seguro de verificación
 */
const generateVerificationToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendProfileChangeVerificationEmail,
  generateVerificationToken
};

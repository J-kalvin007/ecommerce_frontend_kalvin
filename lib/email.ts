// "use server"

// // Fonction pour envoyer des email avec SMTP

// import nodemailer from 'nodemailer';

// type EmailResponse = {
//   success: boolean;
//   message: string;
// };


// // Fonction pour envoyer des emails de bienvenue avec SMTP
// export async function sendWelcomeEmail(userData: { name: string; email: string; role: string }): Promise<EmailResponse> {

//   // Validation des champs requis
//   if (!userData.name || !userData.email) {
//     console.error('❌ Champs manquants pour l\'envoi de l\'email de bienvenue');
//     return {
//       success: false,
//       message: 'Nom et email sont obligatoires'
//     };
//   }

//   // Validation de l'email
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(userData.email)) {
//     console.error('❌ Format d\'email invalide');
//     return {
//       success: false,
//       message: 'Format d\'email invalide'
//     };
//   }

//   // Vérification des variables d'environnement
//   if (!process.env.GMAIL_USERNAME || !process.env.GMAIL_PASSWORD) {
//     console.error('❌ Variables d\'environnement manquantes pour l\'envoi d\'email');
//     return {
//       success: false,
//       message: 'Configuration serveur incomplète'
//     };
//   }

//   // Configuration du transporteur Nodemailer
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.GMAIL_USERNAME,
//       pass: process.env.GMAIL_PASSWORD,
//     },
//     connectionTimeout: 10000,
//     socketTimeout: 10000,
//   });

//   try {
//     // Vérification de la connexion SMTP
//     await transporter.verify();
//     console.log('✅ Serveur SMTP prêt pour l\'envoi');

//     // URL de connexion de votre application
//     const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}/connexion`;

//     // Construction de l'email premium
//     const mailOptions = {
//       from: {
//         name: `Green Challenger - Équipe`,
//         address: process.env.GMAIL_USERNAME
//       },
//       to: userData.email,
//       subject: `🎉 Bienvenue sur Green Challenger ${userData.name} !`,
//       text: `
//         Bienvenue sur Green Challenger !
        
//         Cher(e) ${userData.name},
        
//         Félicitations ! Votre compte a été créé avec succès sur notre plateforme Green Challenger.
        
//         Vous pouvez dès maintenant vous connecter et accéder à toutes les fonctionnalités :
//         ${loginUrl}
        
     
//         Cordialement,
//         L'équipe Green Challenger
//       `,
//       html: `
// <!DOCTYPE html>
// <html lang="fr">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Bienvenue sur Green Challenger</title>
//     <style>
//         @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
//         body {
//             font-family: 'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif;
//             background-color: #f1f5f9;
//             margin: 0;
//             padding: 0;
//             -webkit-font-smoothing: antialiased;
//             color: #1e293b;
//             line-height: 1.6;
//         }
        
//         .wrapper {
//             width: 100%;
//             background-color: #f1f5f9;
//             padding: 40px 0;
//         }
        
//         .email-container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #ffffff;
//             border-radius: 24px;
//             overflow: hidden;
//             box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
//             border: 1px solid rgba(226, 232, 240, 0.8);
//         }
        
//         .header {
//             background: linear-gradient(135deg, #059669 0%, #10b981 100%);
//             padding: 48px 40px;
//             text-align: center;
//             color: white;
//             position: relative;
//         }
        
//         .logo {
//             font-size: 32px;
//             font-weight: 700;
//             letter-spacing: -1px;
//             margin-bottom: 8px;
//             text-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }

//         .logo-subtitle {
//           opacity: 0.9;
//           font-weight: 400;
//           font-size: 16px;
//         }
        
//         .content {
//             padding: 48px 40px;
//             background-color: #ffffff;
//         }
        
//         .greeting {
//             font-size: 28px;
//             font-weight: 700;
//             color: #0f172a;
//             margin-bottom: 16px;
//             text-align: center;
//             letter-spacing: -0.5px;
//         }
        
//         .welcome-text {
//             font-size: 16px;
//             color: #475569;
//             margin-bottom: 32px;
//             text-align: center;
//             line-height: 1.7;
//         }
        
//         .role-badge {
//             background-color: #ecfdf5;
//             color: #059669;
//             padding: 4px 12px;
//             border-radius: 9999px;
//             font-weight: 600;
//             font-size: 0.9em;
//             display: inline-block;
//             border: 1px solid #a7f3d0;
//             vertical-align: middle;
//         }

//         .credentials-card {
//             background: linear-gradient(145deg, #f8fafc, #f1f5f9);
//             border: 1px solid #e2e8f0;
//             border-radius: 16px;
//             padding: 32px;
//             margin: 32px 0;
//             text-align: center;
//         }

//         .email-label {
//             font-size: 12px;
//             text-transform: uppercase;
//             letter-spacing: 1.5px;
//             color: #64748b;
//             font-weight: 600;
//             margin-bottom: 12px;
//             display: block;
//         }

//         .email-value {
//             font-size: 18px;
//             color: #0f172a;
//             font-weight: 500;
//             font-family: 'Monaco', 'Courier New', monospace;
//             background: white;
//             padding: 12px 24px;
//             border-radius: 8px;
//             border: 1px solid #e2e8f0;
//             display: inline-block;
//         }
        
//         .cta-button {
//             display: block;
//             background: linear-gradient(135deg, #059669 0%, #10b981 100%);
//             color: #ffffff !important;
//             text-decoration: none;
//             padding: 18px 36px;
//             border-radius: 12px;
//             text-align: center;
//             font-weight: 600;
//             font-size: 16px;
//             margin: 40px 0;
//             transition: all 0.3s ease;
//             box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.4);
//             letter-spacing: 0.5px;
//         }
        
//         .features-grid {
//             display: grid;
//             grid-template-columns: repeat(2, 1fr);
//             gap: 16px;
//             margin-top: 48px;
//             border-top: 1px solid #f1f5f9;
//             padding-top: 40px;
//         }
        
//         .feature-item {
//             padding: 24px 20px;
//             background-color: #f8fafc;
//             border-radius: 16px;
//             border: 1px solid #f1f5f9;
//             text-align: center;
//         }
        
//         .feature-icon {
//             font-size: 24px;
//             margin-bottom: 12px;
//             background-color: #ffffff;
//             width: 56px;
//             height: 56px;
//             line-height: 56px;
//             border-radius: 50%;
//             margin-left: auto;
//             margin-right: auto;
//             box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
//         }
        
//         .feature-text {
//             font-size: 14px;
//             color: #334155;
//             font-weight: 600;
//         }
        
//         .footer {
//             background-color: #f8fafc;
//             padding: 40px;
//             text-align: center;
//             border-top: 1px solid #e2e8f0;
//         }
        
//         .footer-text {
//             color: #94a3b8;
//             font-size: 13px;
//             line-height: 1.6;
//             margin: 0;
//         }
        
//         .support-link {
//           color: #059669;
//           text-decoration: none;
//           font-weight: 500;
//         }

//         @media (max-width: 600px) {
//             .wrapper { padding: 0; }
//             .email-container { border-radius: 0; border: none; }
//             .content { padding: 32px 20px; }
//             .header { padding: 40px 20px; }
//             .features-grid { grid-template-columns: 1fr; }
//             .credentials-card { padding: 24px 16px; }
//         }
//     </style>
// </head>
// <body>
//     <div class="wrapper">
//         <div class="email-container">
//             <!-- En-tête -->
//             <div class="header">
//                 <div class="logo">🌱 Green Challenger</div>
//                 <div class="logo-subtitle">Votre partenaire pour un avenir durable</div>
//             </div>
            
//             <!-- Contenu principal -->
//             <div class="content">
//                 <h1 class="greeting">Bienvenue, ${userData.name}&nbsp;!</h1>
                
//                 <p class="welcome-text">
//                     Nous sommes ravis de vous compter parmi nous.<br>
//                     Votre compte a été créé avec succès avec le privilège <span class="role-badge">${userData.role}</span>.
//                 </p>
                
//                 <!-- Informations de connexion -->
//                 <div class="credentials-card">
//                     <span class="email-label">Votre identifiant de connexion</span>
//                     <div class="email-value">${userData.email}</div>
//                 </div>
            
//                 <!-- Bouton d'appel à l'action -->
//                 <a href="${loginUrl}" class="cta-button">
//                     🚀 Accéder à mon compte
//                 </a>
                
//                 <!-- Fonctionnalités -->
//                 <div class="features-grid">
//                     <div class="feature-item">
//                         <div class="feature-icon">📊</div>
//                         <div class="feature-text">Suivi temps réel</div>
//                     </div>
//                     <div class="feature-item">
//                         <div class="feature-icon">🌍</div>
//                         <div class="feature-text">Impact positif</div>
//                     </div>
//                     <div class="feature-item">
//                         <div class="feature-icon">📈</div>
//                         <div class="feature-text">Analyses pro</div>
//                     </div>
//                     <div class="feature-item">
//                         <div class="feature-icon">🤝</div>
//                         <div class="feature-text">Communauté</div>
//                     </div>
//                 </div>
//             </div>
            
//             <!-- Pied de page -->
//             <div class="footer">
//                 <p class="footer-text">
//                     <strong>Green Challenger</strong><br>
//                     Ensemble pour un monde meilleur.<br><br>
                    
//                     Besoin d'assistance ? <a href="mailto:support@greenchallenger.com" class="support-link">Contactez le support</a><br><br>
                    
//                     <span style="opacity: 0.7; font-size: 11px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</span>
//                 </p>
//             </div>
//         </div>
//     </div>
// </body>
// </html>
//       `,
//     };

//     // Envoi de l'email
//     const result = await transporter.sendMail(mailOptions);

//     console.log(`✅ Email de bienvenue envoyé avec succès à ${userData.email}`);
//     console.log(`👤 Destinataire: ${userData.name}`);
//     console.log(`📧 Message ID: ${result.messageId}`);
//     console.log(`🌐 Lien de connexion: ${loginUrl}`);

//     return {
//       success: true,
//       message: 'Email de bienvenue envoyé avec succès ! ✅'
//     };

//   } catch (error) {
//     // Gestion détaillée des erreurs
//     console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);

//     let errorMessage = 'Erreur lors de l\'envoi de l\'email de bienvenue';

//     if (error instanceof Error) {
//       if ('code' in error) {
//         switch (error.code) {
//           case 'EAUTH':
//             errorMessage = 'Erreur d\'authentification email';
//             break;
//           case 'ECONNECTION':
//             errorMessage = 'Erreur de connexion au serveur email';
//             break;
//           case 'ETIMEDOUT':
//             errorMessage = 'Timeout de connexion au serveur email';
//             break;
//           default:
//             errorMessage = `Erreur technique: ${error.message}`;
//         }
//       } else {
//         errorMessage = error.message;
//       }
//     }

//     return {
//       success: false,
//       message: errorMessage
//     };
//   } finally {
//     // Fermeture propre du transporteur
//     transporter.close();
//   }
// };




































import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true pour SSL, false pour STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: { filename: string; content: string | Buffer; encoding?: string }[];
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
  const { to, subject, text, html, replyTo, attachments } = payload;
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP configuration missing');
    return { success: false, message: 'Service email non configuré' };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      replyTo,
      attachments,
    });
    return { success: true, message: 'Email envoyé' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: "Erreur lors de l'envoi de l'email" };
  }
}
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, name, orderReference, pdfBase64 } = await request.json();

    if (!email || !name || !orderReference || !pdfBase64) {
      return NextResponse.json(
        { error: 'Veuillez fournir toutes les informations nécessaires (email, nom, référence, PDF).' },
        { status: 400 }
      );
    }

    // Extraction du contenu Base64 pur si c'est une Data URI
    let contentBase64 = pdfBase64;
    if (pdfBase64.includes('base64,')) {
      contentBase64 = pdfBase64.split('base64,')[1];
    }

    const to = email;
    const subject = `Votre facture L'Atelier du Terroir - Commande N°${orderReference}`;
    
    // Corps de l'email Ultra-Premium
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9f8; color: #1f241c; line-height: 1.6; }
              .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }
              .header { background: #1f4d3f; padding: 40px 30px; text-align: center; }
              .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px; }
              .header p { color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px; }
              .content { padding: 40px 30px; }
              .content p { margin: 0 0 15px 0; font-size: 15px; }
              .order-ref { display: inline-block; background: rgba(31,77,63,0.1); color: #1f4d3f; padding: 8px 16px; border-radius: 8px; font-weight: bold; letter-spacing: 1px; font-family: monospace; font-size: 16px; margin: 15px 0; }
              .footer { background: #f8f9f8; padding: 25px 30px; text-align: center; border-top: 1px solid #eaeaea; }
              .footer p { margin: 0; color: #888888; font-size: 12px; }
              .btn { display: inline-block; background: #8b5e34; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>L'ATELIER DU TERROIR</h1>
                  <p>L'excellence des produits locaux</p>
              </div>
              <div class="content">
                  <p>Bonjour <strong>${name}</strong>,</p>
                  <p>Nous vous remercions pour votre commande sur L'Atelier du Terroir !</p>
                  <p>Votre paiement a bien été reçu et votre commande est en cours de préparation.</p>
                  
                  <div class="order-ref">Réf: ${orderReference}</div>
                  
                  <p>Veuillez trouver ci-joint votre facture au format PDF.</p>
                  <p>Pour toute question concernant votre commande, n'hésitez pas à nous contacter en répondant simplement à cet email.</p>
                  
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="btn">Continuer vos achats</a>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} L'Atelier du Terroir. Tous droits réservés.</p>
                  <p>Avenue de la République, Lomé, Togo</p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Envoi de l'email avec la pièce jointe
    const result = await sendEmail({
      to,
      subject,
      html,
      attachments: [
        {
          filename: `Facture_${orderReference}.pdf`,
          content: contentBase64,
          encoding: 'base64',
        }
      ]
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Facture envoyée avec succès par email.' });
  } catch (error) {
    console.error('Invoice Email API error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'envoi de la facture.' }, { status: 500 });
  }
}

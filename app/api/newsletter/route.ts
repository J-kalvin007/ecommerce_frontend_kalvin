

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    const to = process.env.SMTP_CONTACT_TO || process.env.SMTP_USER || '';
    const fullSubject = subject ? `${subject} - depuis le site` : 'Nouveau message depuis le site';
    const html = `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Sujet :</strong> ${subject || 'Non spécifié'}</p>
      <p><strong>Message :</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const result = await sendEmail({
      to,
      subject: fullSubject,
      html,
      replyTo: email,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
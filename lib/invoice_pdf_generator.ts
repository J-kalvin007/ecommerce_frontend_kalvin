import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './utils';

export interface InvoiceData {
    reference: string;
    date: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        country: string;
    };
    items: {
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    subtotal: number;
    shipping: number;
    discount: number;
    loyaltyDiscount: number;
    total: number;
}

export const generateInvoicePDFBase64 = async (data: InvoiceData): Promise<string> => {
    return new Promise((resolve) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Palette ultra-premium (L'Atelier du Terroir)
        const colors = {
            primary: [31, 77, 63] as [number, number, number],       // #1f4d3f (Vert principal)
            secondary: [139, 94, 52] as [number, number, number],    // #8b5e34 (Marron doré/terroir)
            dark: [31, 36, 28] as [number, number, number],          // #1f241c
            text: [85, 90, 80] as [number, number, number],          // Muted text
            light: [248, 249, 248] as [number, number, number],      // Background / alternance
            white: [255, 255, 255] as [number, number, number]
        };

        // --- EN-TÊTE (Bande de couleur) ---
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Ligne décorative dorée
        doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.rect(0, 40, pageWidth, 2, 'F');

        // Texte En-tête (Logo textuel si l'image fail)
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text("L'ATELIER DU TERROIR", 20, 26);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text("L'excellence des produits locaux", 20, 34);

        // Mot FACTURE à droite
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.text("FACTURE", pageWidth - 20, 26, { align: 'right' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`N° ${data.reference}`, pageWidth - 20, 34, { align: 'right' });

        // --- LOGO (Tentative de chargement) ---
        try {
            const img = new Image();
            img.src = '/assets/images/LOGO.png';
            img.onload = () => {
                // Si le logo charge, on peut éventuellement masquer le texte et mettre l'image
                // Mais pour une facture pro, avoir l'image + le texte stylisé peut suffire
                // doc.addImage(img, 'PNG', 20, 5, 30, 30);
            };
        } catch (e) {
            console.warn("Erreur chargement logo PDF");
        }

        // --- INFORMATIONS LÉGALES & CLIENT ---
        let startY = 55;

        // Émetteur
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Émetteur :", 20, startY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text("L'Atelier du Terroir", 20, startY + 6);
        doc.text("Avenue de la République, Lomé", 20, startY + 11);
        doc.text("Togo", 20, startY + 16);
        doc.text("Email: contact@atelier-terroir.com", 20, startY + 21);
        doc.text("Téléphone: +228 90 00 00 00", 20, startY + 26);

        // Client
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Facturé à :", pageWidth / 2 + 10, startY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`${data.customer.firstName} ${data.customer.lastName}`, pageWidth / 2 + 10, startY + 6);
        doc.text(data.customer.address, pageWidth / 2 + 10, startY + 11);
        doc.text(`${data.customer.city}, ${data.customer.country}`, pageWidth / 2 + 10, startY + 16);
        doc.text(`Email: ${data.customer.email}`, pageWidth / 2 + 10, startY + 21);
        doc.text(`Téléphone: ${data.customer.phone}`, pageWidth / 2 + 10, startY + 26);

        // Détails facture
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Date d'émission :`, 20, startY + 40);
        doc.setFont('helvetica', 'normal');
        doc.text(data.date, 55, startY + 40);

        // --- TABLEAU DES ARTICLES ---
        const tableData = data.items.map(item => [
            item.name,
            item.quantity.toString(),
            formatCurrency(item.unitPrice.toString(), "FCFA"),
            formatCurrency(item.total.toString(), "FCFA")
        ]);

        autoTable(doc, {
            startY: startY + 50,
            head: [['Description', 'Quantité', 'Prix Unitaire', 'Total']],
            body: tableData,
            theme: 'plain',
            headStyles: {
                fillColor: colors.light,
                textColor: colors.primary,
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'left',
                cellPadding: 6,
                lineColor: colors.secondary,
                lineWidth: { bottom: 0.5 }
            },
            bodyStyles: {
                fontSize: 10,
                textColor: colors.dark,
                cellPadding: 6,
                lineColor: [230, 230, 230],
                lineWidth: { bottom: 0.1 }
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 20, right: 20 },
            didDrawPage: (drawData) => {
                // Pied de page si plusieurs pages
            }
        });

        // --- RÉCAPITULATIF FINANCIER ---
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        const recapX = pageWidth - 90;

        doc.setFontSize(10);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        
        // Sous-total
        doc.text("Sous-total :", recapX, finalY);
        doc.text(formatCurrency(data.subtotal.toString(), "FCFA"), pageWidth - 20, finalY, { align: 'right' });

        // Livraison
        doc.text("Frais de livraison :", recapX, finalY + 6);
        doc.text(formatCurrency(data.shipping.toString(), "FCFA"), pageWidth - 20, finalY + 6, { align: 'right' });

        // Code Promo
        if (data.discount > 0) {
            doc.text("Remise (Code) :", recapX, finalY + 12);
            doc.text(`-${formatCurrency(data.discount.toString(), "FCFA")}`, pageWidth - 20, finalY + 12, { align: 'right' });
        }

        // Points Fidélité
        if (data.loyaltyDiscount > 0) {
            const offset = data.discount > 0 ? 18 : 12;
            doc.text("Remise (Fidélité) :", recapX, finalY + offset);
            doc.text(`-${formatCurrency(data.loyaltyDiscount.toString(), "FCFA")}`, pageWidth - 20, finalY + offset, { align: 'right' });
        }

        // Ligne de séparation
        const lineY = finalY + (data.discount > 0 && data.loyaltyDiscount > 0 ? 22 : (data.discount > 0 || data.loyaltyDiscount > 0 ? 16 : 10));
        doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.setLineWidth(0.5);
        doc.line(recapX, lineY, pageWidth - 20, lineY);

        // Total
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text("TOTAL :", recapX, lineY + 8);
        doc.text(formatCurrency(data.total.toString(), "FCFA"), pageWidth - 20, lineY + 8, { align: 'right' });

        // Cachet "Payé"
        doc.setTextColor(34, 197, 94); // Vert succès
        doc.setFontSize(30);
        doc.setFont('helvetica', 'bold');
        // Angle de rotation pour le cachet
        doc.text("PAYÉ", 40, finalY + 15, { angle: 25, align: 'center', opacity: 0.2 } as any);

        // --- PIED DE PAGE ---
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        const footerY = pageHeight - 15;
        doc.text("L'Atelier du Terroir - NIF : 123456789 - RCCM : TG-LOM-2023-M-1234", pageWidth / 2, footerY, { align: 'center' });
        doc.text("Merci pour votre confiance !", pageWidth / 2, footerY + 5, { align: 'center' });

        // Sortie Base64 Data URI
        // datauristring renvoie "data:application/pdf;filename=generated.pdf;base64,JVBERi..."
        const base64String = doc.output('datauristring');
        resolve(base64String);
    });
};

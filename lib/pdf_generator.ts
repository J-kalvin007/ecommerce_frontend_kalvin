import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types pour les données du rapport
interface ReportData {
    title: string;
    subtitle?: string;
    generatedBy: string;
    period?: string;
    columns: string[];
    rows: any[][];
    summary?: { label: string; value: string }[];
}

export const generatePDFReport = async (data: ReportData, fileName: string = 'rapport.pdf') => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Palette de Couleurs "Nature Premium"
    const colors = {
        primary: [6, 78, 59],       // Deep Emerald (Emerald 900)
        secondary: [16, 185, 129],  // Vibrant Emerald (Emerald 500)
        accent: [20, 184, 166],     // Teal 500
        dark: [17, 24, 39],         // Gray 900
        text: [55, 65, 81],         // Gray 700
        light: [156, 163, 175],     // Gray 400
        background: [248, 250, 252], // Slate 50
        white: [255, 255, 255]
    };

    // --- SECTION 1: EN-TÊTE BLANC AVEC LOGO AGRANDI ---

    // Header clean (fond blanc pour faire ressortir le logo vert)
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo Challenger (Plus grand)
    let logoWidth = 50;
    let logoHeight = 0;
    try {
        const img = new Image();
        img.src = '/logo_challenger.png';
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });

        if (img.width > 0) {
            logoHeight = (img.height * logoWidth) / img.width;
            doc.addImage(img, 'PNG', 15, 8, logoWidth, logoHeight);
        }
    } catch (e) {
        console.warn('Logo non chargé', e);
    }

    // Branding à côté du logo
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('CHALLENGER', 15 + logoWidth + 8, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text('SOLUTIONS DE PILOTAGE AGRICOLE INTELLIGENT', 15 + logoWidth + 8, 30);

    // --- BARRE DE MÉTADONNÉES (VERT EMERAUDE) ---
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 45, pageWidth, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const dateStr = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date());

    doc.text(`DATE D'ÉMISSION : ${dateStr.toUpperCase()}`, 15, 54);
    doc.text(`OPÉRATEUR : ${data.generatedBy.toUpperCase()}`, pageWidth - 15, 54, { align: 'right' });

    // --- TITRE DU DOCUMENT ---
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title.toUpperCase(), 15, 80);

    // Underline décorative
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(1.5);
    doc.line(15, 84, 45, 84);

    if (data.subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFont('helvetica', 'italic');
        doc.text(data.subtitle, 15, 90);
    }

    // --- RÉSUMÉ ANALYTIQUE (KPIs) ---
    let tableStartY = 105;
    if (data.summary && data.summary.length > 0) {
        const margin = 15;
        const boxCount = Math.min(data.summary.length, 4);
        const boxWidth = (pageWidth - 30 - (boxCount - 1) * 5) / boxCount;
        const boxHeight = 28;

        data.summary.forEach((item, index) => {
            const x = margin + (index * (boxWidth + 5));

            // Ombre portée simulation
            doc.setFillColor(241, 245, 249);
            doc.rect(x + 1, 101, boxWidth, boxHeight, 'F');

            // Box principale
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            doc.setLineWidth(0.5);
            doc.roundedRect(x, 100, boxWidth, boxHeight, 2, 2, 'FD');

            // Accent bar latérale
            doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
            doc.rect(x, 100, 3, boxHeight, 'F');

            // Label
            doc.setFontSize(7);
            doc.setTextColor(colors.light[0], colors.light[1], colors.light[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(item.label.toUpperCase(), x + 7, 108);

            // Valeur
            doc.setFontSize(14);
            doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(item.value, x + 7, 120);
        });
        tableStartY = 140;
    }

    // --- TABLEAU DE DONNÉES PROFESSIONNEL ---
    autoTable(doc, {
        startY: tableStartY,
        head: [data.columns],
        body: data.rows,
        theme: 'grid',
        headStyles: {
            fillColor: [6, 78, 59],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 5,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [31, 41, 55],
            cellPadding: 4,
            valign: 'middle',
            lineColor: [241, 245, 249],
            lineWidth: 0.1
        },
        alternateRowStyles: {
            fillColor: [250, 252, 250]
        },
        styles: {
            font: 'helvetica',
            overflow: 'linebreak'
        },
        margin: { left: 15, right: 15, top: 20, bottom: 25 },
        didDrawPage: (drawData) => {
            // PIED DE PAGE PREMIUM
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);

            // Filet séparateur
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.2);
            doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

            // Copyright et Page
            doc.setTextColor(colors.light[0], colors.light[1], colors.light[2]);
            doc.text(`GREEN CHALLENGER © ${new Date().getFullYear()} - SYSTÈME DE GESTION DHORS-SOL`, 15, pageHeight - 12);
            doc.text(`PAGE ${pageCount}`, pageWidth - 15, pageHeight - 12, { align: 'right' });

            // Petit motif décoratif bas gauche
            doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
            doc.circle(15, pageHeight - 12.5, 0.8, 'F');
        }
    });

    // --- TÉLÉCHARGEMENT ---
    doc.save(fileName);
};

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface FarmReportData {
    period: string;
    managerName?: string;
    managerEmail?: string;
    totalProduction: string;
    fcr: string;
    waterQuality: string;
    activeAlerts: string;
    ponds: {
        id: string;
        health: string;
        feed: string;
        growth: string;
        status: string;
    }[];
}

export function generateFarmPDF(data: FarmReportData) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB");
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    // Constants
    const PRIMARY: [number, number, number] = [0, 212, 170]; // AquaSmart Cyan
    const SECONDARY: [number, number, number] = [6, 11, 20]; // Deep Dark
    const DANGER: [number, number, number] = [239, 68, 68];
    const WARNING: [number, number, number] = [245, 158, 11];
    const SUCCESS: [number, number, number] = [16, 185, 129];

    // ─── STYLIZED HEADER ───────────────────────────────────────────
    doc.setFillColor(...SECONDARY);
    doc.rect(0, 0, 210, 45, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text("AquaSmart AI", 15, 25);
    doc.setFontSize(10);
    doc.setTextColor(...PRIMARY);
    doc.text("FARM-WIDE EXECUTIVE PERFORMANCE AUDIT", 15, 32);

    // Manager info
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`MANAGER: ${data.managerName || "UNASSIGNED"}`, 195, 20, { align: "right" });
    doc.text(`EMAIL: ${data.managerEmail || "N/A"}`, 195, 25, { align: "right" });
    doc.text(`PERIOD: ${data.period.toUpperCase()}`, 195, 30, { align: "right" });

    // ─── REPORT TITLE BLOCK ────────────────────────────────────────
    let y = 55;
    doc.setTextColor(...SECONDARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`EXECUTIVE SUMMARY - ${data.period.toUpperCase()} PERFORMANCE`, 15, y);
    
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Date of Audit: ${dateStr} | Source: AquaSmart Cloud Monitoring`, 15, y);

    // ─── 1. OVERALL FARM METRICS ───────────────────────────────────
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...SECONDARY);
    doc.text("1. OVERALL FARM PERFORMANCE SUMMARY", 15, y);

    autoTable(doc, {
        startY: y + 5,
        head: [["METRIC", "VALUE", "CONDITION"]],
        body: [
            ["Total Production", `${data.totalProduction} kg`, "Target Achieved"],
            ["Average FCR", data.fcr, "Optimized"],
            ["Overall Water Quality", data.waterQuality, "Safe"],
            ["Active Alerts", data.activeAlerts, data.activeAlerts === "0" ? "None" : "Attention Required"],
        ],
        theme: "striped",
        headStyles: { fillColor: SECONDARY, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 4, halign: "center" },
        columnStyles: { 0: { halign: "left", fontStyle: "bold", cellWidth: 50 } },
        margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // ─── 2. POND-BY-POND BREAKDOWN ─────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...SECONDARY);
    doc.text("2. INDIVIDUAL POND PERFORMANCE BREAKDOWN", 15, y);

    autoTable(doc, {
        startY: y + 8,
        head: [["POND ID", "HEALTH SCORE", "FEED RATE", "GROWTH RATE", "AI STATUS"]],
        body: data.ponds.map(p => [
            p.id.toUpperCase(),
            p.health,
            p.feed,
            p.growth,
            p.status.toUpperCase()
        ]),
        theme: "grid",
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 3, halign: "center" },
        didParseCell: (dataCell: any) => {
            if (dataCell.section === "body" && dataCell.column.index === 4) {
                const val = String(dataCell.cell.raw);
                if (val.includes("DANGER") || val.includes("خطر")) {
                    dataCell.cell.styles.textColor = DANGER;
                } else if (val.includes("SAFE") || val.includes("مستقر")) {
                    dataCell.cell.styles.textColor = SUCCESS;
                }
            }
        },
        margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 20;

    // ─── 3. AI EXECUTIVE RECOMMENDATION ────────────────────────────
    if (y > 220) {
        doc.addPage();
        y = 30;
    }
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 25, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...SECONDARY);
    doc.text("3. AI EXECUTIVE RECOMMENDATION", 20, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    const recommendation = `Based on the current ${data.period.toLowerCase()} performance, the farm is showing optimal growth trends. The FCR of ${data.fcr} is within the ideal range. We suggest maintaining current feeding schedules while closely monitoring DO levels in ponds with higher density.`;
    const splitText = doc.splitTextToSize(recommendation, 170);
    doc.text(splitText, 25, y + 18);

    // ─── FOOTER ───────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`AQUASMART AI SYSTEM - OFFICIAL AUDIT REPORT - PAGE ${i} OF ${pageCount} | ${now.getFullYear()}`, 105, 290, { align: "center" });
    }

    doc.save(`AquaSmart_Farm_Report_${data.period.toUpperCase()}_${now.getTime()}.pdf`);
}

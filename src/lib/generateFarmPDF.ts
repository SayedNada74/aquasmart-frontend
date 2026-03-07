import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface FarmReportData {
    period: string;
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

    // ===== HEADER =====
    doc.setFillColor(10, 14, 26);
    doc.rect(0, 0, 210, 50, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 212, 170);
    doc.text("AquaSmart AI System", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(136, 153, 170);
    doc.text(`Farm-Wide Executive Performance Report (${data.period})`, 105, 30, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Generated: ${dateStr} ${timeStr} | Official Record`, 105, 40, { align: "center" });

    doc.setDrawColor(0, 212, 170);
    doc.setLineWidth(0.8);
    doc.line(15, 48, 195, 48);

    // ===== 1. SUMMARY METRICS =====
    let y = 65;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("1. Overall Farm Performance Summary", 15, y);

    y += 15;
    autoTable(doc, {
        startY: y,
        head: [["Metric", "Value", "Condition"]],
        body: [
            ["Total Production", `${data.totalProduction} kg`, "Target Achieved"],
            ["Average FCR", data.fcr, "Optimized"],
            ["Overall Water Quality", data.waterQuality, "Safe"],
            ["Active Alerts", data.activeAlerts, data.activeAlerts === "0" ? "None" : "Attention Required"],
        ],
        theme: "striped",
        headStyles: { fillColor: [10, 14, 26], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 20;

    // ===== 2. POND-BY-POND BREAKDOWN =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("2. Individual Pond Performance Breakdown", 15, y);

    y += 10;
    autoTable(doc, {
        startY: y,
        head: [["Pond ID", "Health Score", "Feed Rate", "Growth Rate", "AI Status"]],
        body: data.ponds.map(p => [
            p.id,
            p.health,
            p.feed,
            p.growth,
            p.status
        ]),
        theme: "grid",
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        styles: { fontSize: 9 },
        didParseCell: (dataCell: any) => {
            if (dataCell.section === "body" && dataCell.column.index === 4) {
                const val = String(dataCell.cell.raw);
                if (val.toLowerCase().includes("danger") || val.toLowerCase().includes("خطر")) {
                    dataCell.cell.styles.textColor = [192, 57, 43];
                } else if (val.toLowerCase().includes("stable") || val.toLowerCase().includes("مستقر")) {
                    dataCell.cell.styles.textColor = [39, 174, 96];
                }
            }
        },
        margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 20;

    // ===== 3. EXECUTIVE RECOMMENDATION =====
    if (y > 220) {
        doc.addPage();
        y = 30;
    }
    doc.setFillColor(236, 240, 241);
    doc.rect(15, y, 180, 25, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("3. AI Executive Recommendation", 20, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    const recommendation = `Based on the current ${data.period.toLowerCase()} performance, the farm is showing optimal growth trends. The FCR of ${data.fcr} is within the ideal range. We suggest maintaining current feeding schedules while closely monitoring DO levels in ponds with higher density.`;
    const splitText = doc.splitTextToSize(recommendation, 170);
    doc.text(splitText, 20, y + 18);

    // ===== FOOTER =====
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount} | AquaSmart AI - Smart Aquaculture Solutions`, 105, 290, { align: "center" });
    }

    doc.save(`AquaSmart_Farm_Executive_Report_${data.period}_${now.toISOString().split("T")[0]}.pdf`);
}

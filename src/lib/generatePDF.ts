import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PondReportData {
    pondId: string;
    pondName: string;
    current: { Temperature: number; PH: number; Ammonia: number; DO: number; timestamp: string };
    aiStatus: string;
    aiReason: string;
    aiConfidence: string;
    history: { time: string; T: number; pH: number; NH3: number; DO: number; status: string }[];
}

export function generatePondPDF(pond: PondReportData) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB");
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    // Helper: draw charts like Python's matplotlib
    const drawChart = (x: number, y: number, w: number, h: number, title: string, data: number[], color: [number, number, number], limit?: number) => {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(x, y, w, h, 2, 2, "F");

        doc.setDrawColor(200);
        doc.rect(x, y, w, h);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(44, 62, 80);
        doc.text(title, x + 5, y + 8);

        if (data.length < 2) return;

        const pad = 10;
        const chartW = w - pad * 2;
        const chartH = h - pad * 2 - 5;
        const chartX = x + pad;
        const chartY = y + pad + 10;

        const minVal = Math.min(...data, limit || 999) * 0.9;
        const maxVal = Math.max(...data, limit || -999) * 1.1;
        const range = maxVal - minVal || 1;

        // Draw grid
        doc.setDrawColor(230);
        doc.setLineWidth(0.1);
        for (let i = 0; i <= 4; i++) {
            const gy = chartY + chartH - (i * chartH / 4);
            doc.line(chartX, gy, chartX + chartW, gy);
        }

        // Draw Limit line if exists
        if (limit !== undefined) {
            const limitY = chartY + chartH - ((limit - minVal) / range) * chartH;
            if (limitY >= chartY && limitY <= chartY + chartH) {
                doc.setDrawColor(231, 76, 60);
                doc.setLineWidth(0.3);
                doc.setLineDashPattern([2, 1], 0);
                doc.line(chartX, limitY, chartX + chartW, limitY);
                doc.setLineDashPattern([], 0);
            }
        }

        // Draw Data Line
        doc.setDrawColor(...color);
        doc.setLineWidth(0.6);
        for (let i = 0; i < data.length - 1; i++) {
            const x1 = chartX + (i * chartW / (data.length - 1));
            const y1 = chartY + chartH - ((data[i] - minVal) / range) * chartH;
            const x2 = chartX + ((i + 1) * chartW / (data.length - 1));
            const y2 = chartY + chartH - ((data[i + 1] - minVal) / range) * chartH;
            doc.line(x1, y1, x2, y2);

            // Draw points
            doc.setFillColor(...color);
            doc.circle(x1, y1, 0.8, "F");
            if (i === data.length - 2) doc.circle(x2, y2, 0.8, "F");
        }
    };

    // ===== HEADER (Python Style) =====
    // logo.png replacement with placeholder if not found (can't check fs easily, usually logo is in base64 or url)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text("AquaSmart AI System", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(127, 140, 141);
    doc.text("Comprehensive Water Quality Analysis Report", 105, 28, { align: "center" });

    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.5);
    doc.line(10, 38, 200, 38);

    // ===== POND INFO =====
    let currentY = 50;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Target: ${pond.pondName}   |   Date: ${dateStr}`, 15, currentY);

    currentY += 8;
    const isReal = pond.history.length > 0;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Data Source: ${isReal ? "(LIVE SENSOR DATA)" : "(SIMULATED DATA)"}   |   Time: ${timeStr} Export`, 15, currentY);

    // ===== 1. AI EXECUTIVE SUMMARY =====
    currentY += 12;
    doc.setFillColor(236, 240, 241);
    doc.rect(15, currentY, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("  1. AI Executive Summary", 15, currentY + 7);

    currentY += 15;
    const statuses = pond.history.map((h) => h.status || "").join(" ");
    let aiMsg: string;
    let msgColor: [number, number, number];
    if (statuses.includes("Danger")) {
        aiMsg = "CRITICAL: The system detected unsafe conditions. High Ammonia or Low Oxygen levels were recorded. Immediate corrective action (Aeration/Water Exchange) is recommended.";
        msgColor = [192, 57, 43];
    } else if (statuses.includes("Warning")) {
        aiMsg = "WARNING: System stability is fluctuating. Some parameters are approaching unsafe limits. Increase monitoring frequency.";
        msgColor = [243, 156, 18];
    } else if (statuses.includes("Safe")) {
        aiMsg = "OPTIMAL: All water quality parameters are within safe ranges. The ecosystem is stable and healthy.";
        msgColor = [39, 174, 96];
    } else {
        aiMsg = pond.aiStatus ? `SYSTEM STATUS: ${pond.aiStatus}.` : "STATUS: No anomalies detected in current cycle.";
        msgColor = [52, 73, 94];
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...msgColor);
    const splitMsg = doc.splitTextToSize(aiMsg, 170);
    doc.text(splitMsg, 20, currentY);
    currentY += splitMsg.length * 6 + 5;

    // ===== 2. KEY STATISTICS =====
    doc.setFillColor(236, 240, 241);
    doc.rect(15, currentY, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("  2. Key Statistics", 15, currentY + 7);
    currentY += 15;

    const hist = pond.history;
    const getStats = (vals: number[]) => {
        if (vals.length === 0) return { min: "N/A", max: "N/A", avg: "N/A" };
        return {
            min: Math.min(...vals).toFixed(1),
            max: Math.max(...vals).toFixed(1),
            avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
        };
    };

    const temps = hist.map((h) => h.T);
    const phs = hist.map((h) => h.pH);
    const nh3s = hist.map((h) => h.NH3);
    const dos = hist.map((h) => h.DO);

    const tStats = getStats(temps);
    const phStats = getStats(phs);
    const nh3Stats = getStats(nh3s);
    const doStats = getStats(dos);

    autoTable(doc, {
        startY: currentY,
        head: [["Parameter", "Min", "Max", "Average", "Current"]],
        body: [
            ["Temperature (C)", tStats.min, tStats.max, tStats.avg, pond.current.Temperature?.toFixed(1) || "--"],
            ["Acidity (PH)", phStats.min, phStats.max, phStats.avg, pond.current.PH?.toFixed(1) || "--"],
            ["Ammonia (NH3)", nh3Stats.min, nh3Stats.max, nh3Stats.avg, pond.current.Ammonia?.toFixed(2) || "--"],
            ["Oxygen (DO)", doStats.min, doStats.max, doStats.avg, pond.current.DO?.toFixed(1) || "--"],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3, halign: "center" },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        columnStyles: { 0: { halign: "left", fontStyle: "bold" } },
        margin: { left: 15, right: 15 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // ===== 3. VISUAL TRENDS ANALYSIS (New Section) =====
    doc.setFillColor(236, 240, 241);
    doc.rect(15, currentY, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("  3. Visual Trends Analysis", 15, currentY + 7);
    currentY += 15;

    // Draw 4 charts in grid (2x2)
    const cw = 85;
    const ch = 40;

    if (currentY + ch * 2 + 10 > 280) {
        doc.addPage();
        currentY = 20;
    }

    drawChart(15, currentY, cw, ch, "Temperature Trends", temps, [230, 126, 34]);
    drawChart(110, currentY, cw, ch, "pH Level Analysis", phs, [142, 68, 173]);
    currentY += ch + 5;
    drawChart(15, currentY, cw, ch, "Ammonia (NH3) Stability", nh3s, [192, 57, 43], 0.8);
    drawChart(110, currentY, cw, ch, "Dissolved Oxygen (DO)", dos, [41, 128, 185], 4.2);

    currentY += ch + 15;

    // ===== 4. DETAILED HOURLY LOGS =====
    if (currentY > 230) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFillColor(236, 240, 241);
    doc.rect(15, currentY, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("  4. Detailed Hourly Logs", 15, currentY + 7);
    currentY += 15;

    const tableBody = hist.slice(-12).map((h) => {
        const tVal = h.time?.includes(" ") ? h.time.split(" ")[1].substring(0, 5) : h.time;
        return [tVal, String(h.T), String(h.pH), String(h.NH3), String(h.DO), h.status || "Pending"];
    });

    autoTable(doc, {
        startY: currentY,
        head: [["Time", "Temp", "pH", "NH3", "DO", "AI Status"]],
        body: tableBody,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, halign: "center" },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
        didParseCell: (dataCell: any) => {
            if (dataCell.section === "body" && dataCell.column.index === 5) {
                const val = String(dataCell.cell.raw);
                if (val.includes("Danger")) {
                    dataCell.cell.styles.fillColor = [231, 76, 60];
                    dataCell.cell.styles.textColor = 255;
                } else if (val.includes("Warning")) {
                    dataCell.cell.styles.fillColor = [241, 196, 15];
                    dataCell.cell.styles.textColor = 0;
                }
            }
        },
        margin: { left: 15, right: 15 },
    });

    // FOOTER
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(`Page ${i} of ${pageCount} | AquaSmart AI Intelligence System`, 105, 290, { align: "center" });
    }

    doc.save(`AquaSmart_Detailed_Report_${pond.pondId}_${now.getTime()}.pdf`);
}

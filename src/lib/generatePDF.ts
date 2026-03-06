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

    // ===== HEADER =====
    doc.setFillColor(10, 14, 26);
    doc.rect(0, 0, 210, 45, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 212, 170);
    doc.text("AquaSmart AI System", 105, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(136, 153, 170);
    doc.text("Comprehensive Water Quality Analysis Report", 105, 26, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Date: ${dateStr}  |  Time: ${timeStr}`, 105, 34, { align: "center" });

    doc.setDrawColor(0, 212, 170);
    doc.setLineWidth(0.5);
    doc.line(15, 44, 195, 44);

    // ===== POND INFO =====
    let y = 55;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text(`Target: ${pond.pondName}`, 15, y);

    const isReal = pond.history.length > 0;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Data Source: ${isReal ? "(LIVE SENSOR DATA)" : "(SIMULATED DATA)"}`, 15, y + 7);

    // ===== 1. AI EXECUTIVE SUMMARY =====
    y += 20;
    doc.setFillColor(236, 240, 241);
    doc.rect(15, y, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("  1. AI Executive Summary", 15, y + 7);

    y += 15;
    const statuses = pond.history.map((h) => h.status || "").join(" ");
    let aiMsg: string;
    let msgColor: [number, number, number];
    if (statuses.includes("Danger")) {
        aiMsg = "CRITICAL: The system detected unsafe conditions. High Ammonia or Low Oxygen levels were recorded. Immediate corrective action (Aeration/Water Exchange) is recommended.";
        msgColor = [192, 57, 43];
    } else if (statuses.includes("Warning")) {
        aiMsg = "WARNING: System stability is fluctuating. Some parameters are approaching unsafe limits. Increase monitoring frequency.";
        msgColor = [243, 156, 18];
    } else {
        aiMsg = "OPTIMAL: All water quality parameters are within safe ranges. The ecosystem is stable and healthy.";
        msgColor = [39, 174, 96];
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...msgColor);
    const splitMsg = doc.splitTextToSize(aiMsg, 170);
    doc.text(splitMsg, 20, y);
    y += splitMsg.length * 5 + 5;

    if (pond.aiReason) {
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(9);
        doc.text(`AI Reason: ${pond.aiReason}`, 20, y);
        y += 5;
        doc.text(`AI Confidence: ${pond.aiConfidence}`, 20, y);
        y += 10;
    }

    // ===== 2. KEY STATISTICS =====
    doc.setFillColor(236, 240, 241);
    doc.rect(15, y, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("  2. Key Statistics", 15, y + 7);
    y += 15;

    const c = pond.current;
    const hist = pond.history;

    const getStats = (vals: number[]) => ({
        min: Math.min(...vals).toFixed(1),
        max: Math.max(...vals).toFixed(1),
        avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    });

    const temps = hist.length > 0 ? hist.map((h) => h.T) : [c.Temperature];
    const phs = hist.length > 0 ? hist.map((h) => h.pH) : [c.PH];
    const nh3s = hist.length > 0 ? hist.map((h) => h.NH3) : [c.Ammonia];
    const dos = hist.length > 0 ? hist.map((h) => h.DO) : [c.DO];

    const tStats = getStats(temps);
    const phStats = getStats(phs);
    const nh3Stats = getStats(nh3s);
    const doStats = getStats(dos);

    autoTable(doc, {
        startY: y,
        head: [["Parameter", "Min", "Max", "Average", "Current"]],
        body: [
            ["Temperature (°)", tStats.min, tStats.max, tStats.avg, c.Temperature?.toFixed(1) || "--"],
            ["Power of hydrogen (PH)", phStats.min, phStats.max, phStats.avg, c.PH?.toFixed(1) || "--"],
            ["Ammonia (NH3)", nh3Stats.min, nh3Stats.max, nh3Stats.avg, c.Ammonia?.toFixed(2) || "--"],
            ["Dissolved Oxygen (DO)", doStats.min, doStats.max, doStats.avg, c.DO?.toFixed(1) || "--"],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ===== 3. CURRENT READINGS VISUAL =====
    doc.setFillColor(236, 240, 241);
    doc.rect(15, y, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("  3. Current Sensor Readings", 15, y + 7);
    y += 18;

    const drawGauge = (x: number, label: string, value: number, unit: string, safe: boolean) => {
        doc.setFillColor(safe ? 39 : 231, safe ? 174 : 76, safe ? 96 : 60);
        doc.roundedRect(x, y, 40, 30, 3, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text(`${value}`, x + 20, y + 14, { align: "center" });
        doc.setFontSize(8);
        doc.text(unit, x + 20, y + 20, { align: "center" });
        doc.setFontSize(7);
        doc.setTextColor(200, 200, 200);
        doc.text(label, x + 20, y + 27, { align: "center" });
    };

    const isTempSafe = c.Temperature >= 24 && c.Temperature <= 32;
    const isPhSafe = c.PH >= 6.5 && c.PH <= 8.5;
    const isNh3Safe = c.Ammonia <= 0.5;
    const isDoSafe = c.DO >= 5.0;

    drawGauge(20, "Temperature (°)", Number(c.Temperature?.toFixed(1)), "", isTempSafe);
    drawGauge(65, "Power of hydrogen (PH)", Number(c.PH?.toFixed(1)), "", isPhSafe);
    drawGauge(110, "Ammonia (NH3)", Number(c.Ammonia?.toFixed(2)), "", isNh3Safe);
    drawGauge(155, "Dissolved Oxygen (DO)", Number(c.DO?.toFixed(1)), "", isDoSafe);

    y += 40;

    // ===== 4. HOURLY LOGS =====
    if (hist.length > 0) {
        if (y > 200) { doc.addPage(); y = 20; }

        doc.setFillColor(236, 240, 241);
        doc.rect(15, y, 180, 10, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text("  4. Detailed Hourly Logs", 15, y + 7);
        y += 15;

        const tableBody = hist.slice(-20).map((h) => {
            const timeStr = h.time?.split(" ")[1]?.substring(0, 5) || h.time || "--";
            return [timeStr, String(h.T), String(h.pH), String(h.NH3), String(h.DO), h.status || "Pending"];
        });

        autoTable(doc, {
            startY: y,
            head: [["Time", "Temp°C", "pH", "NH3", "DO", "AI Status"]],
            body: tableBody,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
            bodyStyles: { textColor: [0, 0, 0] },
            didParseCell: (data: any) => {
                if (data.section === "body" && data.column.index === 5) {
                    const val = String(data.cell.raw);
                    if (val.includes("Danger")) {
                        data.cell.styles.fillColor = [231, 76, 60];
                        data.cell.styles.textColor = 255;
                    } else if (val.includes("Warning")) {
                        data.cell.styles.fillColor = [241, 196, 15];
                        data.cell.styles.textColor = 0;
                    } else if (val.includes("Safe")) {
                        data.cell.styles.fillColor = [39, 174, 96];
                        data.cell.styles.textColor = 255;
                    }
                }
            },
            margin: { left: 15, right: 15 },
        });
    }

    // ===== FOOTER =====
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount} | Generated by AquaSmart AI`, 105, 290, { align: "center" });
    }

    // ===== DOWNLOAD =====
    const fileName = `AquaSmart_Report_${pond.pondId}_${now.toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
}

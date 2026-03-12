import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Report Generator Service
 * Creates professional clinical reports with branding
 */

export const generatePDFReport = async (results, hospitalName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('FEDRAL AI', 20, 20);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Clinical Intelligence Report', 20, 30);

    // Hospital Info
    yPos = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Hospital: ${hospitalName || 'Unknown'}`, 20, yPos);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, yPos);

    // Summary Section
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const summaryData = [
        ['Total Patients Analyzed', results.totalCount.toString()],
        ['Overall Accuracy', `${results.accuracy.toFixed(2)}%`],
        ['Sensitivity (Recall)', `${results.sensitivity.toFixed(2)}%`],
        ['Specificity', `${results.specificity.toFixed(2)}%`],
        ['Precision (PPV)', `${results.precision.toFixed(2)}%`],
        ['F1 Score', `${results.f1Score.toFixed(2)}%`],
        ['AUC-ROC', results.auc?.toFixed(3) || 'N/A']
    ];

    doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
    });

    // Risk Distribution
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Risk Distribution', 20, yPos);

    yPos += 10;
    const riskData = [
        ['High Risk', results.high_risk.toString(), `${((results.high_risk / results.totalCount) * 100).toFixed(1)}%`],
        ['Medium Risk', results.medium_risk.toString(), `${((results.medium_risk / results.totalCount) * 100).toFixed(1)}%`],
        ['Low Risk', results.low_risk.toString(), `${((results.low_risk / results.totalCount) * 100).toFixed(1)}%`]
    ];

    doc.autoTable({
        startY: yPos,
        head: [['Category', 'Count', 'Percentage']],
        body: riskData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
    });

    // Confusion Matrix
    if (results.confusionMatrix) {
        yPos = doc.lastAutoTable.finalY + 15;

        // Check if we need a new page
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Confusion Matrix', 20, yPos);

        yPos += 10;
        const { tp, fp, fn, tn } = results.confusionMatrix;
        const confusionData = [
            ['True Positive (TP)', tp.toString()],
            ['False Positive (FP)', fp.toString()],
            ['False Negative (FN)', fn.toString()],
            ['True Negative (TN)', tn.toString()]
        ];

        doc.autoTable({
            startY: yPos,
            head: [['Classification', 'Count']],
            body: confusionData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10 },
            margin: { left: 20, right: 20 }
        });
    }

    // Feature Importance
    if (results.featureImportance && results.featureImportance.length > 0) {
        yPos = doc.lastAutoTable.finalY + 15;

        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Feature Importance', 20, yPos);

        yPos += 10;
        const featureData = results.featureImportance.map(f => [
            f.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            (f.value * 10).toFixed(2) + '%',
            f.impact === 'positive' ? 'Increases Risk' : 'Decreases Risk'
        ]);


        doc.autoTable({
            startY: yPos,
            head: [['Feature', 'Importance', 'Impact']],
            body: featureData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10 },
            margin: { left: 20, right: 20 }
        });
    }

    // Priority Patients
    if (results.priorityPatients && results.priorityPatients.length > 0) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Priority Patients (Top 10 Highest Risk)', 20, yPos);

        yPos += 10;
        const priorityData = results.priorityPatients.map((p, idx) => [
            (idx + 1).toString(),
            p.patientId,
            (p.probability * 100).toFixed(1) + '%',
            p.age.toString(),
            p.riskCategory.toUpperCase()
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Rank', 'Patient ID', 'Risk Score', 'Age', 'Category']],
            body: priorityData,
            theme: 'grid',
            headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9 },
            margin: { left: 20, right: 20 }
        });
    }

    // Data Quality Summary
    if (results.dataQuality) {
        yPos = doc.lastAutoTable.finalY + 15;

        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Data Quality Assessment', 20, yPos);

        yPos += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Overall Quality Score: ${results.dataQuality.overallQuality.toFixed(1)}%`, 20, yPos);
    }

    // Footer on all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            'CONFIDENTIAL - For Clinical Use Only',
            pageWidth - 20,
            pageHeight - 10,
            { align: 'right' }
        );
    }

    return doc;
};

/**
 * Export to CSV
 */
export const exportToCSV = (results, filename = 'fedral_analysis.csv') => {
    const rows = [
        ['FEDRAL AI - Clinical Analysis Report'],
        ['Generated:', new Date().toLocaleString()],
        [''],
        ['SUMMARY METRICS'],
        ['Total Patients', results.totalCount],
        ['Accuracy', `${results.accuracy.toFixed(2)}%`],
        ['Sensitivity', `${results.sensitivity.toFixed(2)}%`],
        ['Specificity', `${results.specificity.toFixed(2)}%`],
        ['Precision', `${results.precision.toFixed(2)}%`],
        ['F1 Score', `${results.f1Score.toFixed(2)}%`],
        [''],
        ['RISK DISTRIBUTION'],
        ['High Risk', results.high_risk],
        ['Medium Risk', results.medium_risk],
        ['Low Risk', results.low_risk],
        [''],
        ['PATIENT DATA'],
        ['Patient ID', 'Age', 'Risk Category', 'Risk Score', 'Confidence', 'Biomarker1', 'Biomarker2', 'Biomarker3', 'Prediction', 'Actual']
    ];

    results.results.forEach(patient => {
        rows.push([
            patient.patientId,
            patient.age,
            patient.riskCategory,
            (patient.probability * 100).toFixed(2),
            (patient.confidence * 100).toFixed(2),
            patient.biomarker1?.toFixed(2) || 'N/A',
            patient.biomarker2?.toFixed(2) || 'N/A',
            patient.biomarker3?.toFixed(2) || 'N/A',
            patient.prediction,
            patient.outcome
        ]);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Export to JSON
 */
export const exportToJSON = (results, filename = 'fedral_analysis.json') => {
    const jsonContent = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

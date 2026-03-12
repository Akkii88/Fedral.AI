/**
 * Enhanced AI Inference Service
 * Computes comprehensive clinical analytics including advanced ML metrics,
 * feature importance, ROC curves, and data quality assessments
 */

// Feature weights for logistic regression model (trained coefficients)
const FEATURE_WEIGHTS = {
    age: 0.023,
    biomarker1: 0.45,
    biomarker2: 0.32,
    biomarker3: 0.28,
    comorbidity_score: 0.15
};

const INTERCEPT = -2.5;

/**
 * Sigmoid function for probability calculation
 */
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

/**
 * Calculate feature importance based on coefficient magnitudes
 */
const calculateFeatureImportance = (data) => {
    const features = ['age', 'biomarker1', 'biomarker2', 'biomarker3', 'comorbidity_score'];

    // Calculate mean absolute feature values for scaling
    const meanValues = {};
    features.forEach(feature => {
        const values = data.map(row => Math.abs(row[feature] || 0));
        meanValues[feature] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    // Compute scaled importance (coefficient * mean value)
    const importance = features.map(feature => ({
        feature,
        weight: FEATURE_WEIGHTS[feature],
        scaledImportance: Math.abs(FEATURE_WEIGHTS[feature] * meanValues[feature]),
        direction: FEATURE_WEIGHTS[feature] > 0 ? 'positive' : 'negative'
    }));

    // Sort by absolute importance
    importance.sort((a, b) => b.scaledImportance - a.scaledImportance);

    // Normalize to percentages
    const totalImportance = importance.reduce((sum, item) => sum + item.scaledImportance, 0);
    importance.forEach(item => {
        item.importancePercent = (item.scaledImportance / totalImportance) * 100;
    });

    return importance;
};

/**
 * Calculate data quality metrics
 */
const calculateDataQuality = (data) => {
    const features = ['age', 'biomarker1', 'biomarker2', 'biomarker3', 'comorbidity_score'];
    const qualityMetrics = {};

    features.forEach(feature => {
        const values = data.map(row => row[feature]).filter(v => v != null && !isNaN(v));
        const missing = data.length - values.length;
        const completeness = (values.length / data.length) * 100;

        // Calculate statistics
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

        // Detect outliers (values > 3 std deviations from mean)
        const outliers = values.filter(v => Math.abs(v - mean) > 3 * std);

        qualityMetrics[feature] = {
            completeness,
            missing,
            mean,
            median,
            std,
            min: Math.min(...values),
            max: Math.max(...values),
            outlierCount: outliers.length,
            outlierPercent: (outliers.length / values.length) * 100
        };
    });

    // Overall quality score (average completeness)
    const overallQuality = Object.values(qualityMetrics)
        .reduce((sum, m) => sum + m.completeness, 0) / features.length;

    return {
        features: qualityMetrics,
        overallQuality,
        totalRecords: data.length
    };
};

/**
 * Calculate ROC curve points
 */
const calculateROCCurve = (results) => {
    // Sort by prediction probability (descending)
    const sorted = [...results].sort((a, b) => b.probability - a.probability);

    const rocPoints = [];
    const totalPositives = results.filter(r => r.outcome === 1).length;
    const totalNegatives = results.filter(r => r.outcome === 0).length;

    let tp = 0, fp = 0;

    // Add point at (0, 0)
    rocPoints.push({ fpr: 0, tpr: 0, threshold: 1.0 });

    // Calculate points at each threshold
    sorted.forEach((result, idx) => {
        if (result.outcome === 1) tp++;
        else fp++;

        // Add point every 10% of data or at probability changes
        if (idx % Math.ceil(sorted.length / 20) === 0 ||
            idx === sorted.length - 1 ||
            (idx > 0 && Math.abs(result.probability - sorted[idx - 1].probability) > 0.05)) {
            rocPoints.push({
                fpr: fp / totalNegatives,
                tpr: tp / totalPositives,
                threshold: result.probability
            });
        }
    });

    // Add point at (1, 1)
    rocPoints.push({ fpr: 1, tpr: 1, threshold: 0.0 });

    // Calculate AUC using trapezoidal rule
    let auc = 0;
    for (let i = 1; i < rocPoints.length; i++) {
        const width = rocPoints[i].fpr - rocPoints[i - 1].fpr;
        const height = (rocPoints[i].tpr + rocPoints[i - 1].tpr) / 2;
        auc += width * height;
    }

    return { points: rocPoints, auc };
};

/**
 * Calculate calibration curve data
 */
const calculateCalibration = (results) => {
    const bins = 10;
    const calibrationPoints = [];

    for (let i = 0; i < bins; i++) {
        const binStart = i / bins;
        const binEnd = (i + 1) / bins;
        const binMid = (binStart + binEnd) / 2;

        const binResults = results.filter(r =>
            r.probability >= binStart && r.probability < binEnd
        );

        if (binResults.length > 0) {
            const actualPositiveRate = binResults.filter(r => r.outcome === 1).length / binResults.length;
            calibrationPoints.push({
                predictedProbability: binMid,
                actualProbability: actualPositiveRate,
                count: binResults.length
            });
        }
    }

    return calibrationPoints;
};

/**
 * Main inference function with comprehensive analytics
 */
export const runInference = async (data, onProgress) => {
    const total = data.length;
    const results = [];

    // Calculate feature importance
    const featureImportance = calculateFeatureImportance(data);

    // Calculate data quality metrics
    const dataQuality = calculateDataQuality(data);

    // Run predictions
    for (let i = 0; i < total; i++) {
        if (i % 10 === 0) {
            await new Promise(r => setTimeout(r, 100));
            onProgress(Math.round(((i + 1) / total) * 100));
        }

        const row = data[i];

        // Calculate logistic regression score
        const z = INTERCEPT +
            (row.age || 0) * FEATURE_WEIGHTS.age +
            (row.biomarker1 || 0) * FEATURE_WEIGHTS.biomarker1 +
            (row.biomarker2 || 0) * FEATURE_WEIGHTS.biomarker2 +
            (row.biomarker3 || 0) * FEATURE_WEIGHTS.biomarker3 +
            (row.comorbidity_score || 0) * FEATURE_WEIGHTS.comorbidity_score;

        const probability = sigmoid(z);
        const prediction = probability > 0.5 ? 1 : 0;
        const actual = row.outcome;

        // Calculate risk category
        let riskCategory;
        if (probability >= 0.7) riskCategory = 'high';
        else if (probability >= 0.4) riskCategory = 'medium';
        else riskCategory = 'low';

        // Calculate feature contributions for this patient
        const contributions = {
            age: (row.age || 0) * FEATURE_WEIGHTS.age,
            biomarker1: (row.biomarker1 || 0) * FEATURE_WEIGHTS.biomarker1,
            biomarker2: (row.biomarker2 || 0) * FEATURE_WEIGHTS.biomarker2,
            biomarker3: (row.biomarker3 || 0) * FEATURE_WEIGHTS.biomarker3,
            comorbidity_score: (row.comorbidity_score || 0) * FEATURE_WEIGHTS.comorbidity_score
        };

        results.push({
            patientId: row.patient_id || `P${String(i + 1).padStart(4, '0')}`,
            ...row,
            prediction,
            probability,
            confidence: Math.abs(probability - 0.5) * 2, // 0 to 1 scale
            riskCategory,
            isCorrect: prediction === actual,
            contributions
        });
    }

    // Calculate confusion matrix
    const tp = results.filter(r => r.prediction === 1 && r.outcome === 1).length;
    const fp = results.filter(r => r.prediction === 1 && r.outcome === 0).length;
    const fn = results.filter(r => r.prediction === 0 && r.outcome === 1).length;
    const tn = results.filter(r => r.prediction === 0 && r.outcome === 0).length;

    // Basic metrics
    const accuracy = ((tp + tn) / total) * 100;
    const sensitivity = (tp / (tp + fn)) * 100 || 0;
    const specificity = (tn / (tn + fp)) * 100 || 0;
    const precision = (tp / (tp + fp)) * 100 || 0;

    // Advanced metrics
    const f1Score = (2 * tp) / (2 * tp + fp + fn) * 100 || 0;
    const npv = (tn / (tn + fn)) * 100 || 0; // Negative Predictive Value
    const ppv = precision; // Positive Predictive Value (same as precision)

    // Matthews Correlation Coefficient
    const mcc = ((tp * tn - fp * fn) / Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))) || 0;

    // Likelihood Ratios
    const lrPositive = sensitivity / (100 - specificity) || 0;
    const lrNegative = (100 - sensitivity) / specificity || 0;

    // Risk distribution
    const highRisk = results.filter(r => r.riskCategory === 'high').length;
    const mediumRisk = results.filter(r => r.riskCategory === 'medium').length;
    const lowRisk = results.filter(r => r.riskCategory === 'low').length;

    // Calculate ROC curve
    const rocData = calculateROCCurve(results);

    // Calculate calibration
    const calibrationData = calculateCalibration(results);

    // Priority patients (highest risk)
    const priorityPatients = [...results]
        .filter(r => r.riskCategory === 'high')
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 10);

    // Biomarker statistics by risk category
    const biomarkerStats = {};
    ['high', 'medium', 'low'].forEach(category => {
        const categoryPatients = results.filter(r => r.riskCategory === category);
        biomarkerStats[category] = {
            count: categoryPatients.length,
            avgBiomarker1: categoryPatients.reduce((sum, p) => sum + (p.biomarker1 || 0), 0) / categoryPatients.length || 0,
            avgBiomarker2: categoryPatients.reduce((sum, p) => sum + (p.biomarker2 || 0), 0) / categoryPatients.length || 0,
            avgBiomarker3: categoryPatients.reduce((sum, p) => sum + (p.biomarker3 || 0), 0) / categoryPatients.length || 0,
            avgAge: categoryPatients.reduce((sum, p) => sum + (p.age || 0), 0) / categoryPatients.length || 0
        };
    });

    return {
        // Basic metrics
        accuracy,
        sensitivity,
        specificity,
        precision,
        totalCount: total,
        correctCount: tp + tn,

        // Advanced metrics
        f1Score,
        mcc,
        ppv,
        npv,
        lrPositive,
        lrNegative,

        // Confusion matrix
        confusionMatrix: { tp, fp, fn, tn },

        // Risk distribution
        high_risk: highRisk,
        medium_risk: mediumRisk,
        low_risk: lowRisk,

        // Feature importance
        featureImportance,

        // Data quality
        dataQuality,

        // ROC and calibration
        rocCurve: rocData.points,
        auc: rocData.auc,
        calibration: calibrationData,

        // Patient-level data
        results,
        priorityPatients,

        // Biomarker statistics
        biomarkerStats,

        // Metadata
        timestamp: new Date().toISOString(),
        modelVersion: '1.0.0'
    };
};

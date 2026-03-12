import Papa from 'papaparse';

export const validateCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                const { data, meta } = results;
                const errors = [];
                const warnings = [];
                const requiredColumns = ['age', 'biomarker1', 'biomarker2', 'biomarker3', 'outcome'];

                // 1. Check Missing Columns
                const missingColumns = requiredColumns.filter(col => !meta.fields.includes(col));
                if (missingColumns.length > 0) {
                    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
                }

                // 2. Check Row Count
                if (data.length < 10) {
                    errors.push(`Not enough data. Found ${data.length} rows, but minimum 10 are required.`);
                } else if (data.length < 50) {
                    warnings.push(`Small sample size (${data.length} rows). Accuracy may be improved with 50+ records.`);
                }

                // 3. Check Data Types & Empty Values
                const len = data.length;
                let typeErrors = 0;
                let emptyRows = 0;
                const sampleSize = Math.min(len, 20000); // Only deep-validate 20k rows for performance

                for (let i = 0; i < len; i++) {
                    const row = data[i];
                    if (!row || Object.keys(row).length === 0) {
                        emptyRows++;
                        continue;
                    }

                    // Deep validate only a sample to keep UI responsive
                    if (i < sampleSize) {
                        for (const col of requiredColumns) {
                            const val = row[col];
                            if (val === undefined || val === null || val === '') {
                                if (typeErrors < 5) warnings.push(`Row ${i + 1}: Missing value in column '${col}' (Row will be skipped)`);
                                typeErrors++;
                            } else if (typeof val !== 'number' && col !== 'outcome') {
                                if (typeErrors < 5) warnings.push(`Row ${i + 1}: Column '${col}' must be a number (Row will be skipped)`);
                                typeErrors++;
                            }
                        }
                    }
                }

                if (typeErrors > 5) {
                    warnings.push(`... and ${typeErrors - 5} more filtered row anomalies detected in sample.`);
                }

                if (typeErrors > 0) {
                    warnings.unshift(`Note: Based on a 20k record sample, ~${((typeErrors / (sampleSize * requiredColumns.length)) * 100).toFixed(1)}% of data contains anomalies and will be skipped.`);
                }

                resolve({
                    isValid: errors.length === 0,
                    errors,
                    warnings,
                    rowCount: data.length - emptyRows,
                    columnCount: meta.fields.length,
                    fileName: file.name,
                    filePath: file.path, // Preserve Electron file path
                    data: data.filter(row => !Object.values(row).every(val => val === null || val === ''))
                });
            },
            error: (error) => reject(error)
        });
    });
};

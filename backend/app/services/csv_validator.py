"""
CSV Validator Service for Hospital Testing Feature

Validates CSV files uploaded by hospitals to ensure they meet
the required format for FEDRAL.AI predictions.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


class ValidationResult(BaseModel):
    """Result of CSV validation"""
    valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    row_count: Optional[int] = None
    column_count: Optional[int] = None


class CSVValidator:
    """Validates CSV files for hospital testing"""
    
    # Required columns for predictions
    REQUIRED_COLUMNS = [
        'age',
        'biomarker1',
        'biomarker2',
        'biomarker3',
        'outcome'
    ]
    
    # Optional columns
    OPTIONAL_COLUMNS = [
        'patient_id',
        'admission_date',
        'gender'
    ]
    
    # Data type validations
    NUMERIC_COLUMNS = ['age', 'biomarker1', 'biomarker2', 'biomarker3']
    CATEGORICAL_COLUMNS = ['outcome', 'gender']
    
    @staticmethod
    def validate_metadata(columns: List[str], row_count: int) -> ValidationResult:
        """
        Validate CSV metadata without uploading the actual file
        
        Args:
            columns: List of column names from the CSV
            row_count: Number of rows in the CSV
            
        Returns:
            ValidationResult with validation status and messages
        """
        result = ValidationResult(valid=True, row_count=row_count, column_count=len(columns))
        
        # Check for required columns
        missing_columns = set(CSVValidator.REQUIRED_COLUMNS) - set(columns)
        if missing_columns:
            result.valid = False
            result.errors.append(
                f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Check for extra columns (warnings only)
        extra_columns = set(columns) - set(CSVValidator.REQUIRED_COLUMNS + CSVValidator.OPTIONAL_COLUMNS)
        if extra_columns:
            result.warnings.append(
                f"Extra columns will be ignored: {', '.join(extra_columns)}"
            )
        
        # Check row count
        if row_count < 10:
            result.valid = False
            result.errors.append(
                "CSV must contain at least 10 rows for meaningful predictions"
            )
        elif row_count < 50:
            result.warnings.append(
                "Small dataset detected. Results may be less reliable with fewer than 50 samples."
            )
        
        if row_count > 100000:
            result.warnings.append(
                "Large dataset detected. Processing may take longer."
            )
        
        return result
    
    @staticmethod
    def validate_column_types(sample_data: Dict[str, List]) -> ValidationResult:
        """
        Validate data types of columns using sample data
        
        Args:
            sample_data: Dictionary with column names as keys and sample values as lists
            
        Returns:
            ValidationResult with validation status
        """
        result = ValidationResult(valid=True)
        
        # Check numeric columns
        for col in CSVValidator.NUMERIC_COLUMNS:
            if col in sample_data:
                try:
                    # Try to convert to float
                    [float(x) for x in sample_data[col] if x is not None and x != '']
                except (ValueError, TypeError):
                    result.valid = False
                    result.errors.append(
                        f"Column '{col}' must contain numeric values only"
                    )
        
        # Check categorical columns
        for col in CSVValidator.CATEGORICAL_COLUMNS:
            if col in sample_data:
                unique_values = set(sample_data[col])
                if col == 'outcome':
                    # Outcome should be binary (0/1 or Yes/No)
                    valid_values = {'0', '1', 'yes', 'no', 'Yes', 'No', 'YES', 'NO'}
                    if not unique_values.issubset(valid_values):
                        result.valid = False
                        result.errors.append(
                            f"Column 'outcome' must contain only binary values (0/1 or Yes/No)"
                        )
        
        return result
    
    @staticmethod
    def get_format_example() -> Dict:
        """
        Returns an example of the correct CSV format
        
        Returns:
            Dictionary with example data
        """
        return {
            "example": {
                "age": [65, 72, 58, 45, 80],
                "biomarker1": [120.5, 135.2, 98.7, 110.3, 145.8],
                "biomarker2": [2.3, 3.1, 1.8, 2.5, 3.5],
                "biomarker3": [0.8, 1.2, 0.6, 0.9, 1.4],
                "outcome": [0, 1, 0, 0, 1]
            },
            "description": {
                "age": "Patient age in years (numeric)",
                "biomarker1": "First biomarker value (numeric)",
                "biomarker2": "Second biomarker value (numeric)",
                "biomarker3": "Third biomarker value (numeric)",
                "outcome": "Disease outcome (0 = negative, 1 = positive)"
            }
        }

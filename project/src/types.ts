export interface CellType {
  cell_type: string;
  count: number;
  percentage: number;
  confidence: number;
}

export interface PatientDetails {
  name: string;
  age: string;
  mobileNumber: string;
  address: string;
  emergencyContact: string;
}

export interface AnalysisResult {
  id: string;
  patient_id: string;
  timestamp: string;
  image_path: string;
  patient_details?: PatientDetails;
  dominant_type: string;
  dominant_confidence: number;
  total_count: number;
  cell_types: CellType[];
  results: {
    cell_types: CellType[];
    total_count: number;
    model_version: string;
    processing_time: number;
  };
}

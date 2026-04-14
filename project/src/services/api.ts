import { AnalysisResult } from '../types';

// ─── Simulated offline AI analysis ──────────────────────────────────────────

const WBC_TYPES = [
  {
    cell_type: 'Neutrophil',
    normalRange: { min: 40, max: 60 },
    description:
      'Neutrophils are the most abundant white blood cells that form an essential part of the innate immune system. They are the first responders to infection and are critical for fighting bacterial and fungal infections.',
  },
  {
    cell_type: 'Lymphocyte',
    normalRange: { min: 20, max: 40 },
    description:
      'Lymphocytes are key cells of the adaptive immune system. B lymphocytes produce antibodies, while T lymphocytes coordinate immune responses and directly kill infected cells.',
  },
  {
    cell_type: 'Monocyte',
    normalRange: { min: 2, max: 8 },
    description:
      'Monocytes are large white blood cells that differentiate into macrophages and dendritic cells. They remove dead cells, debris, and microorganisms through phagocytosis.',
  },
  {
    cell_type: 'Eosinophil',
    normalRange: { min: 1, max: 4 },
    description:
      'Eosinophils play a crucial role in combating parasitic infections and are involved in allergic responses and asthma. Elevated counts may indicate parasitic infections or allergic conditions.',
  },
  {
    cell_type: 'Basophil',
    normalRange: { min: 0.5, max: 1 },
    description:
      'Basophils are the rarest white blood cells. They release histamine and other chemicals during allergic reactions and are involved in inflammatory responses.',
  },
];

const NORMAL_COUNTS = [120, 60, 15, 10, 3]; // approximate typical counts

function createSeededRandom(seed: number) {
  let t = seed >>> 0;
  if (t === 0) t = 1;

  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

async function getFileSeed(file: File): Promise<number> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let hash = 2166136261;
  const step = Math.max(1, Math.floor(bytes.length / 4096));

  for (let i = 0; i < bytes.length; i += step) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 16777619);
  }

  hash ^= bytes.length;
  return (hash >>> 0) || 1;
}

function randomInRange(min: number, max: number, rnd: () => number) {
  return +(rnd() * (max - min) + min).toFixed(1);
}

function randomConfidence(base: number, rnd: () => number) {
  const delta = randomInRange(-0.06, 0.06, rnd);
  return Math.min(0.99, Math.max(0.72, base + delta));
}

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  // Simulate network / model processing latency
  await new Promise(r => setTimeout(r, 3200));

  // Deterministic seed so identical images produce identical demo results
  const seed = await getFileSeed(file);
  const rnd = createSeededRandom(seed);

  // Pick dominant WBC (weighted – neutrophil most common)
  const weights = [0.45, 0.30, 0.12, 0.08, 0.05];
  const rand = rnd();
  let cumulative = 0;
  let dominantIdx = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) { dominantIdx = i; break; }
  }

  // Build counts – vary counts realistically
  const totalCount = Math.floor(randomInRange(180, 220, rnd));
  const rawCounts = NORMAL_COUNTS.map((base, i) => {
    if (i === dominantIdx) return Math.floor(base * randomInRange(0.9, 1.3, rnd));
    return Math.floor(base * randomInRange(0.6, 1.4, rnd));
  });
  const rawSum = rawCounts.reduce((a, b) => a + b, 0);

  const cell_types = WBC_TYPES.map((wbc, i) => {
    const count = rawCounts[i];
    const percentage = +((count / rawSum) * 100).toFixed(2);
    const confidence = randomConfidence(0.88 - i * 0.04, rnd);
    return { cell_type: wbc.cell_type, count, percentage, confidence };
  });

  const processingTime = +(randomInRange(1.2, 2.8, rnd)).toFixed(2);

  const patient_id = `WBC-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  return {
    id: `${patient_id}-${Date.now()}`,
    patient_id,
    timestamp,
    image_path: '',
    dominant_type: WBC_TYPES[dominantIdx].cell_type,
    dominant_confidence: cell_types[dominantIdx].confidence,
    total_count: totalCount,
    cell_types,
    results: {
      cell_types,
      total_count: totalCount,
      model_version: 'CNN-v2.4',
      processing_time: processingTime,
    },
  };
};

export const generateReport = async (analysisData: AnalysisResult): Promise<Blob> => {
  // PDF is generated on the client — handled in Results.tsx via jsPDF
  // This function is kept for type compatibility
  return new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
};

export { WBC_TYPES };

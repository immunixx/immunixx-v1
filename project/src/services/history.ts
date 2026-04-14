import { AnalysisResult } from '../types';

const STORAGE_KEY = 'wbc_analyzer_history';

export const historyService = {
  getHistory: (): AnalysisResult[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveResult: (result: AnalysisResult) => {
    const history = historyService.getHistory();
    // Check if it already exists (prevent duplicates)
    if (!history.find(item => item.id === result.id)) {
      history.unshift(result); // Add to the beginning
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  },

  deleteResult: (id: string) => {
    const history = historyService.getHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

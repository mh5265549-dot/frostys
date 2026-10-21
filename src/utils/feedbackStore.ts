import { Review } from '../types';
import { REVIEWS as INITIAL_REVIEWS } from '../data/menuData';

const FEEDBACK_STORAGE_KEY = 'frostys_customer_feedback_v3';

export function getStoredFeedback(): Review[] {
  try {
    // Clear out any old legacy reviews from earlier localStorage versions
    localStorage.removeItem('frostys_customer_feedback_v2');
    localStorage.removeItem('frostys_customer_feedback');
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse stored feedback:', err);
    return [];
  }
}

export function clearAllFeedback(): void {
  try {
    localStorage.removeItem('frostys_customer_feedback_v2');
    localStorage.removeItem('frostys_customer_feedback');
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear feedback:', err);
  }
}

export function saveFeedback(newFeedback: Omit<Review, 'id' | 'date'> & { date?: string }): Review[] {
  const currentList = getStoredFeedback();
  
  const formattedDate = newFeedback.date || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const fullRecord: Review = {
    id: `fb-${Date.now()}`,
    name: newFeedback.name.trim() || 'Happy Customer',
    rating: Math.max(1, Math.min(5, newFeedback.rating)),
    comment: newFeedback.comment.trim(),
    date: formattedDate,
    favItem: newFeedback.favItem?.trim() || 'Ice Cream & Desserts',
    tag: newFeedback.tag?.trim() || 'Verified Customer',
  };

  const updatedList = [fullRecord, ...currentList];
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save feedback to localStorage:', err);
  }

  return updatedList;
}

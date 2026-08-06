import { Review } from '../types';
import { REVIEWS as INITIAL_REVIEWS } from '../data/menuData';

const FEEDBACK_STORAGE_KEY = 'frostys_customer_feedback_v2';

export function getStoredFeedback(): Review[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REVIEWS;
  } catch (err) {
    console.error('Failed to parse stored feedback:', err);
    return INITIAL_REVIEWS;
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

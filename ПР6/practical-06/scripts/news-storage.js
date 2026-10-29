import { news as initialNews } from "./data.js";
import { validateNews } from "./news-service.js";

const STORAGE_KEY = "bfkpep-news-v1";

export function loadNews() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) 
      return initialNews.map((item) => ({ ...item }));

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) 
      return initialNews.map((item) => ({ ...item }));
    
    const ids = parsed.map((item) => item?.id);
    if (new Set(ids).size !== parsed.length ||
        !parsed.every((item) => Number.isInteger(item?.id) && validateNews(item).isValid)) {
      return initialNews.map((item) => ({ ...item }));
    }
    return parsed;
  } catch {
    return initialNews.map((item) => ({ ...item }));
  }
}

export function saveNews(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

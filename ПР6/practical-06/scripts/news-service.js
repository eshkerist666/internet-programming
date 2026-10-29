const CATEGORIES = new Set(["оголошення", "подія", "навчання"]);

export function normalizeTitle(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function normalizeCategory(value) {
  return typeof value === "string" ? value.trim().toLocaleLowerCase("uk-UA") : "";
}

export function validateNews(input) {
  const errors = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { isValid: false, errors: { input: "Очікується об’єкт новини." } };
  }
  const title = normalizeTitle(input.title);

  if (title.length < 3 || title.length > 80) 
    errors.title = "Назва має містити від 3 до 80 символів.";

  if (typeof input.text !== "string" || input.text.trim().length < 10 || input.text.trim().length > 1000) {
    errors.text = "Текст має містити від 10 до 1000 символів.";
  }

  if (!CATEGORIES.has(normalizeCategory(input.category))) 
    errors.category = "Оберіть одну з категорій: оголошення, подія, навчання.";

  if (typeof input.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(`${input.date}T00:00:00Z`)) || new Date(`${input.date}T00:00:00Z`).toISOString().slice(0, 10) !== input.date) {
    errors.date = "Дата має бути коректною датою у форматі РРРР-ММ-ДД.";
  }

  if (!Number.isInteger(input.priority) || input.priority < 1 || input.priority > 5) 
    errors.priority = "Пріоритет має бути цілим числом від 1 до 5.";

  if (typeof input.isVisible !== "boolean") 
    errors.isVisible = "Видимість має бути логічним значенням.";

  if (typeof input.isPinned !== "boolean") 
    errors.isPinned = "Закріплення має бути логічним значенням.";
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function createNews(input, id) {
  const normalized = { ...input, id, title: normalizeTitle(input?.title), category: normalizeCategory(input?.category) };
  const result = validateNews(normalized);
  if (!Number.isInteger(id) || id < 1) 
    result.errors.id = "ID має бути додатним цілим числом.";

  if (Object.keys(result.errors).length) 
    throw new TypeError(`Некоректна новина: ${Object.values(result.errors).join(" ")}`);
  return normalized;
}

export const findNewsById = (items, id) => items.find((item) => item.id === id);
export const filterByCategory = (items, category) => items.filter((item) => item.category === normalizeCategory(category));
export const searchNews = (items, query) => {
  const normalizedQuery = typeof query === "string" ? query.trim().toLocaleLowerCase("uk-UA") : "";
  return items.filter((item) => `${item.title} ${item.text}`.toLocaleLowerCase("uk-UA").includes(normalizedQuery));
};
export const filterNews = (items, { category, isVisible } = {}) => items.filter((item) =>
  (category === undefined || item.category === normalizeCategory(category)) &&
  (isVisible === undefined || item.isVisible === isVisible));
export const hasVisiblePinnedNews = (items) => items.some((item) => item.isVisible && item.isPinned);

export const toNewsCards = (items) => items.map(({ id, title, category, date, priority, isPinned }) => ({ id, title, category, date, priority, isPinned }));
export const toNewsLabels = (items) => items.map((item) => `${item.title} — ${item.category}, ${item.date}`);

export const summarizeNews = (items) => items.reduce((summary, item) => {
  summary.count += 1;
  summary.byCategory[item.category] = (summary.byCategory[item.category] ?? 0) + 1;
  summary.visibleCount += Number(item.isVisible);
  summary.priorityTotal += item.priority;
  return summary;
}, { count: 0, byCategory: {}, visibleCount: 0, priorityTotal: 0 });

export const averagePriority = (items) => items.length ? summarizeNews(items).priorityTotal / items.length : 0;
export const sortByTitle = (items) => [...items].sort((a, b) => a.title.localeCompare(b.title, "uk"));
export const sortByDate = (items) => [...items].sort((a, b) => a.date.localeCompare(b.date));

export function addNews(items, newItem) {
  if (items.some((item) => item.id === newItem.id)) throw new Error(`Новина з ID ${newItem.id} вже існує.`);
  const result = validateNews(newItem);
  if (!result.isValid || !Number.isInteger(newItem.id) || newItem.id < 1) throw new TypeError("Не можна додати некоректну новину.");
  return [...items, { ...newItem }];
}

export function updateNews(items, itemId, changes) {
  const index = items.findIndex((item) => item.id === itemId);

  if (index === -1) 
    return items;

  const updated = { ...items[index], ...changes, id: items[index].id };
  updated.title = normalizeTitle(updated.title);
  updated.category = normalizeCategory(updated.category);
  const result = validateNews(updated);

  if (!result.isValid) 
    throw new TypeError("Не можна зберегти некоректну новину.");

  return items.map((item, currentIndex) => currentIndex === index ? updated : item);
}

export const removeNews = (items, itemId) => items.filter((item) => item.id !== itemId);

import { filterNews, removeNews, searchNews, sortByDate, sortByTitle, summarizeNews, toNewsCards } from "./news-service.js";
import { loadNews, saveNews } from "./news-storage.js";

const list = document.querySelector("#news-list");
const empty = document.querySelector("#news-empty");
const summary = document.querySelector("#news-summary");
const searchInput = document.querySelector("#news-search");
const categoryFilter = document.querySelector("#news-category-filter");
const visibilityFilter = document.querySelector("#news-visibility-filter");
const sortSelect = document.querySelector("#news-sort");
let items = loadNews();

function render() {
  const criteria = { category: categoryFilter.value || undefined };
  
  if (visibilityFilter.value !== "") 
    criteria.isVisible = visibilityFilter.value === "true";

  let shown = filterNews(searchNews(items, searchInput.value), criteria);
  shown = sortSelect.value === "title" ? sortByTitle(shown) : sortByDate(shown).reverse();
  const cards = toNewsCards(shown);
  list.replaceChildren();

  for (const item of cards) {
    const record = shown.find((entry) => entry.id === item.id);

    const article = document.createElement("article");
    article.className = "news-card";
    const title = document.createElement("h3");
    title.textContent = item.title;
    const text = document.createElement("p");
    text.textContent = record.text;
    const meta = document.createElement("p");
    meta.className = "news-meta";
    meta.textContent = `${item.category} · ${item.date} · Пріоритет ${item.priority}${item.isPinned ? " · Закріплено" : ""}${record.isVisible ? "" : " · Приховано"}`;
    const actions = document.createElement("div");
    actions.className = "news-actions";
    const editLink = document.createElement("a");
    editLink.href = `news-form.html?id=${encodeURIComponent(item.id)}`;
    editLink.textContent = "Редагувати";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.dataset.deleteId = String(item.id);
    removeButton.textContent = "Видалити";
    actions.append(editLink, removeButton);
    article.append(title, text, meta, actions);
    list.append(article);
  }

  empty.hidden = shown.length !== 0;
  const totals = summarizeNews(items);
  summary.textContent = `Показано ${shown.length} з ${totals.count} новин`;
}

for (const control of [searchInput, categoryFilter, visibilityFilter, sortSelect]) control.addEventListener("input", render);
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-delete-id]");
  if (!button) return;
  const id = Number(button.dataset.deleteId);
  const target = items.find((item) => item.id === id);
  if (!target || !window.confirm(`Видалити новину «${target.title}»?`)) return;
  items = removeNews(items, id);
  saveNews(items);
  render();
});
render();

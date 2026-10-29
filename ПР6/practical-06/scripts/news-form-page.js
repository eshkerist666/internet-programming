import { addNews, createNews, updateNews, validateNews } from "./news-service.js";
import { loadNews, saveNews } from "./news-storage.js";

const form = document.querySelector("#news-form");
const message = document.querySelector("#news-form-message");
const idParam = new URLSearchParams(window.location.search).get("id");
const editingId = idParam === null ? null : Number(idParam);
let items = loadNews();
const editingItem = editingId === null ? null : items.find((item) => item.id === editingId);

if (editingId !== null && !editingItem) {
  message.textContent = "Новину не знайдено. Поверніться до списку новин.";
  form.querySelector("button[type=submit]").disabled = true;
} else if (editingItem) {
  document.querySelector("h2").textContent = "Редагувати новину";
  document.querySelector("#form-intro").textContent = `Редагування новини №${editingItem.id}.`;
  document.querySelector("#news-submit").textContent = "Зберегти зміни";
  form.elements.title.value = editingItem.title;
  form.elements.text.value = editingItem.text;
  form.elements.category.value = editingItem.category;
  form.elements.date.value = editingItem.date;
  form.elements.priority.value = editingItem.priority;
  form.elements.isVisible.checked = editingItem.isVisible;
  form.elements.isPinned.checked = editingItem.isPinned;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = {
    title: form.elements.title.value,
    text: form.elements.text.value,
    category: form.elements.category.value,
    date: form.elements.date.value,
    priority: Number(form.elements.priority.value),
    isVisible: form.elements.isVisible.checked,
    isPinned: form.elements.isPinned.checked,
  };
  const validation = validateNews(input);
  if (!validation.isValid) {
    message.textContent = Object.values(validation.errors).join(" ");
    return;
  }

  try {
    if (editingItem) {
      items = updateNews(items, editingItem.id, input);
    } else {
      const nextId = items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
      items = addNews(items, createNews(input, nextId));
    }
    saveNews(items);
    window.location.href = "index.html#news";
  } catch (error) {
    message.textContent = error.message || "Не вдалося зберегти новину.";
  }
});

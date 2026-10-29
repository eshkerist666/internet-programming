import assert from "node:assert/strict";
import { news } from "./data.js";
import { addNews, averagePriority, createNews, filterByCategory, filterNews, findNewsById, hasVisiblePinnedNews, normalizeCategory, normalizeTitle, removeNews, searchNews, sortByDate, sortByTitle, summarizeNews, toNewsCards, toNewsLabels, updateNews, validateNews } from "./news-service.js";

const checks = [];
function check(name, fn) {
  try { fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, error }); }
}

const draft = { title: "  Тестова   новина ", text: "Достатньо довгий текст новини для перевірки.", category: " Подія ", date: "2026-11-01", priority: 3, isVisible: true, isPinned: false };
check("набір містить щонайменше 8 записів з унікальними ID", () => { assert.ok(news.length >= 8); assert.equal(new Set(news.map((item) => item.id)).size, news.length); });
check("нормалізація назви прибирає зайві пробіли", () => assert.equal(normalizeTitle(draft.title), "Тестова новина"));
check("нормалізація категорії враховує регістр", () => assert.equal(normalizeCategory(draft.category), "подія"));
check("валідний запис проходить перевірку", () => assert.equal(validateNews(createNews(draft, 100)).isValid, true));
check("коротка назва відхиляється", () => assert.ok(validateNews({ ...draft, title: "x" }).errors.title));
check("невідома категорія відхиляється", () => assert.ok(validateNews({ ...draft, category: "інше" }).errors.category));
check("неможлива календарна дата відхиляється", () => assert.ok(validateNews({ ...draft, date: "2026-02-31" }).errors.date));
check("пріоритет поза діапазоном відхиляється", () => assert.ok(validateNews({ ...draft, priority: 6 }).errors.priority));
check("пошук за ID повертає запис або undefined", () => { assert.equal(findNewsById(news, 1), news[0]); assert.equal(findNewsById(news, -1), undefined); });
check("фільтр категорії повертає лише відповідні новини", () => assert.ok(filterByCategory(news, "подія").every((item) => item.category === "подія")));
check("текстовий пошук не залежить від регістру", () => assert.ok(searchNews(news, "РОЗКЛАД").some((item) => item.id === 3)));
check("комбінований фільтр застосовує категорію та видимість", () => assert.ok(filterNews(news, { category: "навчання", isVisible: true }).every((item) => item.category === "навчання" && item.isVisible)));
check("перевірка закріпленої видимої новини", () => assert.equal(hasVisiblePinnedNews(news), true));
check("map створює короткі картки та labels", () => { assert.equal(toNewsCards(news)[0].text, undefined); assert.equal(toNewsLabels(news).length, news.length); });
check("reduce підсумовує категорії, а порожня середня дорівнює нулю", () => { assert.equal(summarizeNews(news).count, news.length); assert.equal(averagePriority([]), 0); });
check("обидва сортування не мутують початковий масив", () => { const original = [...news]; sortByTitle(news); sortByDate(news); assert.deepEqual(news, original); });
check("додавання повертає новий масив і відхиляє дубль ID", () => { const item = createNews(draft, 101); assert.notEqual(addNews(news, item), news); assert.throws(() => addNews(news, { ...item, id: news[0].id })); });
check("оновлення не дозволяє змінити ID; відсутній ID повертає початковий масив", () => { const updated = updateNews(news, 1, { id: 500, title: " Нова назва " }); assert.equal(updated[0].id, 1); assert.equal(updated[0].title, "Нова назва"); assert.equal(updateNews(news, -1, {}), news); });
check("видалення повертає новий масив і відсутній ID не змінює записи", () => { const removed = removeNews(news, 1); assert.notEqual(removed, news); assert.equal(removed.length, news.length - 1); assert.equal(removeNews(news, -1).length, news.length); });

console.log("Звіт self-checks для сервісу новин");
for (const { name, passed, error } of checks) console.log(`${passed ? "✓" : "✗"} ${name}${error ? ` — ${error.message}` : ""}`);
console.log(`Підсумок: ${checks.filter((item) => item.passed).length}/${checks.length} перевірок пройдено.`);
const demoSummary = summarizeNews(news);
console.log("\nДемонстраційний звіт по новинах");
console.log(`Усього: ${demoSummary.count}; видимих: ${demoSummary.visibleCount}; середній пріоритет: ${averagePriority(news).toFixed(2)}.`);
console.log(`За категоріями: ${Object.entries(demoSummary.byCategory).map(([category, count]) => `${category} — ${count}`).join(", ")}.`);
console.log(`Є видима закріплена новина: ${hasVisiblePinnedNews(news) ? "так" : "ні"}.`);
console.log("Приклад картки:", toNewsCards(news)[0]);
if (checks.some((item) => !item.passed)) process.exitCode = 1;

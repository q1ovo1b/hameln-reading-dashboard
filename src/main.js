"use strict";

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Chart.js — Global defaults
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function configureChartDefaults() {
  if (typeof window.Chart !== "function") return;
  Chart.defaults.font.family = "'Helvetica Neue','Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',Arial,sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#6d6d68";
  Chart.defaults.borderColor = "#d5d5ce";
  Chart.defaults.plugins.tooltip.backgroundColor = "#141414";
  Chart.defaults.plugins.tooltip.titleFont = { weight: "bold", size: 11 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 13 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 0;
  Chart.defaults.plugins.tooltip.displayColors = false;
  Chart.defaults.scales.x.grid = { color: "transparent" };
  Chart.defaults.scales.y.grid = { color: "#ededE8" };
  Chart.defaults.scales.x.ticks = { color: "#6d6d68" };
  Chart.defaults.scales.y.ticks = { color: "#6d6d68" };
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  State & Utilities
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

const state = { months: [], charts: [], visible: { monthly: 12, title: 20, titleRecord: 20, original: 20, originalRecord: 20 } };
const $ = (id) => document.getElementById(id);
const nf = new Intl.NumberFormat("ja-JP");
const collator = new Intl.Collator("ja", { sensitivity: "base" });
const num = (value) => Number(value) || 0;
const chars = (value) => `${nf.format(Math.round(num(value)))} 字`;
const period = (entry) => `${entry.year}-${String(entry.month).padStart(2, "0")}`;
const normaliseQuery = (value) => value.trim().toLocaleLowerCase();
const escapeHtml = (value) => { const node = document.createElement("span"); node.textContent = value || ""; return node.innerHTML; };
const isEmptyMonth = (entry) => !num(entry.monthly?.works) && !num(entry.monthly?.episodes) && !num(entry.monthly?.chars);
const cards = (target, values) => { $(target).innerHTML = values.map(([label, value]) => `<dl class="summary-card"><dt>${label}</dt><dd>${value}</dd></dl>`).join(""); };

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Data helpers
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function monthsForDetails() {
  const year = $("year-filter").value; const month = $("month-filter").value; const showEmpty = $("show-empty-months").checked;
  return state.months.filter((entry) => (!year || String(entry.year) === year) && (!month || String(entry.month) === month) && (showEmpty || !isEmptyMonth(entry)));
}
function monthsForTrend() {
  const year = $("year-filter").value; const showEmpty = $("show-empty-months").checked;
  return state.months.filter((entry) => (!year || String(entry.year) === year) && (showEmpty || !isEmptyMonth(entry)));
}
function latestMonth(entries) { return [...entries].sort((a, b) => period(b).localeCompare(period(a)))[0] || null; }
function sum(entries, key) { return entries.reduce((total, entry) => total + num(entry.monthly?.[key]), 0); }
function annualData() {
  const byYear = new Map();
  state.months.filter((entry) => !isEmptyMonth(entry)).forEach((entry) => { const item = byYear.get(entry.year) || { year: entry.year, months: [], works: 0, episodes: 0, chars: 0 }; item.months.push(entry); item.works += num(entry.monthly?.works); item.episodes += num(entry.monthly?.episodes); item.chars += num(entry.monthly?.chars); byYear.set(entry.year, item); });
  return [...byYear.values()].sort((a, b) => a.year - b.year).map((item) => { const maxMonth = [...item.months].sort((a, b) => num(b.monthly?.chars) - num(a.monthly?.chars))[0]; return { ...item, books: item.chars / 100000, averageChars: Math.round(item.chars / item.months.length), maxMonth, maxMonthChars: num(maxMonth?.monthly?.chars) }; });
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Rendering
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function renderAllSummary() {
  const entries = state.months.filter((entry) => !isEmptyMonth(entry)); const total = sum(entries, "chars"); const max = [...entries].sort((a, b) => num(b.monthly?.chars) - num(a.monthly?.chars))[0];
  cards("all-summary-cards", [["総読書文字数", chars(total)], ["推定文庫本冊数", `${(total / 100000).toFixed(1)} 冊`], ["読み込み月数", `${state.months.length} か月`], ["読書記録のある月", `${entries.length} か月`], ["最も読んだ月", max ? period(max) : "—"], ["最大月の文字数", chars(max?.monthly?.chars)]]);
  revealCards("all-summary-cards");
}
function renderYearSummary() {
  const annual = annualData(); const selectedYear = $("year-filter").value; const item = annual.find((entry) => String(entry.year) === selectedYear);
  cards("year-summary-cards", item ? [["年間作品数", `${nf.format(item.works)} 作`], ["年間話数", `${nf.format(item.episodes)} 話`], ["年間文字数", chars(item.chars)], ["推定文庫本冊数", `${item.books.toFixed(1)} 冊`], ["月平均文字数", chars(item.averageChars)], ["最大読書月", period(item.maxMonth)], ["最大月の文字数", chars(item.maxMonthChars)]] : [["対象年", "すべて"], ["年間数", `${annual.length} 年`], ["総文字数", chars(sum(state.months, "chars"))]]);
  $("yearly-table").innerHTML = annual.map((entry) => `<tr><td>${entry.year}年</td><td>${nf.format(entry.works)}</td><td>${nf.format(entry.episodes)}</td><td class="numeric">${chars(entry.chars)}</td><td class="numeric">${entry.books.toFixed(1)} 冊</td><td class="numeric">${chars(entry.averageChars)}</td><td>${period(entry.maxMonth)}（${chars(entry.maxMonthChars)}）</td></tr>`).join("");
}
function renderMonthly() {
  const entries = monthsForTrend().sort((a, b) => period(b).localeCompare(period(a))); $("month-result-count").textContent = `${entries.length} か月`;
  let runningTotal = 0; const chronological = [...entries].reverse().map((entry) => ({ ...entry, dashboardTotal: (runningTotal += num(entry.monthly?.chars)) })).reverse();
  const shown = chronological.slice(0, state.visible.monthly); $("monthly-table").innerHTML = shown.map((entry) => `<tr><td class="period-cell">${period(entry)}</td><td>${nf.format(num(entry.monthly?.works))}</td><td>${nf.format(num(entry.monthly?.episodes))}</td><td class="numeric">${chars(entry.monthly?.chars)}</td><td class="numeric">${chars(entry.dashboardTotal)}</td></tr>`).join("");
  $("monthly-list-count").textContent = `月別一覧：${chronological.length}か月中${shown.length}か月を表示`; const pagination = $("monthly-pagination"); pagination.hidden = chronological.length === 0; pagination.querySelector("[data-action='more']").hidden = shown.length >= chronological.length; pagination.querySelector("[data-action='all']").hidden = shown.length >= chronological.length; pagination.querySelector("[data-action='collapse']").hidden = state.visible.monthly <= 12;
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  List helpers
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function flatItems(kind) { return monthsForDetails().flatMap((month) => (month[kind] || []).map((item) => ({ ...item, year: month.year, month: month.month }))); }
function sortItems(items, sortId, nameField, aggregated = false) {
  const [key, direction] = $(sortId).value.split("-");
  return items.sort((a, b) => { const av = key === "period" ? period(a) : key === "name" ? a[nameField] : key === "first" ? a.firstMonth : key === "last" ? a.lastMonth : key === "months" ? a.monthCount : num(a.chars); const bv = key === "period" ? period(b) : key === "name" ? b[nameField] : key === "first" ? b.firstMonth : key === "last" ? b.lastMonth : key === "months" ? b.monthCount : num(b.chars); const result = typeof av === "number" ? av - bv : collator.compare(av, bv); return direction === "desc" ? -result : result; });
}
function recordItems(kind, queryId, sortId) { const query = normaliseQuery($(queryId).value); const nameField = kind === "titles" ? "title" : "name"; return sortItems(flatItems(kind).filter((item) => !query || item[nameField].toLocaleLowerCase().includes(query)), sortId, nameField); }
function aggregateItems(kind, queryId, sortId) {
  const nameField = kind === "titles" ? "title" : "name"; const groups = new Map();
  flatItems(kind).forEach((item) => { const key = kind === "titles" ? (item.url || item.title) : item.name; const current = groups.get(key) || { [nameField]: item[nameField], url: item.url || "", chars: 0, months: [] }; current.chars += num(item.chars); if (!current.months.includes(period(item))) current.months.push(period(item)); groups.set(key, current); });
  const query = normaliseQuery($(queryId).value); const result = [...groups.values()].map((item) => ({ ...item, months: item.months.sort(), monthCount: item.months.length, firstMonth: item.months[0], lastMonth: item.months.at(-1) })).filter((item) => item[nameField] !== "取得不可" && (!query || item[nameField].toLocaleLowerCase().includes(query)));
  return sortItems(result, sortId, nameField, true);
}
function link(label, url) { const safe = escapeHtml(label); return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${safe}</a>` : safe; }
function renderList(kind, items, tableId, countId, paginationId, aggregate) {
  const limit = state.visible[kind]; const shown = items.slice(0, limit); const field = kind.startsWith("title") ? "title" : "name"; const label = kind === "title" ? "作品別一覧" : kind === "original" ? "原作別一覧" : kind === "titleRecord" ? "月別作品記録" : "月別原作記録";
  if (aggregate) { const table = $(tableId).closest("table"); table.querySelector("thead tr").innerHTML = `<th>${field === "title" ? "作品名" : "原作名"}</th><th>合計文字数</th><th>最終読書月</th><th>詳細</th>`; $(tableId).innerHTML = shown.map((item, index) => `<tr><td>${link(item[field], item.url)}</td><td class="numeric">${chars(item.chars)}</td><td class="period-cell">${item.lastMonth}</td><td><button class="row-detail-button" type="button" data-detail="${kind}-${index}">詳細</button></td></tr><tr id="${kind}-${index}" class="row-detail" hidden><td colspan="4">読書月数：${item.monthCount}か月　初回読書月：${item.firstMonth}　最終読書月：${item.lastMonth}<br>読書月一覧：${item.months.join(", ")}</td></tr>`).join(""); } else { $(tableId).innerHTML = shown.map((item) => `<tr><td>${link(item[field], item.url)}</td><td class="numeric">${chars(item.chars)}</td><td class="period-cell">${period(item)}</td></tr>`).join(""); }
  $(countId).textContent = `${label}：${items.length}件中${shown.length}件を表示`;
  const pagination = $(paginationId); pagination.hidden = items.length === 0; pagination.querySelector("[data-action='more']").hidden = shown.length >= items.length; pagination.querySelector("[data-action='all']").hidden = shown.length >= items.length; pagination.querySelector("[data-action='collapse']").hidden = limit <= 20;
}
function renderLists() {
  const descriptions = [["#titles > .details-content", "同じ作品をまとめた累計読書量です。"], ["#titles .record-details > .details-content", "各月に読んだ作品を月ごとに表示します。"], ["#originals > .details-content", "同じ原作をまとめた累計読書量です。"], ["#originals .record-details > .details-content", "各月の原作別読書量を表示します。"]];
  descriptions.forEach(([selector, text]) => { const container = document.querySelector(selector); if (container && !container.querySelector(":scope > .list-description")) container.insertAdjacentHTML("afterbegin", `<p class="list-description">${text}</p>`); });
  const titles = aggregateItems("titles", "title-filter", "title-sort"); const titleRecords = recordItems("titles", "title-filter", "title-record-sort"); const originals = aggregateItems("originals", "original-filter", "original-sort"); const originalRecords = recordItems("originals", "original-filter", "original-record-sort");
  renderList("title", titles, "titles-table", "title-result-count", "title-pagination", true); renderList("titleRecord", titleRecords, "title-records-table", "title-record-result-count", "title-record-pagination", false); renderList("original", originals, "originals-table", "original-result-count", "original-pagination", true); renderList("originalRecord", originalRecords, "original-records-table", "original-record-result-count", "original-record-pagination", false);
  $("titles-empty").hidden = titles.length > 0; $("originals-empty").hidden = originals.length > 0;
}
function renderSelectedMonth() {
  const hasSelection = Boolean($("year-filter").value && $("month-filter").value); const entry = hasSelection ? latestMonth(monthsForDetails()) : null; const label = entry ? period(entry) : "選択月の詳細"; $("detail-title").textContent = `${label}${entry ? " の詳細" : ""}`; $("selected-month-content").hidden = !entry; $("selected-month-hint").hidden = Boolean(entry);
  if (!entry) return null;
  const daily = entry?.daily || []; const maxDay = [...daily].sort((a, b) => num(b.chars) - num(a.chars))[0]; const daysRead = daily.filter((day) => num(day.chars) > 0); const previous = entry ? state.months.find((month) => { const index = state.months.indexOf(entry); return state.months[index - 1] === month; }) : null; const diff = previous ? num(entry.monthly?.chars) - num(previous.monthly?.chars) : null;
  cards("selected-summary-cards", [["当月の文字数", chars(entry.monthly?.chars)], ["作品数", `${nf.format(num(entry.monthly?.works))} 作`], ["話数", `${nf.format(num(entry.monthly?.episodes))} 話`], ["1日平均文字数", chars(daysRead.length ? num(entry.monthly?.chars) / daysRead.length : 0)], ["読書した日数", `${daysRead.length} 日`], ["10万字以上の日", `${daily.filter((day) => num(day.chars) >= 100000).length} 日`], ["50万字以上の日", `${daily.filter((day) => num(day.chars) >= 500000).length} 日`], ["最も読んだ日", maxDay ? `${maxDay.date}\n${chars(maxDay.chars)}` : "—"], ["前月比", diff === null ? "—" : `${diff >= 0 ? "+" : ""}${chars(diff)}`]]);
  revealCards("selected-summary-cards");
  return entry;
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Charts
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function destroyCharts() { state.charts.forEach((chart) => chart.destroy()); state.charts = []; }
function createChart(id, labels, values, label, horizontal = false) { const axis = horizontal ? "x" : "y"; const instance = new Chart($(id), { type: "bar", data: { labels, datasets: [{ label, data: values, backgroundColor: "#d94e2bb8", borderColor: "#d94e2b", borderWidth: 1, borderRadius: 0 }] }, options: { indexAxis: horizontal ? "y" : "x", responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${label}: ${label.includes("文字") ? chars(context.parsed[axis]) : nf.format(context.parsed[axis])}` } } }, scales: horizontal ? { x: { beginAtZero: true } } : { y: { beginAtZero: true } } } }); state.charts.push(instance); }
function renderCharts(entry) {
  destroyCharts(); const notice = $("chart-status"); if (typeof window.Chart !== "function") { notice.hidden = false; notice.textContent = "グラフ用ライブラリを読み込めなかったため、グラフは表示できません。表と検索は引き続き利用できます。"; return; } notice.hidden = true;
  const annual = annualData(); const months = monthsForTrend().sort((a, b) => period(a).localeCompare(period(b)));
  createChart("yearly-chars-chart", annual.map((item) => `${item.year}年`), annual.map((item) => item.chars), "文字数"); createChart("yearly-works-chart", annual.map((item) => `${item.year}年`), annual.map((item) => item.works), "作品数"); createChart("yearly-episodes-chart", annual.map((item) => `${item.year}年`), annual.map((item) => item.episodes), "話数");
  createChart("monthly-chars-chart", months.map(period), months.map((item) => num(item.monthly?.chars)), "文字数"); createChart("monthly-works-chart", months.map(period), months.map((item) => num(item.monthly?.works)), "作品数"); createChart("monthly-episodes-chart", months.map(period), months.map((item) => num(item.monthly?.episodes)), "話数");
  const daily = [...(entry?.daily || [])].sort((a, b) => a.date.localeCompare(b.date)); const titles = [...(entry?.titles || [])].sort((a, b) => num(b.chars) - num(a.chars)).slice(0, 10); const originals = [...(entry?.originals || [])].sort((a, b) => num(b.chars) - num(a.chars)).slice(0, 10); const label = entry ? period(entry) : "選択月";
  $("daily-chart-title").textContent = `${label} の日別読書文字数`; $("title-chart-title").textContent = `${label} のタイトルランキング（上位10件）`; $("original-chart-title").textContent = `${label} の原作ランキング（上位10件）`;
  createChart("daily-chart", daily.map((item) => item.date.slice(5)), daily.map((item) => num(item.chars)), "文字数"); createChart("title-ranking-chart", titles.map((item) => item.title), titles.map((item) => num(item.chars)), "文字数", true); createChart("original-ranking-chart", originals.map((item) => item.name), originals.map((item) => num(item.chars)), "文字数", true);
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Render & Filters
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function render() { renderAllSummary(); renderYearSummary(); renderMonthly(); renderLists(); renderCharts(renderSelectedMonth()); }
function resetVisible() { state.visible.monthly = 12; state.visible.title = 20; state.visible.titleRecord = 20; state.visible.original = 20; state.visible.originalRecord = 20; }
function populateFilters() { const years = [...new Set(state.months.map((entry) => entry.year))].sort((a, b) => b - a); $("year-filter").insertAdjacentHTML("beforeend", years.map((year) => `<option value="${year}">${year}年</option>`).join("")); $("month-filter").insertAdjacentHTML("beforeend", Array.from({ length: 12 }, (_, index) => `<option value="${index + 1}">${index + 1}月</option>`).join("")); }

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Scroll Reveal
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function revealCards(gridId) {
  const grid = $(gridId);
  if (!grid) return;
  const cards = grid.querySelectorAll(".summary-card");
  cards.forEach((card, i) => {
    card.classList.add("reveal-card");
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add("revealed"), i * 60);
    });
  });
}

function setupScrollReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll("section, .section-details, .panel, .chart-panel").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Navigation — Scroll Spy
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function setupNavScrollSpy() {
  const nav = document.querySelector(".section-nav");
  const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
  if (!navLinks.length) return;

  // Add scrolled class (border) when page is scrolled
  const scrollObserver = new IntersectionObserver(
    ([entry]) => {
      nav.classList.toggle("scrolled", !entry.isIntersecting);
    },
    { threshold: 1 }
  );
  const sentinel = document.createElement("div");
  sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;pointer-events:none";
  document.body.prepend(sentinel);
  scrollObserver.observe(sentinel);

  // Active section tracking
  const sectionIds = navLinks.map((link) => link.getAttribute("href").replace("#", ""));
  const targets = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  const activeObserver = new IntersectionObserver(
    (entries) => {
      // Find the top-most visible section
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length) {
        const activeId = visible[0].target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href").replace("#", "");
          link.classList.toggle("active", href === activeId);
        });
      }
    },
    { threshold: 0, rootMargin: "-50% 0px -50% 0px" }
  );

  targets.forEach((el) => activeObserver.observe(el));
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Events
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function bindEvents() {
  document.querySelectorAll("select, input[type='search'], #show-empty-months").forEach((element) => element.addEventListener("input", () => { resetVisible(); render(); }));
  document.querySelectorAll(".pagination button").forEach((button) => button.addEventListener("click", () => { const list = button.dataset.list; const action = button.dataset.action; const increment = list === "monthly" ? 12 : 20; if (action === "more") state.visible[list] += increment; if (action === "all") state.visible[list] = Infinity; if (action === "collapse") state.visible[list] = increment; render(); }));
  document.addEventListener("click", (event) => { const button = event.target.closest(".row-detail-button"); if (!button) return; const row = $(button.dataset.detail); row.hidden = !row.hidden; button.textContent = row.hidden ? "詳細" : "閉じる"; });
  const topButton = $("back-to-top"); window.addEventListener("scroll", () => { topButton.classList.toggle("visible", window.scrollY > 500); }, { passive: true }); topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Init
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

async function init() {
  try { configureChartDefaults(); } catch (e) { /* non-essential */ }
  try {
    let data;
    try {
      const response = await fetch("data/reading_data.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
    } catch (fetchError) {
      // file:// で開くと fetch はブラウザに拒否されるため、同梱JSを利用する。
      if (Array.isArray(window.READING_DATA)) data = window.READING_DATA;
      else throw fetchError;
    }
    if (!Array.isArray(data)) throw new Error("JSONの最上位は配列である必要があります。");
    state.months = data.sort((a, b) => period(a).localeCompare(period(b)));
    populateFilters();
    bindEvents();
    render();
    try { setupScrollReveal(); } catch (e) { /* non-essential */ }
    try { setupNavScrollSpy(); } catch (e) { /* non-essential */ }
    $("status").textContent = `${data.length}か月分のHTMLを読み込みました。`;
  } catch (error) {
    console.error("読書データの読み込みに失敗しました", error);
    $("status").classList.add("error");
    $("status").textContent = `読書データを読み込めませんでした: ${error.message}。Webサーバー経由で開いているか、data/reading_data.json の内容を確認してください。`;
  }
}

window.addEventListener("DOMContentLoaded", init);

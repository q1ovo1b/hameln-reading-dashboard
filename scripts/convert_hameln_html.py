#!/usr/bin/env python3
"""Convert Hameln ``type=all`` reading-history HTML exports to monthly JSON."""
from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "raw"
OUTPUT = ROOT / "data" / "reading_data.json"
SCRIPT_OUTPUT = ROOT / "data" / "reading_data.js"
BASE_URL = "https://syosetu.org/"


def clean(value: str) -> str:
    """Turn HTML text into a compact, human-readable string."""
    return re.sub(r"\s+", " ", html.unescape(value or "")).strip()


def as_int(value: str) -> int:
    """Parse a comma-separated integer from a table cell."""
    match = re.search(r"[\d,，]+", value)
    return int(re.sub(r"[,，]", "", match.group(0))) if match else 0


@dataclass
class Cell:
    text: str = ""
    links: list[tuple[str, str]] = field(default_factory=list)


class HamelnTableParser(HTMLParser):
    """Extract each HTML table as rows of cells, including links in each cell."""
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[list[list[Cell]]] = []
        self._table: list[list[Cell]] | None = None
        self._row: list[Cell] | None = None
        self._cell: Cell | None = None
        self._cell_text: list[str] = []
        self._href: str | None = None
        self._link_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "table":
            self._table = []
        elif tag == "tr" and self._table is not None:
            self._row = []
        elif tag in {"td", "th"} and self._row is not None:
            self._cell, self._cell_text = Cell(), []
        elif tag == "a" and self._cell is not None:
            self._href, self._link_text = dict(attrs).get("href"), []
        elif tag == "br" and self._cell is not None:
            self._cell_text.append(" ")

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell_text.append(data)
            if self._href is not None:
                self._link_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._cell is not None and self._href:
            self._cell.links.append((clean("".join(self._link_text)), urljoin(BASE_URL, self._href)))
            self._href = None
        elif tag in {"td", "th"} and self._cell is not None and self._row is not None:
            self._cell.text = clean("".join(self._cell_text))
            self._row.append(self._cell)
            self._cell = None
        elif tag == "tr" and self._row is not None and self._table is not None:
            if self._row:
                self._table.append(self._row)
            self._row = None
        elif tag == "table" and self._table is not None:
            self.tables.append(self._table)
            self._table = None


def read_html(path: Path) -> str:
    data = path.read_bytes()
    for encoding in ("utf-8-sig", "cp932"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def table_header(table: list[list[Cell]]) -> list[str]:
    return [cell.text for cell in table[0]] if table else []


def find_table(tables: list[list[list[Cell]]], required_headers: set[str]) -> list[list[Cell]]:
    for table in tables:
        if required_headers.issubset(set(table_header(table))):
            return table
    return []


def period_from_html(source: str, path: Path) -> tuple[int, int]:
    match = re.search(r"((?:19|20)\d{2})年\s*(\d{1,2})月", source)
    if not match:
        match = re.search(r"((?:19|20)\d{2})[-_](\d{1,2})", path.stem)
    if not match:
        raise ValueError(f"年月を取得できません: {path.name}")
    return int(match.group(1)), int(match.group(2))


def parse_summary(table: list[list[Cell]]) -> tuple[dict, dict]:
    """Read the top table: 当月/累計 × 作品数/話数/文字数."""
    rows = {row[0].text: row for row in table[1:] if len(row) >= 4}
    def values(label: str) -> dict:
        row = rows.get(label, [])
        return {"works": as_int(row[1].text) if len(row) > 1 else 0,
                "episodes": as_int(row[2].text) if len(row) > 2 else 0,
                "chars": as_int(row[3].text) if len(row) > 3 else 0}
    return values("当月"), values("累計")


def parse_rankings(table: list[list[Cell]], item_key: str) -> list[dict]:
    """Read 原作 or タイトル rows. Multiple links are joined with ' / '."""
    rankings = []
    for row in table[1:]:
        if len(row) < 2:
            continue
        cell = row[0]
        name = " / ".join(label for label, _ in cell.links if label) or cell.text
        url = cell.links[0][1] if cell.links else ""
        if name:
            rankings.append({item_key: name, "url": url, "chars": as_int(row[1].text)})
    return rankings


def parse_daily(table: list[list[Cell]]) -> list[dict]:
    records = []
    for row in table[1:]:
        if len(row) < 4 or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", row[0].text):
            continue
        records.append({"date": row[0].text, "works": as_int(row[1].text),
                        "episodes": as_int(row[2].text), "chars": as_int(row[3].text)})
    return records


def convert_file(path: Path) -> dict:
    source = read_html(path)
    parser = HamelnTableParser(); parser.feed(source)
    year, month = period_from_html(source, path)
    summary = find_table(parser.tables, {"期間", "作品数", "話数", "文字数"})
    originals = find_table(parser.tables, {"原作", "文字数"})
    titles = find_table(parser.tables, {"タイトル", "文字数"})
    daily = find_table(parser.tables, {"日付", "作品数", "話数", "文字数"})
    if not all((summary, originals, titles, daily)):
        raise ValueError(f"type=all の必要な表を取得できません: {path.name}")
    monthly, cumulative = parse_summary(summary)
    return {"year": year, "month": month, "sourceFile": path.name,
            "monthly": monthly, "cumulative": cumulative,
            "originals": parse_rankings(originals, "name"),
            "titles": parse_rankings(titles, "title"), "daily": parse_daily(daily)}


def main() -> None:
    RAW_DIR.mkdir(exist_ok=True)
    files = sorted(RAW_DIR.glob("*.html"))
    if not files:
        print("raw/ にHTMLファイルがありません。")
        print("ハーメルンの type=all の読書データページを保存し、raw/2026-05.html のような名前で配置してください。")
        return
    converted = []
    for path in files:
        try:
            converted.append(convert_file(path))
        except ValueError as error:
            print(f"スキップ: {error}")
    if not converted:
        print("変換できるHTMLがありません。data/reading_data.json は変更していません。")
        return
    converted.sort(key=lambda item: (item["year"], item["month"]))
    OUTPUT.parent.mkdir(exist_ok=True)
    serialized = json.dumps(converted, ensure_ascii=False, indent=2) + "\n"
    OUTPUT.write_text(serialized, encoding="utf-8")
    SCRIPT_OUTPUT.write_text(f"window.READING_DATA = {serialized}", encoding="utf-8")
    print(f"{len(converted)}か月分のデータを {OUTPUT.relative_to(ROOT)} と {SCRIPT_OUTPUT.relative_to(ROOT)} に出力しました。")


if __name__ == "__main__":
    main()

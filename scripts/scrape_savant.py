"""
Baseball Savant Percentile Rankings Scraper

Scrapes percentile metrics for all Tampa Bay Rays 40-man roster players
from Baseball Savant's player pages. Saves results to public/data/savant-stats.json.
"""

import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Constants
RAYS_TEAM_ID = 139
SEASON = 2026
ROSTER_URL = f"https://statsapi.mlb.com/api/v1/teams/{RAYS_TEAM_ID}/roster?season={SEASON}"
OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data", "savant-stats.json")
PITCHER_POSITIONS = {"P", "SP", "RP", "CL"}

# Delay between requests to be respectful to Baseball Savant
REQUEST_DELAY = 2


def normalize_name_for_url(full_name: str) -> str:
    """
    Convert a player name to the URL slug format used by Baseball Savant.
    Format: firstname-lastname-playerid (all lowercase, no accents, hyphens for spaces).
    Example: "Yandy Díaz" -> "yandy-diaz"
    """
    # Remove accents/diacritics
    normalized = unicodedata.normalize("NFD", full_name)
    ascii_name = "".join(c for c in normalized if unicodedata.category(c) != "Mn")

    # Lowercase, remove non-alphanumeric (except spaces and hyphens)
    ascii_name = ascii_name.lower()
    ascii_name = re.sub(r"[^a-z0-9\s-]", "", ascii_name)

    # Replace spaces with hyphens
    ascii_name = re.sub(r"\s+", "-", ascii_name.strip())

    return ascii_name


def get_savant_url(player_name: str, player_id: int, stat_type: str) -> str:
    """Build the Baseball Savant player URL."""
    name_slug = normalize_name_for_url(player_name)
    return f"https://baseballsavant.mlb.com/savant-player/{name_slug}-{player_id}?stats=statcast-r-{stat_type}-mlb"


def get_roster() -> list[dict]:
    """Fetch the Rays 40-man roster from MLB Stats API."""
    print(f"Fetching roster from: {ROSTER_URL}")
    response = requests.get(ROSTER_URL, timeout=15)
    response.raise_for_status()
    data = response.json()

    roster = []
    for entry in data.get("roster", []):
        person = entry.get("person", {})
        position = entry.get("position", {})
        roster.append({
            "id": person.get("id"),
            "fullName": person.get("fullName", "Unknown"),
            "position": position.get("abbreviation", position.get("name", "Unknown")),
        })

    print(f"Found {len(roster)} players on roster")
    return roster


def create_driver() -> webdriver.Chrome:
    """Create a headless Chrome WebDriver instance."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(30)
    return driver


def scrape_player_metrics(driver: webdriver.Chrome, player: dict) -> dict | None:
    """
    Scrape percentile metrics for a single player from Baseball Savant.
    Returns the player data dict or None if scraping fails.
    """
    player_id = player["id"]
    player_name = player["fullName"]
    position = player["position"]
    stat_type = "pitching" if position in PITCHER_POSITIONS else "hitting"

    url = get_savant_url(player_name, player_id, stat_type)
    print(f"  Scraping: {player_name} ({position}) - {url}")

    try:
        driver.get(url)

        # Wait for the percentile rankings section to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#percentile-rankings, .percentile-rankings, svg"))
        )

        # Give extra time for SVG content to render
        time.sleep(2)

        # Parse the page
        soup = BeautifulSoup(driver.page_source, "html.parser")

        # Extract metrics from the percentile rankings visualization
        metrics = extract_metrics(soup)

        if not metrics:
            print(f"    WARNING: No metrics found for {player_name}")
            return None

        print(f"    Found {len(metrics)} metrics")

        return {
            "name": player_name,
            "position": position,
            "type": stat_type,
            "metrics": metrics,
        }

    except Exception as e:
        print(f"    ERROR: Failed to scrape {player_name}: {e}")
        return None


def extract_metrics(soup: BeautifulSoup) -> list[dict]:
    """
    Extract percentile metrics from the Baseball Savant page.
    Looks for the percentile rankings visualization and extracts metric data.
    """
    metrics = []

    # Strategy 1: Look for the percentile bar chart items
    # Baseball Savant uses various structures - try multiple selectors
    percentile_items = soup.select(".percentile-rank-item, .percentile-stat-row, [class*='percentile']")

    for item in percentile_items:
        metric = extract_metric_from_element(item)
        if metric:
            metrics.append(metric)

    if metrics:
        return metrics

    # Strategy 2: Look for SVG-based percentile visualization
    svg_elements = soup.select("svg")
    for svg in svg_elements:
        # Look for text elements that contain metric names and values
        texts = svg.find_all("text")
        if len(texts) >= 3:
            svg_metrics = extract_metrics_from_svg(svg)
            if svg_metrics:
                return svg_metrics

    # Strategy 3: Look for table-based percentile data
    tables = soup.select("table")
    for table in tables:
        rows = table.select("tr")
        for row in rows:
            cells = row.select("td, th")
            if len(cells) >= 3:
                metric = extract_metric_from_table_row(cells)
                if metric:
                    metrics.append(metric)

    # Strategy 4: Look for the specific Baseball Savant percentile structure
    # They often use div containers with specific data attributes
    rank_containers = soup.select("[data-percentile], [data-value], .rank-value")
    if rank_containers:
        for container in rank_containers:
            percentile = container.get("data-percentile") or container.get_text(strip=True)
            try:
                pct = int(percentile)
                # Try to find associated metric name
                parent = container.parent
                if parent:
                    name_el = parent.select_one(".metric-name, .stat-name, .label")
                    value_el = parent.select_one(".metric-value, .stat-value, .value")
                    if name_el:
                        metrics.append({
                            "name": name_el.get_text(strip=True),
                            "value": value_el.get_text(strip=True) if value_el else "",
                            "percentile": pct,
                        })
            except (ValueError, TypeError):
                continue

    return metrics


def extract_metric_from_element(element) -> dict | None:
    """Extract a single metric from a percentile rank element."""
    try:
        # Look for metric name
        name_el = element.select_one(".metric-name, .stat-name, .label, dt, .name")
        value_el = element.select_one(".metric-value, .stat-value, .value, dd, .val")
        pct_el = element.select_one(".percentile, .pct, .rank, [class*='percentile']")

        if not name_el:
            return None

        name = name_el.get_text(strip=True)
        value = value_el.get_text(strip=True) if value_el else ""
        percentile_text = pct_el.get_text(strip=True) if pct_el else ""

        # Try to parse percentile as integer
        try:
            percentile = int(re.sub(r"[^\d]", "", percentile_text))
        except (ValueError, TypeError):
            return None

        if name and 0 <= percentile <= 100:
            return {"name": name, "value": value, "percentile": percentile}

    except Exception:
        pass

    return None


def extract_metrics_from_svg(svg) -> list[dict]:
    """Extract metrics from an SVG-based percentile visualization."""
    metrics = []
    texts = svg.find_all("text")

    # Group text elements by their y-coordinate to find rows
    # Each row typically has: metric name, value, percentile
    rows_by_y = {}
    for text in texts:
        y = text.get("y", "0")
        try:
            y_val = float(y)
        except (ValueError, TypeError):
            continue
        if y_val not in rows_by_y:
            rows_by_y[y_val] = []
        rows_by_y[y_val].append(text.get_text(strip=True))

    # Process rows - look for patterns with metric name and percentile
    for y_val in sorted(rows_by_y.keys()):
        row_texts = rows_by_y[y_val]
        if len(row_texts) >= 2:
            # Try to identify which text is the percentile (a number 0-100)
            for i, text in enumerate(row_texts):
                try:
                    pct = int(text)
                    if 0 <= pct <= 100:
                        # The other texts are likely the metric name and value
                        other_texts = [t for j, t in enumerate(row_texts) if j != i]
                        name = other_texts[0] if other_texts else ""
                        value = other_texts[1] if len(other_texts) > 1 else ""
                        if name:
                            metrics.append({"name": name, "value": value, "percentile": pct})
                        break
                except ValueError:
                    continue

    return metrics


def extract_metric_from_table_row(cells) -> dict | None:
    """Extract a metric from a table row."""
    try:
        texts = [cell.get_text(strip=True) for cell in cells]
        # Look for a pattern: name, value, percentile
        for i, text in enumerate(texts):
            try:
                pct = int(text)
                if 0 <= pct <= 100 and i > 0:
                    name = texts[0]
                    value = texts[i - 1] if i > 1 else ""
                    if name and not name.isdigit():
                        return {"name": name, "value": value, "percentile": pct}
            except ValueError:
                continue
    except Exception:
        pass
    return None


def main():
    """Main scraper entry point."""
    print("=" * 60)
    print("Baseball Savant Percentile Rankings Scraper")
    print("=" * 60)
    print()

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    # Get roster
    try:
        roster = get_roster()
    except Exception as e:
        print(f"FATAL: Failed to fetch roster: {e}")
        sys.exit(1)

    if not roster:
        print("FATAL: No players found on roster")
        sys.exit(1)

    # Create WebDriver
    print("\nStarting headless Chrome...")
    try:
        driver = create_driver()
    except Exception as e:
        print(f"FATAL: Failed to start Chrome: {e}")
        sys.exit(1)

    # Scrape each player
    players_data = {}
    success_count = 0
    fail_count = 0

    print(f"\nScraping {len(roster)} players...\n")

    try:
        for i, player in enumerate(roster, 1):
            print(f"[{i}/{len(roster)}] Processing {player['fullName']}...")

            result = scrape_player_metrics(driver, player)

            if result:
                players_data[str(player["id"])] = result
                success_count += 1
            else:
                fail_count += 1

            # Rate limiting
            if i < len(roster):
                time.sleep(REQUEST_DELAY)

    finally:
        driver.quit()
        print("\nChrome driver closed.")

    # Build output
    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "players": players_data,
    }

    # Write JSON
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"Scraping complete!")
    print(f"  Success: {success_count}")
    print(f"  Failed:  {fail_count}")
    print(f"  Output:  {OUTPUT_PATH}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()

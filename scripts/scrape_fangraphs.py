"""
Fangraphs Leaderboard Data Collection

Fetches batting and pitching stats for Rays and Tigers from the Fangraphs
public JSON API. Saves results to public/data/fangraphs-stats.json.

No Selenium needed — uses the public leaderboard API directly.
"""

import json
import os
import sys
import time
from datetime import datetime, timezone

import requests

# Constants
SEASON = 2026
OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "data", "fangraphs-stats.json"
)

TEAMS = {
    "TB": {"fgTeamId": 12},
    "DET": {"fgTeamId": 6},
}

# Fangraphs leaderboard API base
BASE_URL = "https://www.fangraphs.com/api/leaders/major-league/data"

# Delay between API calls (seconds)
REQUEST_DELAY = 1


def build_url(team_id: int, stats: str) -> str:
    """Build the Fangraphs leaderboard API URL."""
    return (
        f"{BASE_URL}?pos=all&stats={stats}&lg=all&qual=0&type=8"
        f"&season={SEASON}&month=0&season1={SEASON}&ind=0"
        f"&team={team_id}&rost=0&age=0&filter=&players=0"
        f"&startdate=&enddate=&page=1_50"
    )


def fetch_json(url: str) -> dict | None:
    """Fetch JSON from a URL with error handling."""
    try:
        response = requests.get(url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (compatible; stats-dashboard/1.0)"
        })
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"  ERROR: Request failed: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"  ERROR: Invalid JSON response: {e}")
        return None


def parse_pct(value) -> float:
    """Parse a percentage value. Fangraphs returns decimals like 0.123 or percentages like 12.3."""
    if value is None:
        return 0.0
    try:
        val = float(value)
    except (ValueError, TypeError):
        return 0.0
    # If value > 1, it's likely a percentage (e.g., 12.3 means 12.3%)
    if val > 1:
        return round(val / 100, 3)
    return round(val, 3)


def safe_float(value, default=0.0) -> float:
    """Safely convert a value to float."""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def parse_hitter(player: dict) -> dict:
    """Parse a hitter record from the Fangraphs API response."""
    return {
        "name": player.get("PlayerName", "Unknown"),
        "fgPlayerId": player.get("playerid", 0),
        "PA": int(safe_float(player.get("PA", 0))),
        "H": int(safe_float(player.get("H", 0))),
        "HR": int(safe_float(player.get("HR", 0))),
        "bbPct": parse_pct(player.get("BB%", 0)),
        "kPct": parse_pct(player.get("K%", 0)),
        "BABIP": round(safe_float(player.get("BABIP", 0)), 3),
        "barrelPct": parse_pct(player.get("Barrel%", 0)),
        "wRCPlus": int(round(safe_float(player.get("wRC+", 0)))),
        "WAR": round(safe_float(player.get("WAR", 0)), 1),
    }


def parse_pitcher(player: dict) -> dict:
    """Parse a pitcher record from the Fangraphs API response."""
    return {
        "name": player.get("PlayerName", "Unknown"),
        "fgPlayerId": player.get("playerid", 0),
        "G": int(safe_float(player.get("G", 0))),
        "GS": int(safe_float(player.get("GS", 0))),
        "IP": safe_float(player.get("IP", 0)),
        "kPct": parse_pct(player.get("K%", 0)),
        "bbPct": parse_pct(player.get("BB%", 0)),
        "BABIP": round(safe_float(player.get("BABIP", 0)), 3),
        "FIP": round(safe_float(player.get("FIP", 0)), 1),
        "pbStuff": round(safe_float(player.get("pb_stuff", 0)), 1),
        "pbCommand": round(safe_float(player.get("pb_command", 0)), 1),
        "WAR": round(safe_float(player.get("WAR", 0)), 1),
    }


def collect_team_data(team_key: str, team_id: int) -> dict:
    """Collect batting and pitching data for a single team."""
    print(f"\n--- {team_key} (FG Team ID: {team_id}) ---")

    team_data = {
        "fgTeamId": team_id,
        "hitters": [],
        "pitchers": [],
    }

    # Fetch batting data
    print(f"  Fetching batting leaderboard...")
    bat_url = build_url(team_id, "bat")
    bat_response = fetch_json(bat_url)

    if bat_response:
        players = bat_response.get("data", [])
        print(f"  Found {len(players)} hitters (raw)")
        for player in players:
            try:
                parsed = parse_hitter(player)
                # Filter out pitchers who appear in batting leaderboard (very low PA)
                if parsed["PA"] >= 10:
                    team_data["hitters"].append(parsed)
            except (ValueError, TypeError, KeyError) as e:
                print(f"    WARNING: Failed to parse hitter {player.get('PlayerName', '?')}: {e}")
        print(f"  Kept {len(team_data['hitters'])} hitters (PA >= 10)")
        # Sort by WAR descending
        team_data["hitters"].sort(key=lambda x: x["WAR"], reverse=True)
    else:
        print("  WARNING: Could not fetch batting data")

    time.sleep(REQUEST_DELAY)

    # Fetch pitching data
    print(f"  Fetching pitching leaderboard...")
    pit_url = build_url(team_id, "pit")
    pit_response = fetch_json(pit_url)

    if pit_response:
        players = pit_response.get("data", [])
        print(f"  Found {len(players)} pitchers")
        for player in players:
            try:
                team_data["pitchers"].append(parse_pitcher(player))
            except (ValueError, TypeError, KeyError) as e:
                print(f"    WARNING: Failed to parse pitcher {player.get('PlayerName', '?')}: {e}")
        # Sort by WAR descending
        team_data["pitchers"].sort(key=lambda x: x["WAR"], reverse=True)
    else:
        print("  WARNING: Could not fetch pitching data")

    return team_data


def main():
    """Main entry point."""
    print("=" * 60)
    print("Fangraphs Leaderboard Data Collection")
    print(f"Season: {SEASON}")
    print("=" * 60)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "season": SEASON,
        "teams": {},
    }

    for team_key, team_info in TEAMS.items():
        team_id = team_info["fgTeamId"]
        team_data = collect_team_data(team_key, team_id)
        output["teams"][team_key] = team_data
        time.sleep(REQUEST_DELAY)

    # Write output
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Summary
    print(f"\n{'=' * 60}")
    print("Collection complete!")
    for team_key, team_data in output["teams"].items():
        print(f"  {team_key}: {len(team_data['hitters'])} hitters, {len(team_data['pitchers'])} pitchers")
    print(f"  Output: {OUTPUT_PATH}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()

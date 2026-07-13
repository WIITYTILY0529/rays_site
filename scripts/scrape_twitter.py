"""
Twitter/X Profile Scraper for @Ry_Bass (Ryan Bass)

Scrapes recent tweets from the Rays sideline reporter's profile
using Selenium headless Chrome. Saves results to public/data/twitter-feed.json.

This runs as a GitHub Actions scheduled job alongside the other scrapers.
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timezone

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Constants
TWITTER_USER = "Ry_Bass"
PROFILE_URL = f"https://x.com/{TWITTER_USER}"
MAX_TWEETS = 10
OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "data", "twitter-feed.json"
)


def create_driver() -> webdriver.Chrome:
    """Create a headless Chrome WebDriver instance."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    # Disable images for faster loading
    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(30)
    return driver


def scrape_tweets(driver: webdriver.Chrome) -> list[dict]:
    """
    Scrape tweets from the user's profile page.
    Returns a list of tweet dicts with text, date, url, and engagement stats.
    """
    print(f"Loading profile: {PROFILE_URL}")
    driver.get(PROFILE_URL)

    # Wait for tweets to load
    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "article[data-testid='tweet']"))
        )
    except Exception:
        print("WARNING: Timeout waiting for tweets to load, trying alternative selectors...")
        time.sleep(5)

    # Scroll down a bit to load more tweets
    for _ in range(3):
        driver.execute_script("window.scrollBy(0, 800)")
        time.sleep(1.5)

    # Scroll back to top
    driver.execute_script("window.scrollTo(0, 0)")
    time.sleep(1)

    # Find tweet articles
    articles = driver.find_elements(By.CSS_SELECTOR, "article[data-testid='tweet']")
    print(f"Found {len(articles)} tweet elements")

    tweets = []
    for article in articles[:MAX_TWEETS]:
        tweet = extract_tweet(article)
        if tweet:
            tweets.append(tweet)

    return tweets


def extract_tweet(article) -> dict | None:
    """Extract tweet data from an article element."""
    try:
        # Get tweet text
        text_el = article.find_elements(By.CSS_SELECTOR, "div[data-testid='tweetText']")
        text = text_el[0].text if text_el else ""

        if not text:
            return None

        # Get timestamp/link
        time_el = article.find_elements(By.CSS_SELECTOR, "time")
        timestamp = ""
        tweet_url = ""
        if time_el:
            timestamp = time_el[0].get_attribute("datetime") or ""
            # The parent <a> of <time> usually contains the tweet URL
            parent_link = time_el[0].find_elements(By.XPATH, "./..")
            if parent_link:
                href = parent_link[0].get_attribute("href")
                if href and "/status/" in href:
                    tweet_url = href

        # Get engagement metrics
        metrics = {}
        # Reply count
        reply_el = article.find_elements(By.CSS_SELECTOR, "button[data-testid='reply'] span")
        if reply_el and reply_el[0].text:
            metrics["replies"] = reply_el[0].text

        # Retweet count
        rt_el = article.find_elements(By.CSS_SELECTOR, "button[data-testid='retweet'] span")
        if rt_el and rt_el[0].text:
            metrics["retweets"] = rt_el[0].text

        # Like count
        like_el = article.find_elements(By.CSS_SELECTOR, "button[data-testid='like'] span")
        if like_el and like_el[0].text:
            metrics["likes"] = like_el[0].text

        # Check if it's a retweet (has "retweeted" social context)
        is_retweet = False
        social_context = article.find_elements(By.CSS_SELECTOR, "span[data-testid='socialContext']")
        if social_context:
            context_text = social_context[0].text.lower()
            if "reposted" in context_text or "retweeted" in context_text:
                is_retweet = True

        # Get media (images)
        media_urls = []
        img_els = article.find_elements(By.CSS_SELECTOR, "img[src*='pbs.twimg.com/media']")
        for img in img_els[:4]:
            src = img.get_attribute("src")
            if src:
                media_urls.append(src)

        return {
            "text": text,
            "timestamp": timestamp,
            "url": tweet_url,
            "metrics": metrics,
            "isRetweet": is_retweet,
            "media": media_urls,
        }

    except Exception as e:
        print(f"  WARNING: Failed to extract tweet: {e}")
        return None


def main():
    """Main entry point."""
    print("=" * 60)
    print(f"Twitter/X Scraper — @{TWITTER_USER}")
    print("=" * 60)
    print()

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    # Create WebDriver
    print("Starting headless Chrome...")
    try:
        driver = create_driver()
    except Exception as e:
        print(f"FATAL: Failed to start Chrome: {e}")
        sys.exit(1)

    try:
        tweets = scrape_tweets(driver)
    except Exception as e:
        print(f"ERROR: Scraping failed: {e}")
        tweets = []
    finally:
        driver.quit()
        print("Chrome driver closed.")

    if not tweets:
        print("\nWARNING: No tweets scraped. Keeping existing data if available.")
        if os.path.exists(OUTPUT_PATH):
            print("Existing data file preserved.")
            return
        # Write empty structure so the frontend doesn't break
        tweets = []

    # Build output
    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "user": {
            "name": "Ryan Bass",
            "handle": TWITTER_USER,
            "description": "Rays Sideline Reporter • MLB TV • NewsNation",
            "profileUrl": PROFILE_URL,
        },
        "tweets": tweets,
    }

    # Write JSON
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nScraping complete!")
    print(f"  Tweets saved: {len(tweets)}")
    print(f"  Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

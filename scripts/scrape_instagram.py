#!/usr/bin/env python3
"""Scrape Instagram profile posts via Apify and download images."""

import json
import os
import sys
import urllib.request
from pathlib import Path

from apify_client import ApifyClient

APIFY_TOKEN = os.environ.get("APIFY_API_TOKEN", "")
USERNAME = "issac5mcbride"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "assets" / "instagram"
METADATA_FILE = OUTPUT_DIR / "metadata.json"
RESULTS_LIMIT = 30


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Initializing Apify client...")
    client = ApifyClient(APIFY_TOKEN)

    # Use apify/instagram-post-scraper to get profile posts
    print(f"Scraping @{USERNAME} (up to {RESULTS_LIMIT} posts)...")
    run_input = {
        "username": [USERNAME],
        "resultsLimit": RESULTS_LIMIT,
    }

    # Try instagram-post-scraper first
    actor_id = "apify/instagram-post-scraper"
    print(f"Running actor: {actor_id}")

    try:
        run = client.actor(actor_id).call(run_input=run_input, timeout_secs=300)
    except Exception as e:
        print(f"Actor {actor_id} failed: {e}")
        # Fallback to instagram-scraper
        actor_id = "apify/instagram-scraper"
        print(f"Trying fallback actor: {actor_id}")
        run_input = {
            "directUrls": [f"https://www.instagram.com/{USERNAME}/"],
            "resultsType": "posts",
            "resultsLimit": RESULTS_LIMIT,
        }
        run = client.actor(actor_id).call(run_input=run_input, timeout_secs=300)

    dataset_id = run["defaultDatasetId"]
    items = list(client.dataset(dataset_id).iterate_items())
    print(f"Got {len(items)} posts from Apify")

    if not items:
        print("No posts found. Check the username or actor configuration.")
        sys.exit(1)

    # Download images and collect metadata
    metadata = []
    for i, item in enumerate(items):
        # Try common field names for image URL
        image_url = (
            item.get("displayUrl")
            or item.get("imageUrl")
            or item.get("url")
            or item.get("thumbnailUrl")
        )

        if not image_url:
            # Check for nested image data
            if "image" in item and isinstance(item["image"], str):
                image_url = item["image"]
            elif "images" in item and isinstance(item["images"], list) and item["images"]:
                image_url = item["images"][0]

        caption = item.get("caption", item.get("text", ""))
        likes = item.get("likesCount", item.get("likes", 0))
        comments = item.get("commentsCount", item.get("comments", 0))
        post_type = item.get("type", "unknown")
        timestamp = item.get("timestamp", item.get("takenAt", ""))

        entry = {
            "index": i,
            "image_url": image_url,
            "caption": caption[:200] if caption else "",
            "likes": likes,
            "comments": comments,
            "type": post_type,
            "timestamp": str(timestamp),
            "local_file": None,
        }

        if image_url:
            ext = ".jpg"
            filename = f"ig_{i:03d}{ext}"
            filepath = OUTPUT_DIR / filename
            try:
                print(f"  Downloading {i+1}/{len(items)}: {filename}")
                urllib.request.urlretrieve(image_url, str(filepath))
                entry["local_file"] = filename
            except Exception as e:
                print(f"  Failed to download {filename}: {e}")
        else:
            print(f"  Skipping post {i} - no image URL found")
            # Save raw item for debugging
            entry["raw_keys"] = list(item.keys())

        metadata.append(entry)

    # Save metadata
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

    downloaded = sum(1 for m in metadata if m["local_file"])
    print(f"\nDone! Downloaded {downloaded}/{len(items)} images to {OUTPUT_DIR}")
    print(f"Metadata saved to {METADATA_FILE}")

    # Also save raw response for reference
    raw_file = OUTPUT_DIR / "raw_response.json"
    with open(raw_file, "w") as f:
        json.dump(items, f, indent=2, default=str)
    print(f"Raw API response saved to {raw_file}")


if __name__ == "__main__":
    main()

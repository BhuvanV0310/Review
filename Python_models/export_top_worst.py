"""Export top worst reviews (most negative) from sentiment CSV to public JSON.

Usage:
    python export_top_worst.py --input data_with_sentiment.csv --output ../public/top_worst_reviews.json --top 20

This script expects the sentiment CSV to have at least these columns:
 - text or review text column (we'll look for common names)
 - rating (optional)
 - branch (optional)
 - sentiment_score (numeric) or sentiment (string)

If sentiment_score is not present but sentiment is (positive/neutral/negative), we prioritize negative rows.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import List

import pandas as pd


def find_text_col(df: pd.DataFrame) -> str | None:
    candidates = [c for c in df.columns if c.lower() in ("text", "review", "review_text", "text_")]
    return candidates[0] if candidates else None


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data_with_sentiment.csv", help="input CSV file (path)")
    parser.add_argument("--output", default="../public/top_worst_reviews.json", help="output JSON path relative to this script")
    parser.add_argument("--top", type=int, default=20, help="number of worst reviews to export")
    args = parser.parse_args(argv)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, args.input) if not os.path.isabs(args.input) else args.input
    output_path = os.path.join(script_dir, args.output) if not os.path.isabs(args.output) else args.output

    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}")
        return 2

    df = pd.read_csv(input_path)

    text_col = find_text_col(df)
    if text_col is None:
        # fallback to first string-like column
        for c in df.columns:
            if df[c].dtype == object:
                text_col = c
                break
    if text_col is None:
        print("No text/review column found in CSV.")
        return 3

    # Prefer numeric sentiment_score
    if "sentiment_score" in df.columns:
        df_sorted = df.sort_values(by="sentiment_score", ascending=True)
    elif "sentiment" in df.columns:
        # pick rows with sentiment == 'negative' first
        df_neg = df[df["sentiment"].astype(str).str.lower() == "negative"]
        df_sorted = df_neg
    else:
        # As a fallback, consider lowest rating if available
        if "rating" in df.columns:
            df_sorted = df.sort_values(by="rating", ascending=True)
        else:
            df_sorted = df

    top_n = df_sorted.head(args.top)

    # Map rows to simplified objects
    out = []
    for _, row in top_n.iterrows():
        item = {
            "branch": row.get("branch", None) or row.get("location", None) or None,
            "rating": int(row.get("rating", "0")) if pd.notna(row.get("rating", None)) else None,
            "text": row.get(text_col, "") if pd.notna(row.get(text_col, None)) else "",
            "sentiment": row.get("sentiment", None) if "sentiment" in row.index else None,
            "sentiment_score": float(row.get("sentiment_score", None)) if "sentiment_score" in row.index and pd.notna(row.get("sentiment_score", None)) else None,
        }
        out.append(item)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    # Additionally compute sentiment scores for entire dataset if missing and create chart data
    if "sentiment_score" not in df.columns:
        # Import TextBlob lazily to avoid hard dependency during static analysis
        try:
            from textblob import TextBlob  # type: ignore
        except Exception:
            print("TextBlob not available; falling back to neutral scores (0.0)")
            df["sentiment_score"] = 0.0
        else:
            print("Computing sentiment scores using TextBlob...")
            df["sentiment_score"] = df[text_col].astype(str).apply(lambda t: TextBlob(t).sentiment.polarity)
        df["sentiment"] = df["sentiment_score"].apply(lambda s: "positive" if s > 0 else ("neutral" if s == 0 else "negative"))

    # Chart: overall sentiment counts
    sentiment_counts = df["sentiment"].value_counts().to_dict()

    # Chart: sentiment by category if category exists
    chart_data: dict = {"sentiment_counts": sentiment_counts}
    if "category" in df.columns:
        cat_grouped = df.groupby(["category", "sentiment"]).size().unstack(fill_value=0)
        chart_data["by_category"] = cat_grouped.to_dict()

    # Chart: sentiment by rating if rating exists
    if "rating" in df.columns:
        rating_grouped = df.groupby(["rating", "sentiment"]).size().unstack(fill_value=0)
        chart_data["by_rating"] = rating_grouped.to_dict()

    # write chart data next to public
    chart_out = os.path.join(os.path.dirname(output_path), "chart_data.json")
    with open(chart_out, "w", encoding="utf-8") as cf:
        json.dump(chart_data, cf, ensure_ascii=False, indent=2)

    print(f"Exported top {len(out)} worst reviews to {output_path}")
    print(f"Wrote chart data to {chart_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

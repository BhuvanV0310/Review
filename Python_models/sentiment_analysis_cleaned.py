import pandas as pd
from textblob import TextBlob
import argparse

print("Starting sentiment analysis on cleaned text...")

parser = argparse.ArgumentParser()
parser.add_argument("--input", default="data_cleaned.csv")
parser.add_argument("--output", default="data_with_sentiment_cleaned.csv")
args = parser.parse_args([] if __name__ == "__main__" else None)
df = pd.read_csv(args.input)
print(f"Loaded {len(df)} rows.")

def get_sentiment(text):
    return TextBlob(str(text)).sentiment.polarity

df['sentiment_score'] = df['cleaned_text'].apply(get_sentiment)

def classify_sentiment(score):
    if score > 0:
        return 'positive'
    elif score == 0:
        return 'neutral'
    else:
        return 'negative'

df['sentiment'] = df['sentiment_score'].apply(classify_sentiment)

df.to_csv(args.output, index=False)

print("Sentiment analysis completed. Results saved to 'data_with_sentiment_cleaned.csv'.")

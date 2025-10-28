import pandas as pd
from textblob import TextBlob

print("Starting sentiment analysis on cleaned text...")

df = pd.read_csv('data_cleaned.csv')
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

df.to_csv('data_with_sentiment_cleaned.csv', index=False)

print("Sentiment analysis completed. Results saved to 'data_with_sentiment_cleaned.csv'.")

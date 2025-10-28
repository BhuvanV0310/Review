import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import argparse

# Load sentiment analyzed cleaned data
parser = argparse.ArgumentParser()
parser.add_argument("--input", default="data_with_sentiment_cleaned.csv")
parser.add_argument("--output", default="sentiment_distribution_cleaned.png")
args = parser.parse_args([] if __name__ == "__main__" else None)
df = pd.read_csv(args.input)

# Count sentiment categories
sentiment_counts = df['sentiment'].value_counts()

# Plot pie chart
plt.figure(figsize=(6, 6))
plt.pie(sentiment_counts, labels=sentiment_counts.index, autopct='%1.1f%%', startangle=140)
plt.title('Sentiment Distribution (Cleaned Text)')
plt.savefig(args.output)

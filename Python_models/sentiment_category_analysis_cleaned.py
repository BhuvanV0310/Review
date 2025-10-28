import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import argparse

# Load the cleaned sentiment data
parser = argparse.ArgumentParser()
parser.add_argument("--input", default="data_with_sentiment_cleaned.csv")
parser.add_argument("--output", default="sentiment_by_category_cleaned.png")
args = parser.parse_args([] if __name__ == "__main__" else None)
df = pd.read_csv(args.input)

# Group by category and sentiment, count occurrences
grouped = df.groupby(['category', 'sentiment']).size().unstack(fill_value=0)

# Plot stacked bar chart
grouped.plot(kind='bar', stacked=True, figsize=(12, 6))

plt.title('Sentiment Distribution by Category (Cleaned Text)')
plt.xlabel('Category')
plt.ylabel('Number of Reviews')
plt.legend(title='Sentiment')
plt.tight_layout()
plt.savefig(args.output)

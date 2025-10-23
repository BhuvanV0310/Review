import pandas as pd
import matplotlib.pyplot as plt

# Load the cleaned sentiment data
df = pd.read_csv('data_with_sentiment_cleaned.csv')

# Group by category and sentiment, count occurrences
grouped = df.groupby(['category', 'sentiment']).size().unstack(fill_value=0)

# Plot stacked bar chart
grouped.plot(kind='bar', stacked=True, figsize=(12, 6))

plt.title('Sentiment Distribution by Category (Cleaned Text)')
plt.xlabel('Category')
plt.ylabel('Number of Reviews')
plt.legend(title='Sentiment')
plt.tight_layout()
plt.savefig('sentiment_by_category_cleaned.png')
plt.show()

import pandas as pd
import matplotlib.pyplot as plt

# Load sentiment analyzed cleaned data
df = pd.read_csv('data_with_sentiment_cleaned.csv')

# Count sentiment categories
sentiment_counts = df['sentiment'].value_counts()

# Plot pie chart
plt.figure(figsize=(6, 6))
plt.pie(sentiment_counts, labels=sentiment_counts.index, autopct='%1.1f%%', startangle=140)
plt.title('Sentiment Distribution (Cleaned Text)')
plt.savefig('sentiment_distribution_cleaned.png')
plt.show()

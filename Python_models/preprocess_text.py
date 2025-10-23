import pandas as pd
import re

print("Starting text preprocessing...")

# Load data.csv
df = pd.read_csv('data.csv')
print(f"Loaded {len(df)} rows.")

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df['cleaned_text'] = df['text_'].apply(clean_text)

df.to_csv('data_cleaned.csv', index=False)

print("Preprocessing complete. 'data_cleaned.csv' created with cleaned_text column.")

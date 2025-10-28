import pandas as pd
import re
import argparse

print("Starting text preprocessing...")

# Load data.csv
parser = argparse.ArgumentParser()
parser.add_argument("--input", default="data.csv")
parser.add_argument("--output", default="data_cleaned.csv")
args = parser.parse_args([] if __name__ == "__main__" else None)
df = pd.read_csv(args.input)
print(f"Loaded {len(df)} rows.")

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

text_col = 'text_'
if text_col not in df.columns:
    for c in ['text', 'review', 'review_text']:
        if c in df.columns:
            text_col = c
            break
df['cleaned_text'] = df[text_col].apply(clean_text)

df.to_csv(args.output, index=False)

print("Preprocessing complete. 'data_cleaned.csv' created with cleaned_text column.")

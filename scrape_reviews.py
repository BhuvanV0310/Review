import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

# Change this to the URL of the page with reviews
target_url = "https://www.justdial.com/Delhi/Dominos-Pizza-Near-Hdfc-Bank-Block-A-Raj-Nagar-Palam-Colony/011PXX11-XX11-170206113312-V2M3_BZDET?auto=1&trkid=2307418482&term=domin"

# List to store review data
reviews = []

# Function to scrape a single page of reviews
def scrape_reviews(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    # Update selectors below to match the site's review structure
    for review in soup.select(".review"):  # Example selector
        reviewer = review.select_one(".reviewer").get_text(strip=True) if review.select_one(".reviewer") else ""
        rating = review.select_one(".rating").get_text(strip=True) if review.select_one(".rating") else ""
        text = review.select_one(".review-text").get_text(strip=True) if review.select_one(".review-text") else ""
        date = review.select_one(".review-date").get_text(strip=True) if review.select_one(".review-date") else ""
        reviews.append({
            "Reviewer": reviewer,
            "Rating": rating,
            "Text": text,
            "Date": date
        })

# Main scraping loop (pagination)
page = 1
while True:
    url = f"{target_url}?page={page}"
    print(f"Scraping {url}")
    scrape_reviews(url)
    # Check if there's a next page (update selector as needed)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    next_button = soup.select_one(".next-page")  # Example selector
    if not next_button:
        break
    page += 1
    time.sleep(1)  # Be polite to the server

# Save to CSV
pd.DataFrame(reviews).to_csv("reviews.csv", index=False)
print("Saved reviews to reviews.csv")

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time

# Setup Chrome options
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--no-sandbox')

# Path to your ChromeDriver
CHROMEDRIVER_PATH = 'chromedriver.exe'  # Update if needed

# Target URL
url = "https://www.justdial.com/Delhi/Dominos-Pizza-Near-Hdfc-Bank-Block-A-Raj-Nagar-Palam-Colony/011PXX11-XX11-170206113312-V2M3_BZDET"

# Start driver
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service, options=chrome_options)
driver.get(url)
time.sleep(3)  # Wait for JS to load

reviews = []

# Scroll and load more reviews if needed
for _ in range(5):  # Adjust for more pages
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)

# Find review elements (update selectors as needed)
review_elements = driver.find_elements(By.CSS_SELECTOR, '[class*="review"]')
for elem in review_elements:
    reviewer = elem.find_element(By.CSS_SELECTOR, '[class*="user"]').text if elem.find_elements(By.CSS_SELECTOR, '[class*="user"]') else ""
    rating = elem.find_element(By.CSS_SELECTOR, '[class*="star"]').text if elem.find_elements(By.CSS_SELECTOR, '[class*="star"]') else ""
    text = elem.text
    reviews.append({
        "Reviewer": reviewer,
        "Rating": rating,
        "Text": text
    })

driver.quit()

# Save to CSV
pd.DataFrame(reviews).to_csv("reviews.csv", index=False)
print("Saved reviews to reviews.csv")

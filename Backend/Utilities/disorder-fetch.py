import requests
from bs4 import BeautifulSoup

# The URL of the webpage to scrape
url = "https://en.wikipedia.org/wiki/List_of_mental_disorders"

# Make a GET request to the webpage
response = requests.get(url)

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(response.content, "html.parser")

# Find all <li> elements that contain an <a> element
li_elements = soup.find_all("li")
li_elements_with_links = [li for li in li_elements if li.find("a")]

# Write the <a> text to a file as SQL INSERT statements
with open("./mental_conditions.txt", "w") as output_file:
    for li_element in li_elements_with_links:
        a_element = li_element.find("a")
        disorder_name = a_element.text.strip().replace("'", "''")  # Escape single quotes
        output_file.write(f"INSERT INTO disorders (disorderName) VALUES ('{disorder_name}');\n")

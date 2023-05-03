import requests
from bs4 import BeautifulSoup

prohibited_values = ['',' ','Top', 'Main page', 'Contents', 'Current events', 'Random article', 'About Wikipedia', 'Contact us', 'Donate', 'Help', 'Learn to edit', 'Community portal', 'Recent changes', 'Upload file', 'Create account', 'Log in', 'Create account', 'Log in', 'Contributions', 'Talk', 'Article', 'Talk', 'Read', 'Edit', 'View history', 'Read', 'Edit', 'View history', 'What links here', 'Related changes', 'Upload file', 'Special pages', 'Permanent link', 'Page information', 'Cite this page', 'Wikidata item', 'Download as PDF', 'Printable version', 'INN = International Nonproprietary Name', 'BAN = British Approved Name', 'USAN = United States Adopted Name', 'Two-letter codes for countries', 'Lists of drugs', 'Articles with short description', 'Short description is different from Wikidata', 'Text is available under the Creative Commons Attribution-ShareAlike License 3.0;', 'additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy.', 'Wikipedia® is a registered trademark of the Wikimedia Foundation, Inc., a non-profit organization.', 'Privacy policy', 'About Wikipedia', 'Disclaimers', 'Contact Wikipedia', 'Mobile view', 'Developers', 'Statistics', 'Cookie statement']
prohibited_values.append("Text is available under the Creative Commons Attribution-ShareAlike License 3.0; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy. Wikipedia® is a registered trademark of the Wikimedia Foundation, Inc., a non-profit organization.")
prohibited_values.append("Text is available under the Creative Commons Attribution-ShareAlike License 3.0; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy. Wikipedia\® is a registered trademark of the Wikimedia Foundation, Inc., a non-profit organization.")
prohibited_values.append("Wikipedia")
written_drugs = []

with open('drugs.sql', 'w') as f:
# URL for the Wikipedia page containing links to drug subpages
    base_url = 'https://en.wikipedia.org/wiki/Lists_of_drugs'
    
    # Create a list to store all the drug names
    drug_names = []
    
    # Make a GET request to the base URL
    response = requests.get(base_url)
    
    # Use BeautifulSoup to parse the HTML content of the response
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all the links to drug subpages
    subpage_links = soup.find_all('a', href=True)

    # Iterate over the subpage links
    for link in subpage_links:
        # Check if the link is to a drug subpage
        if 'List_of_drugs' in link['href']:
        #     # Make a GET request to the drug subpage URL
            subpage_url = 'https://en.wikipedia.org' + link['href']
            subpage_response = requests.get(subpage_url)
            subpage_soup = BeautifulSoup(subpage_response.content, 'html.parser')
            
    
        #     # Find all the links to drug sub-subpages
            subsubpage_links = subpage_soup.find_all('a', href=True)
            
        #     # Iterate over the sub-subpage links
            for sublink in subsubpage_links:
        #         # Check if the link is to a drug sub-subpage
                if '/wiki/List_of_drugs' in sublink['href']:
        #             # Make a GET request to the drug sub-subpage URL
                    subsubpage_url = 'https://en.wikipedia.org' + sublink['href']
                    subsubpage_response = requests.get(subsubpage_url)
                    subsubpage_soup = BeautifulSoup(subsubpage_response.content, 'html.parser')
                    
                    if '/wiki/List_of_drugs' in sublink['href']:
        #             # Make a GET request to the drug sub-subpage URL
                        subsubsubpage_url = 'https://en.wikipedia.org' + sublink['href']
                        subsubsubpage_response = requests.get(subsubpage_url)
                        subsubsubpage_soup = BeautifulSoup(subsubpage_response.content, 'html.parser')
                        
                        
                        li_elements = subsubsubpage_soup.find_all("li")
                        drug_list = [li for li in li_elements if li.find("a")]
                        
                        for a_element in drug_list:
                            drug_name = a_element.text.strip().replace("'", "''")  # Escape single quotes
                            
                            if drug_name not in prohibited_values:
                                if drug_name not in written_drugs:
                                    if "Wikipedia" not in drug_name:
                                        if "Toggle" not in drug_name:
                                            print(drug_name)
                                            f.write(f"INSERT INTO drugs (name) VALUES ('{drug_name}');\n")
                                            written_drugs.append(drug_name)
                        
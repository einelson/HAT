from flask import Flask, render_template, request, jsonify
from google import genai
from googlesearch import search
import dotenv
import json
import os
import requests
from bs4 import BeautifulSoup
from prompts import (
    EXPLAIN_TEXT,
    SUMMARIZE_TEXT,
    DEFINE_TEXT,
    RESEARCH_TEXT
)
dotenv.load_dotenv('../.env')

# init model:
client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))

app = Flask(__name__)


def get_content(url):
    """Fetch content from a URL and return the text."""
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup.get_text()
    except Exception as e:
        print(f"Error fetching content from {url}: {e}")
        return ""


# Helper function to clean up text responses
def normalize_text(text):
    """Clean up response text by removing excessive newlines and spacing."""
    # Replace 3 or more consecutive newlines with just 2
    normalized = '\n'.join([line for line in text.split('\n') if line.strip()])

    # Fix common formatting issues
    normalized = normalized.replace('\n\n\n', '\n\n')
    normalized = normalized.replace('\n\n\n\n', '\n\n')

    # Convert to HTML
    html_text = ''
    for paragraph in normalized.split('\n\n'):
        if paragraph.strip():
            # Check if it's a list item
            if paragraph.strip().startswith('- ') or paragraph.strip().startswith('* '):
                items = paragraph.split('\n')
                html_text += '<ul>\n'
                for item in items:
                    if item.strip():
                        html_text += f'  <li>{item.strip().lstrip("- ").lstrip("* ")}</li>\n'
                html_text += '</ul>\n'
            else:
                html_text += f'<p>{paragraph}</p>\n'

    return html_text


@app.route('/')
def index():
    return render_template('example.html')


@app.route('/api/explain', methods=['POST'])
def explain_text():
    text = request.json.get('text', '')
    # This is a placeholder for actual explanation logic
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=EXPLAIN_TEXT.format(text=text)
    ).text
    
    # Clean up the response text
    formatted_response = normalize_text(response)
    return jsonify({"result": formatted_response})


@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    text = request.json.get('text', '')
    # This is a placeholder for actual summarization logic
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=SUMMARIZE_TEXT.format(text=text)
    ).text
    
    # Clean up the response text
    formatted_response = normalize_text(response)
    return jsonify({"result": formatted_response})


@app.route('/api/define', methods=['POST'])
def define_text():
    text = request.json.get('text', '')
    # Define the selected term using Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=DEFINE_TEXT.format(text=text)
    ).text
    return jsonify({"result": response})


@app.route('/api/research', methods=['POST'])
def research_text():
    text = request.json.get('text', '')
    # This is a placeholder for actual research logic
    research = f"Research findings on '{text}'"

    results = search(
        text,
        region="us",
        num_results=5,
        lang="en",
        advanced=True
    )
    sources = []
    for result in results:
        if result.url is None:
            continue

        sources.append(
            {
                'URL': result.url,
                'title': result.title,
                'description': result.description,
                'content': get_content(result.url),
            }
        )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=RESEARCH_TEXT.format(text=text, sources=json.dumps(sources, indent=2))
    ).text
    return jsonify({"result": response})


if __name__ == '__main__':
    app.run(debug=True)

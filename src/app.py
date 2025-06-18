from flask import Flask, render_template, request, jsonify
from google import genai

# init model:
client = genai.Client(api_key='')

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('example.html')


@app.route('/api/explain', methods=['POST'])
def explain_text():
    text = request.json.get('text', '')
    # This is a placeholder for actual explanation logic
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=f"Explain this concept or term in simple language: '{text}'"
    ).text
    return jsonify({"result": response})


@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    text = request.json.get('text', '')
    # This is a placeholder for actual summarization logic
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=f"Create a short summary of this. Use simple terms: '{text}'"
    ).text
    return jsonify({"result": response})


@app.route('/api/define', methods=['POST'])
def define_text():
    text = request.json.get('text', '')
    # Define the selected term using Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=f"Define this term or concept in short simple language: '{text}'"
    ).text
    return jsonify({"result": response})


@app.route('/api/research', methods=['POST'])
def research_text():
    text = request.json.get('text', '')
    # This is a placeholder for actual research logic
    research = f"Research findings on '{text}'"
    return jsonify({"result": research})


if __name__ == '__main__':
    app.run(debug=True)

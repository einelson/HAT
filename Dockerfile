FROM python:3.12-slim

# Install uv (fast Python dependency manager)
RUN pip install uv

# Set work directory
WORKDIR /app

# Copy project files
COPY . /app

# Install dependencies using uv
RUN uv pip install --system --requirement pyproject.toml

# Expose Flask default port
EXPOSE 5000

# Set environment variable for Gemini API key (can be overridden at runtime)
ENV GEMINI_API_KEY=""

# Command to run Flask app, passing the API key from environment
CMD ["python", "src/app.py"]

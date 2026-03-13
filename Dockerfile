FROM python:3.10-slim

# Create a non-root user for security (required by some HF features)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install dependencies from the backend folder
COPY --chown=user backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy EVERYTHING to allow root access for the sync action, 
# but the CMD will focus on the backend code.
COPY --chown=user backend/ .

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

import API_BASE_URL from "../config";

const getHeaders = () => ({
  "ngrok-skip-browser-warning": "true"
});

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Health check failed");
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function sendMessage(message, history, imageFile = null) {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("history", JSON.stringify(history));
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  if (!response.ok) throw new Error("Chat request failed");
  return response.json();
}

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  if (!response.ok) throw new Error("PDF upload failed");
  return response.json();
}

export async function clearPDF() {
  const response = await fetch(`${API_BASE_URL}/clear-pdf`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Clear PDF failed");
  return response.json();
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model-info`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch model info");
  return response.json();
}

export async function getSuggestions() {
  const response = await fetch(`${API_BASE_URL}/suggestions`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch suggestions");
  return response.json();
}

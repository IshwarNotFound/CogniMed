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

/**
 * Upload a PDF file using XMLHttpRequest so that real upload progress events
 * are available for the terminal boot sequence in PDFUploader.
 *
 * @param {File} file - The PDF file to upload
 * @param {function} onProgress - Called with (percent: number) as upload progresses
 * @returns {Promise<object>} - Resolves with the server response JSON
 */
export function uploadPDF(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    // Real upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid JSON response from server"));
        }
      } else {
        reject(new Error(`PDF upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("PDF upload network error"));
    xhr.onabort = () => reject(new Error("PDF upload aborted"));

    xhr.open("POST", `${API_BASE_URL}/upload-pdf`);

    // Set custom headers (cannot set Content-Type manually with FormData — browser does it)
    Object.entries(getHeaders()).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(formData);
  });
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

import API_BASE_URL from "../config";

const getHeaders = () => ({
  "ngrok-skip-browser-warning": "true",
});

// ─────────────────────────────────────────────────────────────
// Item 4 — health check (existing, unchanged)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Item 3 — Full Parameter Threading: top_k threaded through stack
// ─────────────────────────────────────────────────────────────
export async function sendMessage(message, history, imageFile = null, topK = 5) {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("history", JSON.stringify(history));
  formData.append("top_k", topK.toString());
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

// ─────────────────────────────────────────────────────────────
// Item 7 — Hardened XHR Boot Sequence (REPLACED)
// 90s timeout, granular FastAPI error parsing, full error surface
// ─────────────────────────────────────────────────────────────
export const uploadPDF = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    // Track real-time upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        if (onProgress) onProgress(percentComplete);
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
        // Attempt to parse the FastAPI HTTP exception detail
        try {
          const errorRes = JSON.parse(xhr.responseText);
          reject(new Error(errorRes.detail || "Upload failed."));
        } catch (e) {
          reject(new Error(`Server error: ${xhr.status}`));
        }
      }
    };

    // Hardened error, abort, and timeout handlers
    xhr.onerror = () => reject(new Error("PDF upload network error. Check backend connection."));
    xhr.onabort = () => reject(new Error("PDF upload aborted by user/system."));

    // Strict 90-second timeout — prevents infinite "Extracting..." UI hang
    xhr.timeout = 90000;
    xhr.ontimeout = () => reject(new Error("PDF upload timed out. Connection to AI core lost."));

    xhr.open("POST", `${API_BASE_URL}/upload-pdf`);

    // Preserve the ngrok tunnel header — required for bypass
    xhr.setRequestHeader("ngrok-skip-browser-warning", "true");

    xhr.send(formData);
  });
};

// ─────────────────────────────────────────────────────────────
// Item 2 — Localized Document Flush (existing, verified)
// ─────────────────────────────────────────────────────────────
export async function clearPDF() {
  const response = await fetch(`${API_BASE_URL}/clear-pdf`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Clear PDF failed");
  return response.json();
}

// ─────────────────────────────────────────────────────────────
// Item 1 — True Vector Purge / race-condition-proof session reset
// ─────────────────────────────────────────────────────────────
export async function resetSession() {
  const response = await fetch(`${API_BASE_URL}/reset-session`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Reset session failed");
  return response.json();
}

// ─────────────────────────────────────────────────────────────
// Existing utilities (unchanged)
// ─────────────────────────────────────────────────────────────
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

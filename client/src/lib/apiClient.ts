import { apiRequest } from "./queryClient";

export class APIClient {
  
  static async generateImages(promptId: number, text: string, mode: string) {
    const response = await apiRequest('POST', '/api/generate/images', {
      promptId,
      text,
      mode
    });
    return response.json();
  }

  static async generateVideos(promptId: number, text: string) {
    const response = await apiRequest('POST', '/api/generate/videos', {
      promptId,
      text
    });
    return response.json();
  }

  static async translateText(text: string, targetLanguage: string = 'en') {
    const response = await apiRequest('POST', '/api/translate', {
      text,
      targetLanguage
    });
    return response.json();
  }

  static async createPrompt(userId: number, originalText: string, translatedText: string, language: string, mode: string) {
    const response = await apiRequest('POST', '/api/prompts', {
      userId,
      originalText,
      translatedText,
      language,
      mode
    });
    return response.json();
  }

  static async getUserPrompts(userId: number) {
    const response = await apiRequest('GET', `/api/prompts/${userId}`);
    return response.json();
  }

  static async createFolder(userId: number, name: string) {
    const response = await apiRequest('POST', '/api/folders', {
      userId,
      name
    });
    return response.json();
  }

  static async getUserFolders(userId: number) {
    const response = await apiRequest('GET', `/api/folders/${userId}`);
    return response.json();
  }

  static async updateFolder(id: number, name: string) {
    const response = await apiRequest('PUT', `/api/folders/${id}`, { name });
    return response.json();
  }

  static async deleteFolder(id: number) {
    const response = await apiRequest('DELETE', `/api/folders/${id}`);
    return response.json();
  }

  static async assignImageToFolder(imageId: number, folderId: number | null) {
    const response = await apiRequest('PUT', `/api/images/${imageId}/folder`, {
      folderId
    });
    return response.json();
  }

  static async authenticateUser(email: string, username: string) {
    const response = await apiRequest('POST', '/api/auth/login', {
      email,
      username
    });
    return response.json();
  }

  static async getFolderImages(folderId: number) {
    const response = await apiRequest('GET', `/api/folders/${folderId}/images`);
    return response.json();
  }
}

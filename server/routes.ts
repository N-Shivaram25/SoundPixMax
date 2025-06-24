import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertFolderSchema, insertPromptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, username } = req.body;
      
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email, username });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Folder routes
  app.get("/api/folders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const folders = await storage.getUserFolders(userId);
      
      // Add image count to each folder
      const foldersWithCounts = await Promise.all(
        folders.map(async (folder) => {
          const images = await storage.getFolderImages(folder.id);
          return { ...folder, imageCount: images.length };
        })
      );
      
      res.json({ folders: foldersWithCounts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const folderData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(folderData);
      res.json({ folder });
    } catch (error) {
      res.status(400).json({ error: "Invalid folder data" });
    }
  });

  app.put("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      const folder = await storage.updateFolder(id, name);
      
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      
      res.json({ folder });
    } catch (error) {
      res.status(500).json({ error: "Failed to update folder" });
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFolder(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Folder not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });

  // Get folder images
  app.get("/api/folders/:folderId/images", async (req, res) => {
    try {
      const folderId = parseInt(req.params.folderId);
      const images = await storage.getFolderImages(folderId);
      res.json({ images });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folder images" });
    }
  });

  // Prompt routes
  app.get("/api/prompts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const prompts = await storage.getUserPrompts(userId);
      res.json({ prompts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  app.post("/api/prompts", async (req, res) => {
    try {
      const promptData = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(promptData);
      res.json({ prompt });
    } catch (error) {
      res.status(400).json({ error: "Invalid prompt data" });
    }
  });

  // Image generation route
  app.post("/api/generate/images", async (req, res) => {
    try {
      const { promptId, text, mode } = req.body;
      
      const clipdropApiKey = process.env.CLIPDROP_API_KEY;
      if (!clipdropApiKey) {
        return res.status(500).json({ error: "Clipdrop API key not configured" });
      }

      let prompts = [text];
      
      // For saga mode, split into segments for multiple images
      if (mode === 'saga' && text.includes('|')) {
        prompts = text.split('|').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }

      // Generate images for each prompt (3 for normal mode, 1 per segment for saga)
      const imagePromises = [];
      
      if (mode === 'saga') {
        // Generate one image per story segment
        for (const prompt of prompts) {
          imagePromises.push(generateSingleImage(prompt, clipdropApiKey, promptId));
        }
      } else {
        // Generate 3 images for the same prompt
        for (let i = 0; i < 3; i++) {
          imagePromises.push(generateSingleImage(text, clipdropApiKey, promptId));
        }
      }

      const images = await Promise.all(imagePromises);
      res.json({ images });
    } catch (error) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: "Failed to generate images" });
    }
  });

  async function generateSingleImage(prompt: string, apiKey: string, promptId: number) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    
    const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;
    
    // Get the prompt to find the user ID
    const promptData = await storage.getPrompt(promptId);
    let preImagesFolderId = null;
    
    if (promptData) {
      const preImagesFolder = await storage.getPreImagesFolder(promptData.userId);
      preImagesFolderId = preImagesFolder?.id || null;
    }
    
    // Save image to storage and assign to Pre Images folder
    const image = await storage.createImage({
      promptId,
      folderId: preImagesFolderId,
      imageUrl,
      thumbnailUrl: imageUrl,
    });

    return image;
  }

  // Video generation route
  app.post("/api/generate/videos", async (req, res) => {
    try {
      const { promptId, text } = req.body;
      
      const runwayApiKey = process.env.RUNWAY_API_KEY;
      if (!runwayApiKey) {
        return res.status(500).json({ error: "RunwayML API key not configured" });
      }

      // Generate 3 videos using RunwayML API
      const videoPromises = Array(3).fill(null).map(async (_, index) => {
        const response = await fetch('https://api.runwayml.com/v1/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${runwayApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: text,
            model: 'gen2',
            duration: 4,
          }),
        });

        if (!response.ok) {
          throw new Error(`Video generation failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Save video to storage
        const video = await storage.createVideo({
          promptId,
          videoUrl: result.video_url,
          thumbnailUrl: result.thumbnail_url,
        });

        return video;
      });

      const videos = await Promise.all(videoPromises);
      res.json({ videos });
    } catch (error) {
      console.error('Video generation error:', error);
      res.status(500).json({ error: "Failed to generate videos" });
    }
  });

  // Translation route
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage = 'en' } = req.body;
      
      // Simple translation logic - in production, use Google Translate API
      if (targetLanguage === 'en') {
        return res.json({ translatedText: text });
      }
      
      // Mock translation for demo - replace with actual Google Translate API
      res.json({ translatedText: text });
    } catch (error) {
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Image folder assignment
  app.put("/api/images/:id/folder", async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const { folderId } = req.body;
      
      const success = await storage.updateImageFolder(imageId, folderId);
      
      if (!success) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update image folder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

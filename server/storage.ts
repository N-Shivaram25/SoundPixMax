import { 
  users, folders, prompts, generatedImages, generatedVideos,
  type User, type InsertUser, type Folder, type InsertFolder,
  type Prompt, type InsertPrompt, type GeneratedImage, type InsertImage,
  type GeneratedVideo, type InsertVideo
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Folder operations
  getUserFolders(userId: number): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, name: string): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  getPreImagesFolder(userId: number): Promise<Folder | undefined>;
  
  // Prompt operations
  getUserPrompts(userId: number): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  
  // Image operations
  createImage(image: InsertImage): Promise<GeneratedImage>;
  getPromptImages(promptId: number): Promise<GeneratedImage[]>;
  updateImageFolder(imageId: number, folderId: number | null): Promise<boolean>;
  getFolderImages(folderId: number): Promise<GeneratedImage[]>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<GeneratedVideo>;
  getPromptVideos(promptId: number): Promise<GeneratedVideo[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private folders: Map<number, Folder> = new Map();
  private prompts: Map<number, Prompt> = new Map();
  private images: Map<number, GeneratedImage> = new Map();
  private videos: Map<number, GeneratedVideo> = new Map();
  private currentUserId = 1;
  private currentFolderId = 1;
  private currentPromptId = 1;
  private currentImageId = 1;
  private currentVideoId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      googleId: insertUser.googleId || null
    };
    this.users.set(id, user);
    
    // Create default "Pre Images" folder
    await this.createFolder({ userId: id, name: "Pre Images" });
    
    return user;
  }

  async getPreImagesFolder(userId: number): Promise<Folder | undefined> {
    return Array.from(this.folders.values()).find(folder => 
      folder.userId === userId && folder.name === "Pre Images"
    );
  }

  async getUserFolders(userId: number): Promise<Folder[]> {
    return Array.from(this.folders.values()).filter(folder => folder.userId === userId);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.currentFolderId++;
    const folder: Folder = { 
      ...insertFolder, 
      id, 
      createdAt: new Date() 
    };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: number, name: string): Promise<Folder | undefined> {
    const folder = this.folders.get(id);
    if (folder) {
      folder.name = name;
      this.folders.set(id, folder);
      return folder;
    }
    return undefined;
  }

  async deleteFolder(id: number): Promise<boolean> {
    return this.folders.delete(id);
  }

  async getUserPrompts(userId: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values())
      .filter(prompt => prompt.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.currentPromptId++;
    const prompt: Prompt = { 
      ...insertPrompt, 
      id, 
      createdAt: new Date() 
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createImage(insertImage: InsertImage): Promise<GeneratedImage> {
    const id = this.currentImageId++;
    const image: GeneratedImage = { 
      ...insertImage, 
      id, 
      createdAt: new Date(),
      folderId: insertImage.folderId || null,
      thumbnailUrl: insertImage.thumbnailUrl || null
    };
    this.images.set(id, image);
    return image;
  }

  async getPromptImages(promptId: number): Promise<GeneratedImage[]> {
    return Array.from(this.images.values()).filter(image => image.promptId === promptId);
  }

  async updateImageFolder(imageId: number, folderId: number | null): Promise<boolean> {
    const image = this.images.get(imageId);
    if (image) {
      image.folderId = folderId;
      this.images.set(imageId, image);
      return true;
    }
    return false;
  }

  async getFolderImages(folderId: number): Promise<GeneratedImage[]> {
    return Array.from(this.images.values()).filter(image => image.folderId === folderId);
  }

  async createVideo(insertVideo: InsertVideo): Promise<GeneratedVideo> {
    const id = this.currentVideoId++;
    const video: GeneratedVideo = { 
      ...insertVideo, 
      id, 
      createdAt: new Date(),
      thumbnailUrl: insertVideo.thumbnailUrl || null
    };
    this.videos.set(id, video);
    return video;
  }

  async getPromptVideos(promptId: number): Promise<GeneratedVideo[]> {
    return Array.from(this.videos.values()).filter(video => video.promptId === promptId);
  }
}

export const storage = new MemStorage();

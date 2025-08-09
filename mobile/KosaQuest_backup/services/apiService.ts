import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = 'https://kosa-quest-core-backend-service.onrender.com/api';

interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  isEmailVerified: boolean;
  selectedLanguage?: string;
  selectedProficiency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Story {
  storyId: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  totalXP: number;
  pages?: StoryPage[];
  quizzes?: Quiz[];
}

export interface StoryPage {
  pageNo?: number;
  pageNumber?: number; // Add both to handle API variations
  english?: string;
  native?: string;
  content?: string; // Add for fallback data
  translation?: string; // Add for fallback data
  imageUrl?: string | null;
}

export interface Quiz {
  questionId?: string;
  question?: string;
  options?: string[];
  answer?: string;
  questions?: QuizQuestion[]; // Keep for fallback
  quizzes?: QuizQuestion[]; // Add for API response
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  answer?: string; // API uses 'answer' instead of 'correctAnswer'
  points?: number;
  explanation?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
}

interface StoriesResponse {
  stories: Story[];
  count: number;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['auth_token', 'user_data']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(name: string, email: string, password: string, selectedLanguage?: string, selectedProficiency?: string): Promise<ApiResponse<RegisterResponse>> {
    try {
      const requestData: any = {
        name,
        email,
        password,
      };

      // Add optional fields if provided
      if (selectedLanguage) requestData.selectedLanguage = selectedLanguage;
      if (selectedProficiency) requestData.selectedProficiency = selectedProficiency;

      const response: AxiosResponse<ApiResponse<RegisterResponse>> = await this.api.post('/auth/register', requestData);
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async verifyEmail(email: string, verificationCode: string): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/auth/verify-email', {
        email,
        verificationCode,
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get('/user/profile');
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async updateUserProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.put('/user/profile', userData);
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // Stories endpoints
  async getStories(difficulty?: string, language?: string): Promise<ApiResponse<StoriesResponse>> {
    try {
      const params = new URLSearchParams();
      if (difficulty) params.append('difficulty', difficulty);
      if (language) params.append('language', language);
      
      const response: AxiosResponse<ApiResponse<StoriesResponse>> = await this.api.get(`/stories?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async getStoryById(storyId: string): Promise<ApiResponse<Story>> {
    try {
      const response: AxiosResponse<ApiResponse<Story>> = await this.api.get(`/stories/${storyId}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async getStory(storyId: string): Promise<ApiResponse<{ story: Story; pages: StoryPage[]; quiz: Quiz }>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${this.api.defaults.baseURL}/stories/${storyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      const data = await response.json();
      
      // Transform the API response to match our expected format
      if (data.status === 'OK' && data.data) {
        const transformedData = {
          story: {
            storyId: data.data.storyId,
            title: data.data.title,
            description: data.data.description,
            language: data.data.language,
            difficulty: data.data.difficulty,
            totalXP: data.data.totalXP,
          },
          pages: data.data.pages || [],
          quiz: {
            questions: data.data.quizzes || [] // Transform quizzes to questions
          }
        };
        
        return {
          status: data.status,
          message: data.message,
          data: transformedData
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching story:', error);
      throw error;
    }
  }

  async submitQuiz(storyId: string, responses: { questionId: string; answer: string }[]): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${this.api.defaults.baseURL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          storyId,
          responses,
        }),
      });
      return response.json();
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  async checkBadgeEligibility(): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${this.api.defaults.baseURL}/nft/check-eligibility`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      return response.json();
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  async mintBadge(badgeType: string = 'proverb_apprentice'): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${this.api.defaults.baseURL}/nft/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ badgeType }),
      });
      return response.json();
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  async getUserBadges(): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${this.api.defaults.baseURL}/nft/my-badges`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      return response.json();
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { ApiResponse, LoginResponse, Quiz, RegisterResponse, StoriesResponse, Story, StoryPage };

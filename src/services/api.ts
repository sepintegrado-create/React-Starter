import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================
// TYPES
// ============================================

export interface ApiError {
    error: string;
    message?: string;
    details?: any;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export interface Company {
    id: string;
    cnpj: string;
    name: string;
    tradeName: string;
    email: string;
    phone: string;
    planStatus: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock?: number;
    isActive: boolean;
    categoryId: string;
}

// ============================================
// API CLIENT
// ============================================

class ApiClient {
    private client: AxiosInstance;
    private token: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Load tokens from localStorage
        this.loadTokens();

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling and token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ApiError>) => {
                const originalRequest = error.config as any;

                // If 401 and we have a refresh token, try to refresh
                if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
                    originalRequest._retry = true;

                    try {
                        const response = await axios.post(
                            `${this.client.defaults.baseURL}/auth/refresh`,
                            { refreshToken: this.refreshToken }
                        );

                        const { token, refreshToken } = response.data;
                        this.setTokens(token, refreshToken);

                        // Retry original request
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, clear tokens and redirect to login
                        this.clearTokens();
                        window.location.hash = '/';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private loadTokens() {
        this.token = localStorage.getItem('api_token');
        this.refreshToken = localStorage.getItem('api_refresh_token');
    }

    private setTokens(token: string, refreshToken: string) {
        this.token = token;
        this.refreshToken = refreshToken;
        localStorage.setItem('api_token', token);
        localStorage.setItem('api_refresh_token', refreshToken);
    }

    private clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('api_token');
        localStorage.removeItem('api_refresh_token');
    }

    // ============================================
    // AUTH
    // ============================================

    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await this.client.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        this.setTokens(response.data.token, response.data.refreshToken);
        return response.data;
    }

    async register(userData: any): Promise<void> {
        await this.client.post('/auth/register', userData);
    }

    async logout(): Promise<void> {
        try {
            await this.client.post('/auth/logout');
        } finally {
            this.clearTokens();
        }
    }

    // ============================================
    // USER PROFILE
    // ============================================

    async getProfile(): Promise<any> {
        const response = await this.client.get('/users/profile');
        return response.data;
    }

    async updateProfile(data: { name?: string; phone?: string; address?: string }): Promise<any> {
        const response = await this.client.put('/users/profile', data);
        return response.data;
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await this.client.post('/users/change-password', {
            currentPassword,
            newPassword,
        });
    }

    async toggle2FA(enabled: boolean): Promise<any> {
        const response = await this.client.put('/users/2fa', { enabled });
        return response.data;
    }

    async getSessions(): Promise<any[]> {
        const response = await this.client.get('/users/sessions');
        return response.data;
    }

    async terminateOtherSessions(): Promise<void> {
        await this.client.delete('/users/sessions');
    }

    async updateNotifications(preferences: any): Promise<void> {
        await this.client.put('/users/notifications', preferences);
    }

    async updatePrivacy(settings: any): Promise<void> {
        await this.client.put('/users/privacy', settings);
    }

    async exportData(): Promise<any> {
        const response = await this.client.get('/users/export-data');
        return response.data;
    }

    async deleteAccount(password: string): Promise<void> {
        await this.client.delete('/users/account', { data: { password } });
        this.clearTokens();
    }

    // ============================================
    // COMPANIES
    // ============================================

    async createCompany(data: any): Promise<Company> {
        const response = await this.client.post<Company>('/companies', data);
        return response.data;
    }

    async getCompanies(): Promise<Company[]> {
        const response = await this.client.get<Company[]>('/companies');
        return response.data;
    }

    async getCompany(id: string): Promise<Company> {
        const response = await this.client.get<Company>(`/companies/${id}`);
        return response.data;
    }

    async updateCompany(id: string, data: any): Promise<Company> {
        const response = await this.client.put<Company>(`/companies/${id}`, data);
        return response.data;
    }

    async getCompanyDashboard(id: string): Promise<any> {
        const response = await this.client.get(`/companies/${id}/dashboard`);
        return response.data;
    }

    // ============================================
    // PRODUCTS
    // ============================================

    async createProduct(data: any): Promise<Product> {
        const response = await this.client.post<Product>('/products', data);
        return response.data;
    }

    async getProducts(params?: any): Promise<{ products: Product[]; pagination: any }> {
        const response = await this.client.get('/products', { params });
        return response.data;
    }

    async getProduct(id: string): Promise<Product> {
        const response = await this.client.get<Product>(`/products/${id}`);
        return response.data;
    }

    async updateProduct(id: string, data: any): Promise<Product> {
        const response = await this.client.put<Product>(`/products/${id}`, data);
        return response.data;
    }

    async deleteProduct(id: string): Promise<void> {
        await this.client.delete(`/products/${id}`);
    }

    async getCategories(companyId: string): Promise<any[]> {
        const response = await this.client.get(`/products/company/${companyId}/categories`);
        return response.data;
    }

    async createCategory(data: any): Promise<any> {
        const response = await this.client.post('/products/categories', data);
        return response.data;
    }

    // ============================================
    // FISCAL
    // ============================================

    async issueNFe(data: any): Promise<any> {
        const response = await this.client.post('/fiscal/invoices/nfe', data);
        return response.data;
    }

    async getInvoices(companyId: string, params?: any): Promise<any> {
        const response = await this.client.get(`/fiscal/companies/${companyId}/invoices`, { params });
        return response.data;
    }

    async getInvoice(id: string): Promise<any> {
        const response = await this.client.get(`/fiscal/invoices/${id}`);
        return response.data;
    }

    async cancelInvoice(id: string, reason: string): Promise<void> {
        await this.client.post(`/fiscal/invoices/${id}/cancel`, { reason });
    }

    async downloadXML(id: string): Promise<Blob> {
        const response = await this.client.get(`/fiscal/invoices/${id}/xml`, {
            responseType: 'blob',
        });
        return response.data;
    }

    async downloadDANFE(id: string): Promise<Blob> {
        const response = await this.client.get(`/fiscal/invoices/${id}/danfe`, {
            responseType: 'blob',
        });
        return response.data;
    }

    // ============================================
    // UPLOAD
    // ============================================

    async uploadFile(file: File, category: string, companyId: string): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('companyId', companyId);

        const response = await this.client.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    // ============================================
    // ERROR HANDLING
    // ============================================

    handleError(error: any): string {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiError>;
            if (axiosError.response?.data?.message) {
                return axiosError.response.data.message;
            }
            if (axiosError.response?.data?.error) {
                return axiosError.response.data.error;
            }
            if (axiosError.message) {
                return axiosError.message;
            }
        }
        return 'An unexpected error occurred';
    }
}

// Export singleton instance
export const api = new ApiClient();
export default api;

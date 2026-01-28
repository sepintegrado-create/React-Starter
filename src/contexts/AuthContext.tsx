import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Company, UserRole, AuthContextType } from '../types/user';
import { mockUsers, getUserByEmail, getCompaniesByUser, getCompanyById } from '../data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
    const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('sepi_user');
        const storedCompany = localStorage.getItem('sepi_current_company');
        const storedRole = localStorage.getItem('sepi_current_role');

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setCurrentRole((storedRole as UserRole) || parsedUser.role);

            if (storedCompany) {
                setCurrentCompany(JSON.parse(storedCompany));
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundUser = getUserByEmail(email);

        if (!foundUser || foundUser.password !== password) {
            throw new Error('Email ou senha inválidos');
        }

        if (!foundUser.twoFactorVerified) {
            throw new Error('Verificação de 2FA necessária');
        }

        setUser(foundUser);
        setIsAuthenticated(true);
        setCurrentRole(foundUser.role);

        // If user is company admin, set first company as current
        if (foundUser.role === UserRole.COMPANY_ADMIN && foundUser.companies && foundUser.companies.length > 0) {
            const companies = getCompaniesByUser(foundUser.id);
            if (companies.length > 0) {
                setCurrentCompany(companies[0]);
                localStorage.setItem('sepi_current_company', JSON.stringify(companies[0]));
            }
        } else if (foundUser.role === UserRole.EMPLOYEE && foundUser.employeeOf && foundUser.employeeOf.length > 0) {
            // If user is employee, set their employer company as current
            const companyId = foundUser.employeeOf[0].companyId;
            const company = getCompanyById(companyId);
            if (company) {
                setCurrentCompany(company);
                localStorage.setItem('sepi_current_company', JSON.stringify(company));
            }
        }

        // Store in localStorage
        localStorage.setItem('sepi_user', JSON.stringify(foundUser));
        localStorage.setItem('sepi_current_role', foundUser.role);
    };

    const logout = (): void => {
        setUser(null);
        setCurrentCompany(null);
        setCurrentRole(UserRole.USER);
        setIsAuthenticated(false);

        localStorage.removeItem('sepi_user');
        localStorage.removeItem('sepi_current_company');
        localStorage.removeItem('sepi_current_role');

        // Log audit trail
        console.log('User logged out:', new Date().toISOString());
    };

    const register = async (userData: Partial<User>): Promise<void> => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newUser: User = {
            id: `user-${Date.now()}`,
            cpf: userData.cpf || '',
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            password: userData.password || '',
            role: UserRole.USER,
            twoFactorEnabled: true,
            twoFactorVerified: false, // Needs 2FA verification
            acceptedTerms: userData.acceptedTerms || false,
            acceptedTermsAt: userData.acceptedTermsAt,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // In production, this would save to backend
        mockUsers.push(newUser);

        // Don't auto-login, require 2FA first
        console.log('User registered:', newUser.email);
    };

    const switchRole = (role: UserRole, companyId?: string): void => {
        if (!user) return;

        // Validate role switch is allowed
        if (role === UserRole.PLATFORM_ADMIN && user.role !== UserRole.PLATFORM_ADMIN) {
            throw new Error('Acesso negado');
        }

        if (role === UserRole.COMPANY_ADMIN) {
            if (!user.companies || user.companies.length === 0) {
                throw new Error('Usuário não possui empresas associadas');
            }

            if (companyId) {
                const companies = getCompaniesByUser(user.id);
                const company = companies.find(c => c.id === companyId);
                if (company) {
                    setCurrentCompany(company);
                    localStorage.setItem('sepi_current_company', JSON.stringify(company));
                }
            }
        }

        if (role === UserRole.EMPLOYEE) {
            if (!user.employeeOf || user.employeeOf.length === 0) {
                throw new Error('Usuário não é funcionário de nenhuma empresa');
            }
            // Set company context for employee
            const companyId = user.employeeOf[0].companyId;
            const company = getCompanyById(companyId);
            if (company) {
                setCurrentCompany(company);
                localStorage.setItem('sepi_current_company', JSON.stringify(company));
            }
        }

        setCurrentRole(role);
        localStorage.setItem('sepi_current_role', role);

        // Log role switch
        console.log('Role switched:', { from: currentRole, to: role, timestamp: new Date().toISOString() });
    };

    const verify2FA = async (code: string): Promise<boolean> => {
        // Simulate API call to verify 2FA code
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock verification - in production, verify with backend
        if (code.length === 6 && /^\d+$/.test(code)) {
            if (user) {
                const updatedUser = { ...user, twoFactorVerified: true };
                setUser(updatedUser);
                localStorage.setItem('sepi_user', JSON.stringify(updatedUser));
            }
            return true;
        }

        return false;
    };

    const updateUser = (userData: Partial<User>): void => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('sepi_user', JSON.stringify(updatedUser));

            // Sync with mockUsers for consistent simulation
            const index = mockUsers.findIndex(u => u.id === user.id);
            if (index !== -1) {
                mockUsers[index] = updatedUser;
            }
        }
    };

    const value: AuthContextType = {
        user,
        currentCompany,
        currentRole,
        isAuthenticated,
        login,
        logout,
        register,
        switchRole,
        updateUser,
        verify2FA
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

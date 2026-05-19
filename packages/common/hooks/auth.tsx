'use client';

// No-auth stub. The app runs without login; chat data lives in PostgreSQL
// and is not tied to a user. These mirror the small slice of the Clerk API
// the app consumed so call sites keep working unchanged.

import React from 'react';

export const useUser = () => ({
    isSignedIn: true as boolean,
    isLoaded: true as boolean,
    user: null as null | {
        id?: string;
        fullName?: string;
        imageUrl?: string;
        hasImage?: boolean;
    },
});

export const useAuth = () => ({
    isSignedIn: true as boolean,
    isLoaded: true as boolean,
    userId: null as string | null,
    getToken: async () => null as string | null,
});

export const useClerk = () => ({
    openUserProfile: () => {},
    openSignIn: () => {},
    signOut: async () => {},
    redirectToSignIn: () => {},
});

export const useSignIn = () => ({
    signIn: null as any,
    isLoaded: true as boolean,
    setActive: async (_: any) => {},
});

export const useSignUp = () => ({
    signUp: null as any,
    isLoaded: true as boolean,
    setActive: async (_: any) => {},
});

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
);

export const SignInButton = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
);

export const UserButton = () => null;

export const AuthenticateWithRedirectCallback = () => null;

export const isClerkAPIResponseError = (_err: unknown): boolean => false;

import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
    loginWithEmail: async (email: string, password: string) => {
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (error) throw error;

        return data;
    },

    signUpWithEmail: async (
        email: string,
        password: string,
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/signin`
            }
        })

        if (error) throw error

        return data.user;
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://avaluz.app/home'
            }
        });

        if (error) throw error;
    },

    resetPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
        });

        if (error) throw error;
    },

    updatePassword: async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
    },

    getMyProfile: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .single();

        if (error) throw error;

        return data;
    }

};

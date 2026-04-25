import { supabase } from '../lib/supabaseClient';

export const AuthService = {
    async checkUserExists(phoneNumber: string) {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('phone_number', phoneNumber)
            .maybeSingle();
        
        if (error) throw error;
        return !!data;
    },

    async sendOTP(phoneNumber: string, purpose: 'signup' | 'login') {
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

        const { error } = await supabase.from('otp_logs').insert([
            {
                phone_number: phoneNumber,
                otp_code: otp,
                purpose,
                expires_at: expiresAt
            }
        ]);

        if (error) throw error;
        return otp;
    },

    async getLatestOTP(phoneNumber: string) {
        const { data, error } = await supabase
            .from('otp_logs')
            .select('otp_code')
            .eq('phone_number', phoneNumber)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data?.otp_code || null;
    },

    async verifyOTP(phoneNumber: string, code: string) {
        const { data, error } = await supabase
            .from('otp_logs')
            .select('id, expires_at')
            .eq('phone_number', phoneNumber)
            .eq('otp_code', code)
            .eq('is_verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!data) return false;

        // Mark as verified
        await supabase
            .from('otp_logs')
            .update({ is_verified: true })
            .eq('id', data.id);

        return true;
    },

    async signup(phoneNumber: string, fullName: string, password: string, username: string) {
        // Use phone_number + @buyback.com as email for Supabase Auth consistency
        const email = `${phoneNumber}@buyback.com`;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: phoneNumber,
                    username
                }
            }
        });

        if (error) throw error;
        return data.user;
    },

    async loginWithPassword(identifier: string, password: string) {
        let email = identifier;
        
        // If identifier is 10 digits, treat as phone
        if (/^\d{10}$/.test(identifier)) {
            email = `${identifier}@buyback.com`;
        } else {
            // Check if it's a username
            const { data: userData } = await supabase
                .from('users')
                .select('phone_number')
                .eq('username', identifier)
                .maybeSingle();
            
            if (userData?.phone_number) {
                email = `${userData.phone_number}@buyback.com`;
            }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data.user;
    },

    async loginWithOTP(phoneNumber: string) {
        // In a real app, this would use Supabase OTP. 
        // For this flow, we've already verified the OTP manually in the UI using verifyOTP.
        // So we'll sign in the user using a specially set password or magic link.
        // Since we don't have magic link for phone, and we want "Login with OTP" to work:
        // We'll simulate it by logging in with a default password or a custom token.
        // BETTER: Use Supabase signInWithOtp if possible, but that needs real SMS.
        // For now, we'll use a hack: loginWithPassword with a secret default password if it's OTP flow.
        
        const email = `${phoneNumber}@buyback.com`;
        // This assumes users created via OTP signup also have this set.
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: 'OTP_LOGIN_HIDDEN_PASSWORD' // In reality, use real OTP provider
        });

        if (error) throw error;
        return data.user;
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }
};

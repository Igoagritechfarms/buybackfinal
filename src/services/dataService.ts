import { supabase } from '../lib/supabaseClient';

export const DataService = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        
        if (error) throw error;
        return data;
    },

    async updateProfile(userId: string, updates: { full_name?: string; phone_number?: string }) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getBankDetails(userId: string) {
        const { data, error } = await supabase
            .from('bank_details')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        
        if (error) throw error;
        return data;
    },

    async upsertBankDetails(userId: string, details: {
        account_holder_name: string;
        bank_name: string;
        account_number: string;
        ifsc_code: string;
        upi_number?: string;
    }) {
        const { data, error } = await supabase
            .from('bank_details')
            .upsert({
                user_id: userId,
                ...details,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async submitForm(userId: string, formData: any) {
        const { data, error } = await supabase
            .from('form_submissions')
            .insert([
                { user_id: userId, form_data: formData }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getAllUsersAdmin() {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                profiles:user_profiles(*),
                bank:bank_details(*)
            `);
        
        if (error) throw error;
        return data;
    },

    async searchUsersAdmin(query: string) {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                profiles:user_profiles(*),
                bank:bank_details(*)
            `)
            .or(`phone_number.ilike.%${query}%,username.ilike.%${query}%`);
        
        if (error) throw error;
        return data;
    }
};

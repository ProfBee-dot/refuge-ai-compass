
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/superbaseClient';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

export const useSupabase = () => {
  // Campaigns
  const createCampaign = async (campaignData: {
    title: string;
    description: string;
    target_amount: number;
    category: string;
    days_left: number;
  }) => {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const getCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  // Chat messages
  const saveChatMessage = async (message: string, response?: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        message,
        response,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const getChatHistory = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  };

  // Needs assessments
  const createNeedsAssessment = async (assessmentData: {
    family_size: number;
    location: string;
    urgent_needs: string[];
    medical_needs?: string;
    housing_situation?: string;
    employment_status?: string;
    additional_info?: string;
    priority_level?: string;
  }) => {
    const { data, error } = await supabase
      .from('needs_assessments')
      .insert(assessmentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const getNeedsAssessments = async () => {
    const { data, error } = await supabase
      .from('needs_assessments')
      .select('*, user_profiles(full_name, email)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  // Donations
  const createDonation = async (donationData: {
    campaign_id: string;
    amount: number;
    donor_name?: string;
    donor_email?: string;
    message?: string;
    anonymous?: boolean;
  }) => {
    const { data, error } = await supabase
      .from('donations')
      .insert(donationData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update campaign raised amount
    await updateCampaignRaisedAmount(donationData.campaign_id);
    
    return data;
  };

  const updateCampaignRaisedAmount = async (campaignId: string) => {
    // Get total donations for campaign
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('amount')
      .eq('campaign_id', campaignId)
      .eq('payment_status', 'completed');
    
    if (donationsError) throw donationsError;
    
    const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const donorCount = donations.length;
    
    // Update campaign
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        raised_amount: totalRaised,
        donor_count: donorCount 
      })
      .eq('id', campaignId);
    
    if (updateError) throw updateError;
  };

  return {
    supabase,
    createCampaign,
    getCampaigns,
    saveChatMessage,
    getChatHistory,
    createNeedsAssessment,
    getNeedsAssessments,
    createDonation,
    updateCampaignRaisedAmount,
  };
};

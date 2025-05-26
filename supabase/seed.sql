
-- Insert test users (these will be created via authentication, this is just for profile data)
-- Note: You'll need to sign up these users through the auth system first

-- Test campaigns
INSERT INTO public.campaigns (title, description, target_amount, raised_amount, donor_count, days_left, status, category) VALUES
('Emergency Medical Supplies for Syrian Families', 'Urgent medical supplies needed for 200 families in refugee camps', 50000.00, 32500.00, 127, 12, 'urgent', 'Medical'),
('Education Support for Refugee Children', 'School supplies and educational materials for displaced children', 25000.00, 18750.00, 89, 25, 'active', 'Education'),
('Winter Clothing Distribution', 'Warm clothing for families facing harsh winter conditions', 35000.00, 35000.00, 156, 0, 'completed', 'Clothing'),
('Food Security Program', 'Monthly food packages for 500 families', 75000.00, 45000.00, 203, 18, 'active', 'Food'),
('Legal Aid Services', 'Legal assistance for asylum seekers and refugees', 30000.00, 12000.00, 65, 30, 'active', 'Legal');

-- Test donations
INSERT INTO public.donations (campaign_id, amount, donor_name, donor_email, message, anonymous, payment_status) VALUES
((SELECT id FROM public.campaigns WHERE title LIKE 'Emergency Medical%' LIMIT 1), 500.00, 'John Smith', 'john@example.com', 'Hope this helps', false, 'completed'),
((SELECT id FROM public.campaigns WHERE title LIKE 'Education Support%' LIMIT 1), 250.00, 'Anonymous Donor', 'donor@example.com', 'For the children', true, 'completed'),
((SELECT id FROM public.campaigns WHERE title LIKE 'Winter Clothing%' LIMIT 1), 1000.00, 'Sarah Johnson', 'sarah@example.com', 'Stay warm!', false, 'completed');

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================
-- This creates some sample data for testing
-- Only run this if you want test data

-- Note: This assumes you have at least 2 users signed up
-- You can get user IDs from: SELECT id, email FROM public.profiles;

-- Example: Create a sample group chat
-- Replace the UUIDs with actual user IDs from your profiles table
/*
INSERT INTO public.chats (name, type) 
VALUES ('General Discussion', 'group');

-- Get the chat ID and add participants
-- INSERT INTO public.chat_participants (chat_id, user_id) 
-- VALUES 
--   ('your-chat-id-here', 'user-id-1'),
--   ('your-chat-id-here', 'user-id-2');

-- Add a sample message
-- INSERT INTO public.messages (content, sender_id, chat_id)
-- VALUES ('Welcome to the chat!', 'user-id-1', 'your-chat-id-here');
*/

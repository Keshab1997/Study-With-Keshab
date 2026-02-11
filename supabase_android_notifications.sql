-- Supabase SQL Editor এ এই পুরো code copy-paste করে Run করুন
-- আপনার existing Supabase project এ শুধু এই table যোগ করুন

-- 1. Android Notifications Table তৈরি করুন
CREATE TABLE IF NOT EXISTS android_notifications (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- 2. RLS Enable করুন
ALTER TABLE android_notifications ENABLE ROW LEVEL SECURITY;

-- 3. Insert Policy (সবাই insert করতে পারবে - কারণ admin panel থেকে পাঠাবেন)
DROP POLICY IF EXISTS "Allow all insert" ON android_notifications;
CREATE POLICY "Allow all insert" 
ON android_notifications
FOR INSERT 
TO public
WITH CHECK (true);

-- 4. Select Policy (সবাই read করতে পারবে)
DROP POLICY IF EXISTS "Allow all read" ON android_notifications;
CREATE POLICY "Allow all read" 
ON android_notifications
FOR SELECT 
TO public
USING (true);

-- 5. Realtime Enable করুন (already enabled থাকলে error আসবে না)
DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE android_notifications;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

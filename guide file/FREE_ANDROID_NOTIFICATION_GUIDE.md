# Free Android Notification Setup (Supabase)

## ✅ সম্পূর্ণ FREE সমাধান!

Firebase Cloud Functions এর পরিবর্তে **Supabase Database** ব্যবহার করা হচ্ছে।

## 🔧 Setup করুন:

### 1. Supabase Dashboard এ যান
https://supabase.com/dashboard

### 2. নতুন Table তৈরি করুন
Table name: `android_notifications`

Columns:
- `id` (int8, primary key, auto-increment)
- `title` (text)
- `message` (text)
- `created_at` (timestamp)
- `is_read` (boolean, default: false)

### 3. Row Level Security (RLS) Enable করুন
```sql
-- Insert policy (শুধু authenticated users)
CREATE POLICY "Allow authenticated insert" ON android_notifications
FOR INSERT TO authenticated
USING (true);

-- Select policy (সবাই read করতে পারবে)
CREATE POLICY "Allow public read" ON android_notifications
FOR SELECT TO anon
USING (true);
```

## 📱 Android App Setup

আপনার Android app এ এই code যোগ করুন:

```kotlin
// Supabase থেকে notification fetch করুন
val supabase = createSupabaseClient(
    supabaseUrl = "https://yofmaciyxrwvqyzyltml.supabase.co",
    supabaseKey = "YOUR_ANON_KEY"
)

// Realtime subscription
supabase.from("android_notifications")
    .on(SupabaseEvent.INSERT) { payload ->
        val title = payload.new["title"]
        val message = payload.new["message"]
        showNotification(title, message)
    }
    .subscribe()
```

## ✅ কিভাবে কাজ করে?

1. Admin panel থেকে notification পাঠান
2. Supabase database এ save হয়
3. Android app realtime subscription দিয়ে instantly পায়
4. Local notification show করে

## 💰 খরচ: 100% FREE!

Supabase free tier:
- 500MB database
- Unlimited API requests
- Realtime subscriptions

## 🎉 এখন কাজ করবে!

Admin panel থেকে notification পাঠান - Android app পাবে!

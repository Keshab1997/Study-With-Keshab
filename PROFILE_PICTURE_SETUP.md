# Profile Picture Upload Setup (বিনামূল্যে)

## ImgBB API Key পেতে:

1. **ImgBB এ যান:** https://api.imgbb.com/
2. **"Get API Key" বাটনে ক্লিক করুন**
3. **Sign up/Login করুন** (Google account দিয়ে করতে পারেন)
4. **API Key কপি করুন**

## Setup করুন:

1. `js/profile.js` ফাইল খুলুন
2. Line 186 এ `YOUR_IMGBB_API_KEY` এর জায়গায় আপনার API key পেস্ট করুন:

```javascript
const response = await fetch('https://api.imgbb.com/1/upload?key=আপনার_API_KEY_এখানে', {
```

## বৈশিষ্ট্য:

✅ **সম্পূর্ণ বিনামূল্যে** - কোনো payment লাগবে না
✅ **সহজ** - শুধু API key লাগবে
✅ **দ্রুত** - ছবি তাৎক্ষণিক আপলোড হবে
✅ **নিরাপদ** - HTTPS encrypted
✅ **সীমা:** দিনে 5000 uploads (যথেষ্ট)

## কিভাবে কাজ করবে:

1. User camera icon এ ক্লিক করবে
2. ছবি select করবে (সর্বোচ্চ 2MB)
3. ছবি ImgBB এ upload হবে
4. URL Firebase Auth ও Firestore এ save হবে
5. Profile picture update হবে

## Alternative (যদি ImgBB না চান):

**Cloudinary** (বিনামূল্যে 25GB storage):
- https://cloudinary.com/
- Sign up করুন
- Upload preset তৈরি করুন
- Code এ API endpoint পরিবর্তন করুন

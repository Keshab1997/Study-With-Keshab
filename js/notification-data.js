// js/notification-data.js

const allNotifications = [
  // --- নতুন যোগ করা নোটিফিকেশন ---
  {
    id: 'notification-009',
    title: 'রসায়ন কুইজ প্রতিযোগিতা',
    message: 'পর্যায় সারণী অধ্যায়ের উপর একটি অনলাইন কুইজ আয়োজন করা হয়েছে। অংশগ্রহণ করতে লিঙ্কে ক্লিক করুন।',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // ২ ঘন্টা আগে
    link: 'subject/Chemistry.html#quiz',
    isNew: true,
  },
  {
    id: 'notification-008',
    title: 'ডিসেম্বর মাসের নতুন রুটিন',
    message: 'ডিসেম্বর মাসের সম্পূর্ণ ক্লাস রুটিন প্রকাশ করা হয়েছে। আপনার ড্যাশবোর্ড থেকে ডাউনলোড করুন।',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // ১ দিন আগে
    link: 'dashboard.html#routine',
    isNew: true,
  },
  {
    id: 'notification-007',
    title: 'ইংরেজি গ্রামার লেকচার',
    message: 'Tense-এর উপর নতুন ভিডিও লেকচার আপলোড করা হয়েছে। আপনার দুর্বলতা কাটিয়ে উঠুন।',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // ২ দিন আগে
    link: 'subject/English.html#video-lecture',
    isNew: true,
  },
  {
    id: 'notification-006',
    title: 'ছুটির বিজ্ঞপ্তি',
    message: 'বিশেষ কারণে আগামী সোমবার সকল লাইভ ক্লাস বন্ধ থাকবে।',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // ৩ দিন আগে
    link: '#announcements',
    isNew: true,
  },
  // --- পুরনো নোটিফিকেশনগুলো ---
  {
    id: 'notification-005',
    title: 'গণিত মক টেস্ট',
    message: 'আগামী শুক্রবার গণিতের উপর একটি সম্পূর্ণ মক টেস্ট অনুষ্ঠিত হবে। সবাই প্রস্তুত থাকুন।',
    timestamp: '2024-05-20T10:00:00Z',
    link: 'subject/Math.html#mock-test',
    isNew: true, // এটিও নতুন হিসেবে রাখা হলো পরীক্ষার জন্য
  },
  {
    id: 'notification-004',
    title: 'জীববিজ্ঞানের নতুন নোট',
    message: 'কোষ বিভাজন অধ্যায়ের উপর নতুন PDF নোট আপলোড করা হয়েছে। এখনি ডাউনলোড করুন।',
    timestamp: '2024-05-18T15:30:00Z',
    link: 'subject/Biology.html#notes',
    isNew: false,
  },
  {
    id: 'notification-003',
    title: 'ওয়েবসাইট আপডেট',
    message: 'আমাদের ওয়েবসাইটে নতুন ফিডব্যাক সেকশন যোগ করা হয়েছে। আপনার মতামত দিন।',
    timestamp: '2024-05-15T12:00:00Z',
    link: '#feedback-module',
    isNew: false,
  },
  {
    id: 'notification-002',
    title: 'পদার্থবিজ্ঞানের লাইভ ক্লাস',
    message: 'আজ রাত ৮টায় ভৌত বিজ্ঞানের নতুন অধ্যায়ের উপর লাইভ ক্লাস হবে।',
    timestamp: '2024-05-12T09:00:00Z',
    link: '#', // কোনো নির্দিষ্ট লিঙ্ক না থাকলে # দিন
    isNew: false,
  },
  {
    id: 'notification-001',
    title: 'স্বাগতম!',
    message: 'Study With Keshab প্ল্যাটফর্মে আপনাকে স্বাগতম। আপনার শেখার যাত্রা শুভ হোক।',
    timestamp: '2024-05-10T18:00:00Z',
    link: 'about.html',
    isNew: false,
  }
];

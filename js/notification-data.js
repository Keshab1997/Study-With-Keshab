// js/notification-data.js

const allNotifications = [
  {
    id: 'notification-005',
    title: 'গণিত মক টেস্ট',
    message: 'আগামী শুক্রবার গণিতের উপর একটি সম্পূর্ণ মক টেস্ট অনুষ্ঠিত হবে। সবাই প্রস্তুত থাকুন।',
    timestamp: '2024-11-20T10:00:00Z',
    link: 'subject/Math.html#mock-test',
    isNew: true, // নতুন বোঝানোর জন্য
  },
  {
    id: 'notification-004',
    title: 'জীববিজ্ঞানের নতুন নোট',
    message: 'কোষ বিভাজন অধ্যায়ের উপর নতুন PDF নোট আপলোড করা হয়েছে। এখনি ডাউনলোড করুন।',
    timestamp: '2024-11-18T15:30:00Z',
    link: 'subject/Biology.html#notes',
    isNew: false,
  },
  {
    id: 'notification-003',
    title: 'ওয়েবসাইট আপডেট',
    message: 'আমাদের ওয়েবসাইটে নতুন ফিডব্যাক সেকশন যোগ করা হয়েছে। আপনার মতামত দিন।',
    timestamp: '2024-11-15T12:00:00Z',
    link: '#feedback-module',
    isNew: false,
  },
  {
    id: 'notification-002',
    title: 'পদার্থবিজ্ঞানের লাইভ ক্লাস',
    message: 'আজ রাত ৮টায় ভৌত বিজ্ঞানের নতুন অধ্যায়ের উপর লাইভ ক্লাস হবে।',
    timestamp: '2024-11-12T09:00:00Z',
    link: '#', // কোনো নির্দিষ্ট লিঙ্ক না থাকলে # দিন
    isNew: false,
  },
  {
    id: 'notification-001',
    title: 'স্বাগতম!',
    message: 'Study With Keshab প্ল্যাটফর্মে আপনাকে স্বাগতম। আপনার শেখার যাত্রা শুভ হোক।',
    timestamp: '2024-11-10T18:00:00Z',
    link: 'about.html',
    isNew: false,
  }
];
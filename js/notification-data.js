// js/notification-data.js

// নোটিফিকেশনের জন্য একটি গ্লোবাল ভেরিয়েবল তৈরি করা হলো, যাতে অন্য স্ক্রিপ্ট থেকেও পাওয়া যায়।
const notificationData = [
  {
    id: 101,
    icon: 'fa-solid fa-book-open', // Font Awesome আইকন ক্লাস
    title: 'নতুন অধ্যায় যোগ হয়েছে',
    message: 'পদার্থবিজ্ঞানের "তরঙ্গ" অধ্যায়ে নতুন লেকচার যোগ করা হয়েছে।',
    link: 'subject/physics.html#chapter-wave', // নির্দিষ্ট অধ্যায়ের লিঙ্ক
    date: '2025-08-15',
  },
  {
    id: 102,
    icon: 'fa-solid fa-bullhorn', // Font Awesome আইকন ক্লাস
    title: 'বিশেষ அறிவிপ্তি',
    message: 'আগামী শুক্রবার একটি লাইভ কুইজ প্রতিযোগিতা অনুষ্ঠিত হবে।',
    link: '#', // কোনো নির্দিষ্ট লিঙ্ক না থাকলে # দিন
    date: '2025-08-14',
  },
  {
    id: 103,
    icon: 'fa-solid fa-file-pdf',
    title: 'রসায়নের নোটস',
    message: '"জৈব যৌগ" অধ্যায়ের সম্পূর্ণ নোটস PDF আকারে আপলোড করা হয়েছে।',
    link: 'subject/Chemistry.html#notes',
    date: '2025-08-12',
  },
  {
    id: 104,
    icon: 'fa-solid fa-circle-info',
    title: 'সিস্টেম আপডেট',
    message: 'আমাদের ওয়েবসাইটে নতুন ফিডব্যাক সিস্টেম যোগ করা হয়েছে।',
    link: 'index.html#feedback-module',
    date: '2025-08-10',
  },
  {
    id: 66,
    icon: 'fa-solid fa-palette',
    title: 'ডিজাইন আপডেট',
    message: 'আপনার জন্য ওয়েবসাইটের ডিজাইন আরও সুন্দর করা হয়েছে।',
    link: '#',
    date: '2025-08-01',
  },
];
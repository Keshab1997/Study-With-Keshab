# Study With Keshab - Educational Platform

## Overview
"Study With Keshab" is a comprehensive Bengali educational platform that provides interactive learning materials across multiple subjects. The platform features classes, quizzes, revision materials, and a CBT (Computer-Based Testing) system for various academic subjects.

## Current State
- **Technology Stack**: HTML, CSS, JavaScript with Firebase integration
- **Architecture**: Static website with Firebase backend for authentication and real-time notifications
- **Content Areas**: Biology, Physics, Chemistry, Mathematics, General Knowledge, History, and Chhaya Prakashani materials
- **Features**: Interactive quizzes, flashcards, PDF notes, CBT exam system, user authentication, notifications

## Project Structure
- **Root**: Main navigation and landing page (index.html)
- **subject/**: Contains subject-specific learning modules
  - Biology/ - Various biology topics with classes, quizzes, and revision materials
  - Physics/ - Physics content with interactive lessons
  - chhaya/ - Chhaya Prakashani practice sets and materials
- **css/**: Styling files
- **js/**: JavaScript functionality including Firebase configuration
- **images/**: Educational images and subject icons
- **auth.js**: Authentication logic
- **Firebase integration**: Real-time notifications, user management

## Key Features
1. **Interactive Learning**: Classes with embedded content and navigation
2. **Assessment System**: Multiple quiz sets per topic with scoring
3. **Revision Materials**: Specialized revision content and MCQs
4. **CBT Exam**: External computer-based testing system
5. **User Authentication**: Login/signup with Firebase
6. **Progressive Web App**: Service worker for offline capabilities
7. **Responsive Design**: Mobile and desktop view modes
8. **Real-time Notifications**: Firebase-powered notification system

## Recent Changes
- Project setup initiated on September 11, 2025
- Ready to be configured as a web application

## User Preferences
- Prefers Bengali language interface
- Educational content should be interactive and engaging
- Focus on student-centric learning experience

## Technical Notes
- Uses Firebase v8.10.0 for backend services
- Implements PWA features with service worker
- Responsive design with viewport toggling
- Base href set to "/Study-With-Keshab/" for deployment
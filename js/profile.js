document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Check if user is logged in
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        loadUserProfile(user);
    });
    
    // Load user profile
    function loadUserProfile(user) {
        const userRef = db.collection('users').doc(user.uid);
        
        userRef.get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Update profile info
                document.getElementById('profile-pic').src = user.photoURL || 'images/default-avatar.png';
                document.getElementById('profile-name').textContent = user.displayName || 'ব্যবহারকারী';
                document.getElementById('profile-email').textContent = user.email;
                document.getElementById('profile-role').textContent = userData.role === 'admin' ? 'Admin' : 'Student';
                
                // Update editable fields
                document.getElementById('edit-name').value = user.displayName || '';
                document.getElementById('edit-email').value = user.email || '';
                document.getElementById('edit-phone').value = userData.phone || '';
                document.getElementById('edit-address').value = userData.address || '';
                
                // Update stats
                document.getElementById('completed-exams').textContent = userData.completedQuizzesCount || 0;
                document.getElementById('total-score').textContent = userData.totalScore || 0;
                
                // Calculate member since
                if (userData.createdAt) {
                    const createdDate = userData.createdAt.toDate();
                    const now = new Date();
                    const diffTime = Math.abs(now - createdDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    document.getElementById('member-since').textContent = diffDays + ' দিন';
                }
                
                // Load recent activity
                loadRecentActivity(user.uid);
            }
        }).catch(error => {
            console.error('Error loading profile:', error);
        });
    }
    
    // Load recent activity
    function loadRecentActivity(userId) {
        const activityList = document.getElementById('recent-activity');
        
        // Load from users collection chapters data
        db.collection('users').doc(userId).get()
            .then(doc => {
                if (!doc.exists || !doc.data().chapters) {
                    activityList.innerHTML = '<p>এখনো কোনো কুইজ দেওয়া হয়নি</p>';
                    return;
                }
                
                const chapters = doc.data().chapters;
                const activities = [];
                let totalQuizzes = 0;
                let totalScore = 0;
                
                // Extract quiz data from chapters
                Object.keys(chapters).forEach(chapterName => {
                    const chapter = chapters[chapterName];
                    if (chapter.quiz_sets) {
                        Object.keys(chapter.quiz_sets).forEach(quizName => {
                            const quiz = chapter.quiz_sets[quizName];
                            totalQuizzes++;
                            totalScore += (quiz.score || 0);
                            activities.push({
                                name: `${chapterName} - ${quizName}`,
                                score: quiz.score || 0,
                                total: quiz.totalQuestions || 0,
                                date: quiz.attemptedAt
                            });
                        });
                    }
                });
                
                // Update stats with calculated values
                document.getElementById('completed-exams').textContent = totalQuizzes;
                document.getElementById('total-score').textContent = totalScore;
                
                if (activities.length === 0) {
                    activityList.innerHTML = '<p>এখনো কোনো কুইজ দেওয়া হয়নি</p>';
                    return;
                }
                
                // Sort by date and show last 5
                activities.sort((a, b) => b.date - a.date);
                activityList.innerHTML = '';
                
                activities.slice(0, 5).forEach(activity => {
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    const dateStr = activity.date ? activity.date.toDate().toLocaleDateString('en-GB') : 'N/A';
                    activityItem.innerHTML = `
                        <h4>${activity.name}</h4>
                        <p>স্কোর: ${activity.score}/${activity.total} | তারিখ: ${dateStr}</p>
                    `;
                    activityList.appendChild(activityItem);
                });
            })
            .catch(error => {
                console.log('Activity load error:', error);
                activityList.innerHTML = '<p>এখনো কোনো কুইজ দেওয়া হয়নি</p>';
            });
    }
    
    // Edit profile functionality
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    editBtn.addEventListener('click', () => {
        document.getElementById('edit-name').disabled = false;
        document.getElementById('edit-phone').disabled = false;
        document.getElementById('edit-address').disabled = false;
        
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-flex';
        cancelBtn.style.display = 'inline-flex';
    });
    
    cancelBtn.addEventListener('click', () => {
        document.getElementById('edit-name').disabled = true;
        document.getElementById('edit-phone').disabled = true;
        document.getElementById('edit-address').disabled = true;
        
        editBtn.style.display = 'inline-flex';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        // Reload profile to reset values
        auth.currentUser && loadUserProfile(auth.currentUser);
    });
    
    saveBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        if (!user) return;
        
        const newName = document.getElementById('edit-name').value.trim();
        const newPhone = document.getElementById('edit-phone').value.trim();
        const newAddress = document.getElementById('edit-address').value.trim();
        
        // Update display name
        user.updateProfile({
            displayName: newName
        }).then(() => {
            // Update Firestore
            return db.collection('users').doc(user.uid).update({
                displayName: newName,
                phone: newPhone,
                address: newAddress
            });
        }).then(() => {
            alert('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
            
            document.getElementById('edit-name').disabled = true;
            document.getElementById('edit-phone').disabled = true;
            document.getElementById('edit-address').disabled = true;
            
            editBtn.style.display = 'inline-flex';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            
            loadUserProfile(user);
        }).catch(error => {
            console.error('Error updating profile:', error);
            alert('প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
        });
    });
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('আপনি কি লগআউট করতে চান?')) {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            }).catch(error => {
                console.error('Logout error:', error);
            });
        }
    });
    
    // Avatar edit - Using ImgBB free image hosting
    document.getElementById('edit-avatar-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) {
                alert('ছবির আকার ২ MB এর কম হতে হবে।');
                return;
            }
            
            const user = auth.currentUser;
            if (!user) return;
            
            // Show loading
            const editBtn = document.getElementById('edit-avatar-btn');
            editBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            editBtn.disabled = true;
            
            // Convert to base64
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result.split(',')[1];
                
                // Upload to ImgBB (free image hosting)
                const formData = new FormData();
                formData.append('image', base64Image);
                
                try {
                    const response = await fetch('https://api.imgbb.com/1/upload?key=13567a95e9fe3a212a8d8d10da9f3267', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        const imageUrl = data.data.url;
                        
                        // Update Firebase Auth profile
                        await user.updateProfile({ photoURL: imageUrl });
                        
                        // Update Firestore
                        await db.collection('users').doc(user.uid).update({ photoURL: imageUrl });
                        
                        // Update UI
                        document.getElementById('profile-pic').src = imageUrl;
                        alert('প্রোফাইল ছবি আপডেট হয়েছে!');
                    } else {
                        alert('ছবি আপলোড করতে সমস্যা হয়েছে।');
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    alert('ছবি আপলোড করতে সমস্যা হয়েছে।');
                } finally {
                    editBtn.innerHTML = '<i class="fas fa-camera"></i>';
                    editBtn.disabled = false;
                }
            };
            
            reader.readAsDataURL(file);
        };
        
        input.click();
    });
});

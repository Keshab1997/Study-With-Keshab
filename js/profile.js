document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        loadUserProfile(user);
    });

    function loadUserProfile(user) {
        const userRef = db.collection('users').doc(user.uid);

        userRef.get().then(doc => {
            if (!doc.exists) return;
            const userData = doc.data();

            document.getElementById('profile-pic').src = user.photoURL || 'images/default-avatar.png';
            document.getElementById('profile-name').textContent = user.displayName || 'ব্যবহারকারী';
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('profile-role').textContent = userData.role === 'admin' ? 'Admin' : 'Student';

            document.getElementById('edit-name').value = user.displayName || '';
            document.getElementById('edit-email').value = user.email || '';
            document.getElementById('edit-phone').value = userData.phone || '';
            document.getElementById('edit-address').value = userData.address || '';

            const createdDate = userData.createdAt ? userData.createdAt.toDate() : new Date();
            const daysSince = Math.ceil((new Date() - createdDate) / (1000 * 60 * 60 * 24));
            document.getElementById('member-since').textContent = daysSince + ' দিন';

            loadQuizData(user.uid, userData);
        }).catch(console.error);
    }

    function loadQuizData(userId, userData) {
        const chapters = userData.chapters || {};
        const allActivities = [];
        let totalQuizzes = 0, totalScore = 0, totalCorrect = 0, totalQuestions = 0;
        let highestScore = 0;
        const studyDates = new Set();
        const subjectStats = {};

        Object.keys(chapters).forEach(chapterName => {
            const chapter = chapters[chapterName];
            const subjectName = chapterName.split(' - ')[0] || chapterName;

            if (!subjectStats[subjectName]) {
                subjectStats[subjectName] = { total: 0, done: 0, quizzes: 0, score: 0 };
            }

            if (chapter.quiz_sets) {
                Object.keys(chapter.quiz_sets).forEach(quizName => {
                    const quiz = chapter.quiz_sets[quizName];
                    totalQuizzes++;
                    totalScore += quiz.score || 0;
                    totalCorrect += quiz.correctAnswers || quiz.score || 0;
                    const qTotal = quiz.totalQuestions || 0;
                    totalQuestions += qTotal;
                    if ((quiz.score || 0) > highestScore) highestScore = quiz.score || 0;

                    subjectStats[subjectName].total += qTotal;
                    subjectStats[subjectName].done += quiz.score || 0;
                    subjectStats[subjectName].quizzes++;
                    subjectStats[subjectName].score += quiz.score || 0;

                    if (quiz.attemptedAt) {
                        const d = quiz.attemptedAt.toDate();
                        studyDates.add(d.toDateString());
                    }

                    allActivities.push({
                        subject: subjectName,
                        name: quizName,
                        score: quiz.score || 0,
                        total: qTotal,
                        correct: quiz.correctAnswers || quiz.score || 0,
                        date: quiz.attemptedAt
                    });
                });
            }
        });

        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
        const streak = calculateStreak(Array.from(studyDates));

        document.getElementById('completed-exams').textContent = totalQuizzes;
        document.getElementById('total-score').textContent = totalScore;
        document.getElementById('avg-accuracy').textContent = accuracy + '%';
        document.getElementById('study-streak').textContent = streak + ' দিন';
        document.getElementById('highest-score').textContent = highestScore;

        renderSubjectProgress(subjectStats, totalQuizzes);
        renderQuizHistory(allActivities);
    }

    function calculateStreak(dates) {
        if (dates.length === 0) return 0;
        const sorted = dates.map(d => new Date(d)).sort((a, b) => b - a);
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);

        for (const d of sorted) {
            d.setHours(0, 0, 0, 0);
        }

        for (let i = 0; i < sorted.length; i++) {
            const diff = Math.round((checkDate - sorted[i]) / (1000 * 60 * 60 * 24));
            if (diff === 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (diff > 0) {
                break;
            }
        }
        return streak;
    }

    function renderSubjectProgress(subjectStats, totalQuizzes) {
        const container = document.getElementById('subject-progress');
        const keys = Object.keys(subjectStats);
        if (keys.length === 0) {
            container.innerHTML = '<p>কোনো বিষয় শুরু করা হয়নি</p>';
            return;
        }
        container.innerHTML = '';
        keys.forEach(name => {
            const stat = subjectStats[name];
            const pct = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
            const div = document.createElement('div');
            div.className = 'subject-progress-item';
            div.innerHTML = `
                <div class="subject-progress-header">
                    <span class="subject-name">${name}</span>
                    <span class="subject-quiz-count">${stat.quizzes}টি কুইজ</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width:${pct}%"></div>
                </div>
                <div class="subject-progress-footer">
                    <span>স্কোর: ${stat.score}</span>
                    <span>${pct}%</span>
                </div>
            `;
            container.appendChild(div);
        });
    }

    function renderQuizHistory(activities) {
        const tbody = document.getElementById('quiz-history-body');
        if (activities.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">কোনো কুইজ দেওয়া হয়নি</td></tr>';
            return;
        }
        activities.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date.toDate() - a.date.toDate();
        });
        tbody.innerHTML = '';
        activities.forEach(a => {
            const dateStr = a.date ? a.date.toDate().toLocaleDateString('bn-BD', {
                day: 'numeric', month: 'short', year: 'numeric'
            }) : '—';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${a.subject}</td>
                <td>${a.name}</td>
                <td>${a.score}/${a.total}</td>
                <td>${a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0}%</td>
                <td>${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Edit profile
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    editBtn.addEventListener('click', () => {
        ['edit-name', 'edit-phone', 'edit-address'].forEach(id => document.getElementById(id).disabled = false);
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-flex';
        cancelBtn.style.display = 'inline-flex';
    });

    cancelBtn.addEventListener('click', () => {
        ['edit-name', 'edit-phone', 'edit-address'].forEach(id => document.getElementById(id).disabled = true);
        editBtn.style.display = 'inline-flex';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        if (auth.currentUser) loadUserProfile(auth.currentUser);
    });

    saveBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        if (!user) return;
        const newName = document.getElementById('edit-name').value.trim();
        const newPhone = document.getElementById('edit-phone').value.trim();
        const newAddress = document.getElementById('edit-address').value.trim();

        user.updateProfile({ displayName: newName }).then(() => {
            return db.collection('users').doc(user.uid).update({
                displayName: newName, phone: newPhone, address: newAddress
            });
        }).then(() => {
            alert('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
            ['edit-name', 'edit-phone', 'edit-address'].forEach(id => document.getElementById(id).disabled = true);
            editBtn.style.display = 'inline-flex';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            loadUserProfile(user);
        }).catch(() => alert('প্রোফাইল আপডেট করতে সমস্যা হয়েছে।'));
    });

    // Change password
    document.getElementById('change-password-btn').addEventListener('click', () => {
        const user = auth.currentUser;
        if (!user) return;
        const currentPassword = prompt('বর্তমান পাসওয়ার্ড দিন:');
        if (!currentPassword) return;
        const newPassword = prompt('নতুন পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর):');
        if (!newPassword || newPassword.length < 6) {
            alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
            return;
        }
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        user.reauthenticateWithCredential(credential).then(() => {
            return user.updatePassword(newPassword);
        }).then(() => {
            alert('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
        }).catch(error => {
            if (error.code === 'auth/wrong-password') {
                alert('বর্তমান পাসওয়ার্ড ভুল।');
            } else {
                alert('পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।');
            }
        });
    });

    // Delete account
    document.getElementById('delete-account-btn').addEventListener('click', () => {
        if (!confirm('আপনি কি নিশ্চিত? আপনার অ্যাকাউন্ট ও সব ডেটা মুছে যাবে।')) return;
        if (!confirm('আপনি কি সত্যিই আপনার অ্যাকাউন্ট মুছে ফেলতে চান? এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।')) return;
        const user = auth.currentUser;
        if (!user) return;
        const password = prompt('নিশ্চিতকরণের জন্য আপনার পাসওয়ার্ড দিন:');
        if (!password) return;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        user.reauthenticateWithCredential(credential).then(() => {
            return db.collection('users').doc(user.uid).delete();
        }).then(() => {
            return user.delete();
        }).then(() => {
            alert('অ্যাকাউন্ট মুছে ফেলা হয়েছে।');
            window.location.href = 'index.html';
        }).catch(error => {
            if (error.code === 'auth/wrong-password') {
                alert('পাসওয়ার্ড ভুল।');
            } else {
                alert('অ্যাকাউন্ট মুছতে সমস্যা হয়েছে।');
            }
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('আপনি কি লগআউট করতে চান?')) {
            auth.signOut().then(() => window.location.href = 'index.html').catch(console.error);
        }
    });

    // Avatar edit
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
            const btn = document.getElementById('edit-avatar-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result.split(',')[1];
                const formData = new FormData();
                formData.append('image', base64Image);
                try {
                    const res = await fetch('https://api.imgbb.com/1/upload?key=13567a95e9fe3a212a8d8d10da9f3267', {
                        method: 'POST', body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        const url = data.data.url;
                        await user.updateProfile({ photoURL: url });
                        await db.collection('users').doc(user.uid).update({ photoURL: url });
                        document.getElementById('profile-pic').src = url;
                        alert('প্রোফাইল ছবি আপডেট হয়েছে!');
                    } else {
                        alert('ছবি আপলোড করতে সমস্যা হয়েছে।');
                    }
                } catch {
                    alert('ছবি আপলোড করতে সমস্যা হয়েছে।');
                } finally {
                    btn.innerHTML = '<i class="fas fa-camera"></i>';
                    btn.disabled = false;
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });
});

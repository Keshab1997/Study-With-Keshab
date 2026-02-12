// Modern Feedback Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('modern-feedback-form');
    
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.feedback-submit-btn');
            const formContainer = this.closest('.feedback-modern-container');
            const successMessage = formContainer.querySelector('.feedback-success');
            
            // Get form data
            const formData = {
                name: document.getElementById('feedback-name').value,
                email: document.getElementById('feedback-email').value,
                rating: document.querySelector('input[name="rating"]:checked')?.value || '0',
                category: document.getElementById('feedback-category').value,
                message: document.getElementById('feedback-message').value,
                timestamp: new Date().toISOString()
            };
            
            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';
            
            try {
                // Check if user is logged in
                const user = firebase.auth().currentUser;
                if (!user) {
                    alert('মতামত পাঠাতে প্রথমে লগইন করুন।');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>মতামত পাঠান</span> <i class="fas fa-paper-plane"></i>';
                    return;
                }
                
                // Save to Firestore
                const db = firebase.firestore();
                await db.collection('feedbacks').add({
                    ...formData,
                    userId: user.uid,
                    userEmail: user.email
                });
                
                // Show success message
                this.style.display = 'none';
                successMessage.style.display = 'block';
                showToast('মতামত সফলভাবে পাঠানো হয়েছে!', 'success');
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    this.reset();
                    this.style.display = 'block';
                    successMessage.style.display = 'none';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>মতামত পাঠান</span> <i class="fas fa-paper-plane"></i>';
                }, 3000);
                
            } catch (error) {
                console.error('Error submitting feedback:', error);
                showToast('মতামত পাঠাতে সমস্যা হয়েছে।', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>মতামত পাঠান</span> <i class="fas fa-paper-plane"></i>';
            }
        });
        
        // Star rating interaction
        const stars = document.querySelectorAll('.feedback-rating label');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.color = '#ffd700';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });
    }
});

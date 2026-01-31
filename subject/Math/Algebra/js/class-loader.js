// js/class-loader.js
const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('id');

document.addEventListener("DOMContentLoaded", async () => {
    if (!classId) {
        document.getElementById("class-content").innerHTML = "<p>ক্লাস আইডি পাওয়া যায়নি।</p>";
        return;
    }

    const db = firebase.firestore();
    
    // কন্টেন্ট লোড
    try {
        const doc = await db.collection("class_notes").doc(classId).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById("class-content").innerHTML = data.content;
            document.getElementById("class-title").innerText = data.title;
            
            // বুকমার্ক সেভ
            localStorage.setItem("last_read_algebra", classId);
        } else {
            document.getElementById("class-content").innerHTML = "<p>এই ক্লাসের কন্টেন্ট পাওয়া যায়নি।</p>";
        }
    } catch (error) {
        console.error("Error loading class:", error);
        document.getElementById("class-content").innerHTML = "<p>কন্টেন্ট লোড করতে সমস্যা হয়েছে।</p>";
    }

    // কমেন্ট লোড (Real-time)
    db.collection("comments")
      .where("classId", "==", classId)
      .orderBy("timestamp", "desc")
      .onSnapshot(snapshot => {
          const commentDiv = document.getElementById("comments-list");
          if (commentDiv) {
              commentDiv.innerHTML = snapshot.docs.map(d => {
                  const data = d.data();
                  return `
                      <div class="comment">
                          <strong>${data.userName || 'Anonymous'}</strong>: ${data.text}
                          <small>${data.timestamp ? data.timestamp.toDate().toLocaleString('bn-BD') : ''}</small>
                      </div>
                  `;
              }).join('');
          }
      });
});

async function postComment() {
    const textInput = document.getElementById("comment-input");
    const text = textInput.value.trim();
    const user = firebase.auth().currentUser;
    
    if (!text) {
        alert("কিছু লিখুন!");
        return;
    }
    
    if (!user) {
        alert("লগইন করুন!");
        return;
    }

    try {
        await firebase.firestore().collection("comments").add({
            classId: classId,
            userName: user.displayName || user.email || "Anonymous",
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        textInput.value = "";
    } catch (error) {
        console.error("Error posting comment:", error);
        alert("কমেন্ট পোস্ট করতে সমস্যা হয়েছে।");
    }
}
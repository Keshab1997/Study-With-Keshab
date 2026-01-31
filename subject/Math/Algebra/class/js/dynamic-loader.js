document.addEventListener("DOMContentLoaded", async () => {
    const db = firebase.firestore();
    const contentDiv = document.getElementById("dynamic-content");
    const titleDiv = document.getElementById("dynamic-title");
    const docId = document.getElementById("page-doc-id").value;

    if (!docId) return;

    contentDiv.innerHTML = '<div class="loader" style="margin: 50px auto;"></div>';

    // ১. ক্যাশ থেকে ডেটা আনার চেষ্টা (যাতে পেজ দ্রুত লোড হয়)
    const cachedData = localStorage.getItem("note_" + docId);
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        renderContent(parsedData.title, parsedData.content);
    }

    // ২. ব্যাকগ্রাউন্ডে ফায়ারবেস থেকে লেটেস্ট ডেটা চেক করা
    try {
        const doc = await db.collection("class_notes").doc(docId).get();
        
        if (doc.exists) {
            const serverData = doc.data();
            
            // যদি ক্যাশ না থাকে অথবা সার্ভারের ডেটা নতুন হয়
            if (!cachedData || JSON.stringify(serverData) !== JSON.stringify(JSON.parse(cachedData).raw)) {
                console.log("New update found! Refreshing content...");
                
                renderContent(serverData.title, serverData.content);

                // নতুন ডেটা ক্যাশে সেভ করা
                const cacheObj = {
                    title: serverData.title,
                    content: serverData.content,
                    raw: serverData, // তুলনা করার জন্য মূল ডেটা রাখা হলো
                    timestamp: new Date().getTime()
                };
                localStorage.setItem("note_" + docId, JSON.stringify(cacheObj));
            } else {
                console.log("Content is up to date.");
            }
        } else {
            if(!cachedData) contentDiv.innerHTML = "<p style='text-align:center; color:red;'>নোট পাওয়া যায়নি।</p>";
        }
    } catch (error) {
        console.error("Error fetching update:", error);
        // ইন্টারনেট না থাকলে ক্যাশ ডেটাই থাকবে
    }

    // --- রেন্ডার ফাংশন ---
    function renderContent(title, content) {
        if(titleDiv) titleDiv.innerText = title;
        contentDiv.innerHTML = content;
        formatMathAndStyle(contentDiv);
        
        // ইমেজ ফিক্স
        const images = contentDiv.getElementsByTagName('img');
        for(let img of images) {
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            img.style.borderRadius = "8px";
        }
    }

    // --- ম্যাজিক ফরম্যাটিং ---
    function formatMathAndStyle(container) {
        let html = container.innerHTML;
        html = html.replace(/\$\$(.*?)\$\$/g, function(match, mathContent) {
            let formattedMath = mathContent.replace(/(\w+|\d+)\/(\w+|\d+)/g, function(m, top, bottom) {
                return `<span class="fraction"><span class="top">${top}</span><span class="bottom">${bottom}</span></span>`;
            });
            formattedMath = formattedMath.replace(/\^(\d+)/g, "<sup>$1</sup>");
            return `<div class="math-box">${formattedMath}</div>`;
        });
        container.innerHTML = html;
    }
});
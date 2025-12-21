// js/orientation.js

document.addEventListener("DOMContentLoaded", function () {
    // চেক করা হচ্ছে ব্রাউজারে এই ফিচার আছে কিনা
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("portrait-primary")
            .catch(function (error) {
                // এরর আসলে কনসোলে লাল দাগ না দেখিয়ে চুপচাপ থাকবে
                console.log("Orientation lock not supported or blocked: ", error);
            });
    }
});
// Orientation control for Study With Keshab
if ('orientation' in screen) {
  try {
    // Allow both portrait and landscape if rotation is enabled
    screen.orientation.lock('any');
  } catch (err) {
    console.log("Orientation lock failed:", err);
  }
}
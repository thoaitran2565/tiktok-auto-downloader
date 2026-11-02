document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('toggleBtn');

  // Lấy trạng thái hiện tại từ content script trên tab đang mở
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url || !tab.url.includes("tiktok.com")) {
    toggleBtn.innerText = "Chỉ dùng trên TikTok";
    toggleBtn.disabled = true;
    return;
  }

  // Hỏi trạng thái chạy hiện tại của content script
  chrome.tabs.sendMessage(tab.id, { action: "getStatus" }, (response) => {
    if (response && response.isRunning) {
      toggleBtn.innerText = "Dừng lại";
      toggleBtn.classList.add("running");
    } else {
      toggleBtn.innerText = "Bắt đầu";
      toggleBtn.classList.remove("running");
    }
  });

  // Xử lý khi bấm nút Bắt đầu / Dừng
  toggleBtn.addEventListener('click', async () => {
    chrome.tabs.sendMessage(tab.id, { action: "toggle" }, (response) => {
      if (response && response.isRunning) {
        toggleBtn.innerText = "Dừng lại";
        toggleBtn.classList.add("running");
      } else {
        toggleBtn.innerText = "Bắt đầu";
        toggleBtn.classList.remove("running");
      }
    });
  });
});
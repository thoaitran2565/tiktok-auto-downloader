let isRunning = false;
let timer = null;

// Lắng nghe tín hiệu bật/tắt từ Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getStatus") {
    sendResponse({ isRunning: isRunning });
  } else if (request.action === "toggle") {
    isRunning = !isRunning;
    if (isRunning) {
      startAutomation();
    } else {
      stopAutomation();
    }
    sendResponse({ isRunning: isRunning });
  }
});

function startAutomation() {
  console.log("TikTok Auto Downloader: Đã BẮT ĐẦU");
  runStep();
}

function stopAutomation() {
  console.log("TikTok Auto Downloader: Đã DỪNG");
  isRunning = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

// Hàm mô phỏng sự kiện chuột chính xác với composed: true
function simulateMouseEvent(element, eventType, clientX, clientY) {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    button: eventType === 'contextmenu' ? 2 : 0,
    buttons: eventType === 'contextmenu' ? 2 : 1,
    clientX: clientX,
    clientY: clientY
  });
  element.dispatchEvent(event);
}

// Hàm hỗ trợ chờ một phần tử xuất hiện (chống treo khi mạng lag)
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      if (!isRunning) {
        clearInterval(interval);
        resolve(null);
        return;
      }

      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        resolve(null);
      }
    }, 200);
  });
}

// Các hàm quản lý lịch sử video đã tải trong localStorage
function getDownloadedHistory() {
  try {
    const history = localStorage.getItem('tiktok_downloaded_history');
    return history ? JSON.parse(history) : [];
  } catch (e) {
    return [];
  }
}

function saveToHistory(videoTitle) {
  try {
    const history = getDownloadedHistory();
    if (!history.includes(videoTitle)) {
      history.push(videoTitle);
      // Giới hạn lưu tối đa 500 video gần nhất để không làm nặng bộ nhớ trình duyệt
      if (history.length > 500) {
        history.shift();
      }
      localStorage.setItem('tiktok_downloaded_history', JSON.stringify(history));
    }
  } catch (e) {
    console.error("Lỗi lưu lịch sử:", e);
  }
}

// Quy trình tự động tuần tự
async function runStep() {
  if (!isRunning) return;

  // 1. Chờ video xuất hiện
  const videoElement = await waitForElement('video, [data-e2e="browse-video"]', 15000);
  
  if (!videoElement || !isRunning) {
    console.log("Không tìm thấy video hoặc đã dừng, đang thử lại...");
    timer = setTimeout(runStep, 2000);
    return;
  }

  const rect = videoElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    timer = setTimeout(runStep, 1000);
    return;
  }

  // 2. Lấy tên/tiêu đề video từ thẻ <span data-e2e="new-desc-span">
  const titleElement = document.querySelector('[data-e2e="new-desc-span"]');
  const videoTitle = titleElement ? titleElement.innerText.trim() : "";

  // Nếu tìm thấy tên video, kiểm tra xem đã có trong lịch sử chưa
  if (videoTitle) {
    const history = getDownloadedHistory();
    if (history.includes(videoTitle)) {
      console.log(`[DỪNG TOOL] Video này đã có trong lịch sử: "${videoTitle}"`);
      alert(`Tool đã dừng vì gặp video đã tải trước đó: "${videoTitle}"`);
      stopAutomation();
      return; // Dừng hẳn, không chạy tiếp nữa
    }
  } else {
    console.log("Không lấy được tên video, tiếp tục tiến trình...");
  }

  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  console.log("Đang giả lập chuột phải vào video...");

  // 3. Thực hiện chuỗi sự kiện chuột phải để mở menu
  simulateMouseEvent(videoElement, 'mousedown', x, y);
  simulateMouseEvent(videoElement, 'contextmenu', x, y);
  simulateMouseEvent(videoElement, 'mouseup', x, y);

  // 4. Chờ menu ngữ cảnh và nút tải xuống xuất hiện
  const downloadBtn = await waitForElement('[data-e2e="right-click-menu-popover_download-video"]', 5000);
  
  if (!isRunning) return;

  if (downloadBtn) {
    console.log("Đã tìm thấy nút 'Tải về video', tiến hành click...");
    downloadBtn.click();
    
    // Nếu tải thành công và có tên video, tiến hành lưu vào lịch sử
    if (videoTitle) {
      saveToHistory(videoTitle);
      console.log(`Đã lưu vào lịch sử: "${videoTitle}"`);
    }
  } else {
    console.log("Menu không hiện lên kịp do lag, đang thử lại bước này...");
    document.body.click();
    timer = setTimeout(runStep, 2000);
    return;
  }

  await sleep(1500);
  if (!isRunning) return;

  // 5. Chờ nút chuyển video tiếp theo xuất hiện và click
  const nextVideoBtn = await waitForElement('[data-e2e="arrow-right"]', 10000);
  
  if (!isRunning) return;

  if (nextVideoBtn) {
    console.log("Đang chuyển sang video tiếp theo...");
    nextVideoBtn.click();
  } else {
    console.log("Không tìm thấy nút mũi tên phải, kích hoạt phím tắt dự phòng...");
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      bubbles: true,
      composed: true
    }));
  }

  timer = setTimeout(runStep, 3000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
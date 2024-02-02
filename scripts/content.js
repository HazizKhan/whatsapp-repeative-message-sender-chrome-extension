var activeTab;

const addMessageQueue = (message, count) => {
  const mainEl = document.querySelector("#main");
  if (!mainEl) {
    return alert("There is no opened conversation");
  }
  const textareaEl = mainEl.querySelector('div[contenteditable="true"]');

  if (!textareaEl) {
    return alert("There is no opened conversation");
  }
  const sendMessage = (message) => {
    textareaEl.focus();
    document.execCommand("insertText", false, message);
    textareaEl.dispatchEvent(new Event("change", { bubbles: true }));

    setTimeout(() => {
      (
        mainEl.querySelector('[data-testid="send"]') ||
        mainEl.querySelector('[data-icon="send"]')
      ).click();
    }, 100);
  };
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      sendMessage(message);
    }, i * 500);
  }
};

//   addMessageQueue();

const handleSend = async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("msg");
  const msg = msgEl.value;
  const countEl = document.getElementById("times");
  const count = countEl.value;
  if (!msg.trim().length) {
    return alert("Please type a message");
  }
  if (!count || count > 50) {
    return alert("Count must be 50 or less");
  }
  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    args: [msg, count],
    func: addMessageQueue,
  });
  await chrome.scripting
    .executeScript({
      target: { tabId: activeTab.id },
      files: ["./scripts/sendMessage.js"],
    })
    .then(() => console.log("script injected"));
};
const createForm = (mainDiv) => {
  const form = document.createElement("form");
  const formContent = `
        <label>Message: <textarea id="msg"></textarea></label>
        <label>Count: <input id="times" type="number" value="10"></label>
        <p>Count must be 50 or less</p>
        <button type="submit">Send</button>
    `;

  form.innerHTML = formContent;
  form.addEventListener("submit", handleSend);
  mainDiv.appendChild(form);
};

chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
  // since only one tab should be active and in the current window at once
  // the return variable should only have one entry
  activeTab = tabs[0];
  const mainDiv = document.getElementById("main");
  if (activeTab.url.startsWith("https://web.whatsapp.com")) {
    createForm(mainDiv);
  } else {
    mainDiv.innerHTML = "This page is not supported";
  }
});

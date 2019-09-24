import { prefix } from "../constants";
import { buildShareURL, buildEmbedCode } from "../utils"

let shareContainer;
let embedContainer;
let shareImg;
let shareInput;
let embedBox;

export const toggleEmbed = (isOpen, shareConfig) => {
  if( isOpen ) {
    embedContainer.style.display = "flex";
    embedBox.value = buildEmbedCode(shareConfig);
  } else {
    embedContainer.style.display = "none";
    embedBox.value = '';
  }
}

export const toggleShare = (isOpen, dataURL, shareConfig) => {
  if (isOpen) {
    if( dataURL ) {
      shareImg.setAttribute("src", dataURL);
      shareImg.parentElement.style.display = 'block';
    } else {
      shareImg.parentElement.style.display = 'none';
    }
    shareInput.value = buildShareURL(shareConfig)
    shareContainer.style.display = "flex";
  } else {
    shareImg.removeAttribute("src");
    shareContainer.style.display = "none";
    shareInput.value = '';
  }
};

const addButtons = (map) => {
  const shareButtonContainer = document.createElement("div");
  shareButtonContainer.className = `${prefix}share-button-container`;

  const shareButton = document.createElement("button");
  shareButton.className = `${prefix}share-button`;
  shareButton.innerText = "Share Map";
  shareButtonContainer.appendChild(shareButton);

  const embedButton = document.createElement("button");
  embedButton.className = `${prefix}embed-button`;
  embedButton.innerText = "Embed Map";
  shareButtonContainer.appendChild(embedButton);

  map.appendChild(shareButtonContainer);
}

const createShareContainer = () => {
  shareInput = document.createElement("input");
  shareInput.className = `${prefix}share-input`;
  shareInput.onclick = (el) => { el.target.setSelectionRange(0, el.target.value.length) }

  const shareLinkInstructions = document.createElement("p");
  shareLinkInstructions.innerText = "Copy the link to share this view";

  shareContainer = document.createElement("div");
  shareContainer.className = `${prefix}share-container`;

  const shareImageContainer = document.createElement("div");

  const shareInstructions = document.createElement("p");
  shareInstructions.innerText = "Click to download the image.";

  const closeButton = document.createElement("button");
  closeButton.innerText = "Back to Map";
  closeButton.onclick = () => toggleShare(false);
  shareImg = document.createElement("img");

  // This is a weird one - you can't just open data-urls anymore
  // so we need to open a window then write html to it :P
  shareImg.onclick = event => {
    const newWindow = window.open();
    newWindow.document.write(`
      <body style="background: #1c313a; margin: 0; padding: 0;">
        <img src=${event.target.getAttribute("src")} style="width: 100%;">
      </body>
    `);
  };
  shareImageContainer.appendChild(shareImg);
  shareImageContainer.appendChild(shareInstructions);
  shareContainer.appendChild(shareImageContainer);
  shareContainer.appendChild(shareInput);
  shareContainer.appendChild(shareLinkInstructions);
  shareContainer.appendChild(closeButton);

  return shareContainer
}

const createEmbedContainer = () => {
  embedBox = document.createElement("textarea");
  embedBox.className = `${prefix}embed-box`;
  embedBox.onclick = (el) => { el.target.setSelectionRange(0, el.target.value.length) }

  const embedInstructions = document.createElement("p");
  embedInstructions.innerText = "Copy the code to embed this map on your site.";

  embedContainer = document.createElement("div");
  embedContainer.className = `${prefix}share-container`;

  const shareImageContainer = document.createElement("div");

  const shareInstructions = document.createElement("p");
  shareInstructions.innerText = "Click to download the image.";

  const closeButton = document.createElement("button");
  closeButton.innerText = "Back to Map";
  closeButton.onclick = () => toggleEmbed(false);

  embedContainer.appendChild(embedBox);
  embedContainer.appendChild(embedInstructions);
  embedContainer.appendChild(closeButton);

  return embedContainer
}

const createShareContent = (map) => {
  addButtons(map)

  return {
    shareContainer: createShareContainer(),
    embedContainer: createEmbedContainer()
  }
}

export default createShareContent;

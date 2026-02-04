(function() {
  'use strict';

  var CBP = window.ChatBotPro || {};
  var queue = CBP.q || [];
  var config = {};
  var iframe = null;
  var bubble = null;
  var isOpen = false;

  function init(options) {
    config = options || {};
    if (!config.botId) {
      console.error('ChatBot Pro: botId is required');
      return;
    }
    createWidget();
  }

  function createWidget() {
    // Create styles
    var style = document.createElement('style');
    style.textContent = `
      .cbp-bubble {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #6366F1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .cbp-bubble:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
      .cbp-bubble svg {
        width: 28px;
        height: 28px;
        fill: white;
      }
      .cbp-iframe {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        width: 380px;
        height: 600px;
        border: none;
        border-radius: 16px;
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.12);
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
      }
      .cbp-iframe.cbp-open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      @media (max-width: 480px) {
        .cbp-iframe {
          width: calc(100% - 20px);
          height: calc(100% - 100px);
          bottom: 10px;
          right: 10px;
        }
      }
    `;
    document.head.appendChild(style);

    // Create bubble
    bubble = document.createElement('div');
    bubble.className = 'cbp-bubble';
    bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
    bubble.onclick = toggleWidget;
    document.body.appendChild(bubble);

    // Create iframe
    iframe = document.createElement('iframe');
    iframe.className = 'cbp-iframe';
    iframe.src = getWidgetUrl();
    document.body.appendChild(iframe);

    // Listen for messages from iframe
    window.addEventListener('message', handleMessage);
  }

  function getWidgetUrl() {
    var baseUrl = document.currentScript ? 
      document.currentScript.src.replace('/widget.js', '') :
      window.location.origin;
    return baseUrl + '/widget/' + config.botId;
  }

  function toggleWidget() {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add('cbp-open');
      bubble.style.display = 'none';
    } else {
      iframe.classList.remove('cbp-open');
      bubble.style.display = 'flex';
    }
  }

  function handleMessage(event) {
    if (event.data && event.data.type === 'cbp-close') {
      isOpen = true;
      toggleWidget();
    }
  }

  // Process queued commands
  window.ChatBotPro = function() {
    var args = Array.prototype.slice.call(arguments);
    var command = args[0];
    var params = args[1];

    if (command === 'init') {
      init(params);
    }
  };

  // Process any queued calls
  for (var i = 0; i < queue.length; i++) {
    window.ChatBotPro.apply(null, queue[i]);
  }
})();

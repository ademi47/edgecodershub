// ==UserScript==
// @name         whitelist-filter
// @namespace    http://tampermonkey.net/
// @version      2025-10-13
// @description  try to take over the world!// ==UserScript==
// @name         LinkedIn Feed Whitelist Filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show only LinkedIn posts containing specific keywords (hide all others)
// @match        *://www.linkedin.com/*
// @match        *://linkedin.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // CONFIGURE YOUR KEYWORDS HERE
    // ==========================================
    const ALLOWED_KEYWORDS = [
        'gen ai',
        'web development',
        'backend',
        'programming',
        'software engineer',
        'full stack'
        // Add more keywords you want to SEE (one per line)
    ];

    // ==========================================
    // SCRIPT CONFIGURATION
    // ==========================================
    const CONFIG = {
        caseSensitive: false,  // Set to true for case-sensitive matching
        showAllowedList: true, // Show list of allowed posts
    };

    console.log('LinkedIn Whitelist Filter: Started with keywords:', ALLOWED_KEYWORDS);

    let allowedPosts = [];
    let processedPosts = new Set();

    // Function to check if text contains allowed keywords
    function containsAllowedKeyword(text) {
        if (!text) return null;

        const searchText = CONFIG.caseSensitive ? text : text.toLowerCase();

        for (let keyword of ALLOWED_KEYWORDS) {
            const searchKeyword = CONFIG.caseSensitive ? keyword : keyword.toLowerCase();
            if (searchText.includes(searchKeyword)) {
                return keyword;
            }
        }
        return null;
    }

    // Function to extract post text content
    function getPostText(post) {
        const textElements = post.querySelectorAll('.feed-shared-text, .feed-shared-update-v2__description, .update-components-text');
        let fullText = '';
        textElements.forEach(el => {
            fullText += ' ' + el.textContent;
        });
        return fullText.trim();
    }

    // Function to process posts
    function processPosts() {
        const posts = document.querySelectorAll('.feed-shared-update-v2');
        let newAllowedCount = 0;

        posts.forEach(post => {
            // Skip if already processed
            const postId = post.getAttribute('data-urn') || post.innerHTML.substring(0, 50);
            if (processedPosts.has(postId)) return;
            processedPosts.add(postId);

            // Get post content
            const postText = getPostText(post);
            const matchedKeyword = containsAllowedKeyword(postText);

            if (matchedKeyword) {
                // POST MATCHES KEYWORDS - SHOW IT WITH GREEN HIGHLIGHT
                post.style.border = '3px solid #10a37f';
                post.style.position = 'relative';
                post.style.display = 'block';

                // Get author name
                const authorElement = post.querySelector('.update-components-actor__name, .feed-shared-actor__name');
                const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown';

                // Get post preview (first 100 chars)
                const preview = postText.substring(0, 100) + '...';

                // Store allowed post info
                allowedPosts.push({
                    author: authorName,
                    keyword: matchedKeyword,
                    preview: preview,
                    timestamp: new Date().toLocaleTimeString()
                });

                // Add green label
                const label = document.createElement('div');
                label.innerHTML = `✅ MATCH: "${matchedKeyword}"`;
                label.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #10a37f;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 10;
                `;
                post.appendChild(label);

                newAllowedCount++;
                console.log(`Allowed post from ${authorName} (keyword: "${matchedKeyword}")`);
            } else {
                // POST DOESN'T MATCH - HIDE IT
                post.style.display = 'none';
            }
        });

        if (newAllowedCount > 0) {
            updateAllowedList();
        }
    }

    // Function to create/update allowed posts list
    function updateAllowedList() {
        if (!CONFIG.showAllowedList) return;

        let panel = document.getElementById('allowed-posts-panel');

        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'allowed-posts-panel';
            panel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 320px;
                max-height: 500px;
                background: white;
                border: 2px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 99999;
                overflow: hidden;
                font-family: -apple-system, system-ui, sans-serif;
            `;
            document.body.appendChild(panel);
        }

        const header = `
            <div style="background: #10a37f; color: white; padding: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span>✅ Shown Posts (${allowedPosts.length})</span>
                <button id="close-allowed-panel" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0 5px;">×</button>
            </div>
        `;

        const list = allowedPosts.slice(-10).reverse().map(post => `
            <div style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px;">
                <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${post.author}</div>
                <div style="color: #10a37f; font-weight: 600; margin-bottom: 4px;">Matched: "${post.keyword}"</div>
                <div style="color: #666; font-size: 11px; margin-bottom: 4px;">${post.preview}</div>
                <div style="color: #999; font-size: 10px;">${post.timestamp}</div>
            </div>
        `).join('');

        panel.innerHTML = header + `<div style="max-height: 430px; overflow-y: auto;">${list}</div>`;

        // Add close button functionality
        const closeBtn = document.getElementById('close-allowed-panel');
        if (closeBtn) {
            closeBtn.onclick = () => panel.remove();
        }
    }

    // Initial run
    setTimeout(() => {
        processPosts();

        // Show startup notification
        const notification = document.createElement('div');
        notification.innerHTML = `✅ Whitelist Filter Active<br><small>Showing only ${ALLOWED_KEYWORDS.length} keywords</small>`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 360px;
            background: #10a37f;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 99999;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            text-align: center;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }, 2000);

    // Watch for new posts
    const observer = new MutationObserver(() => {
        processPosts();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Periodic check
    setInterval(processPosts, 3000);

})();
// @author       You
// @match        https://claude.ai/chat/7910edc7-c225-4e29-ab63-b942f27290b2
// @icon         https://www.google.com/s2/favicons?sz=64&domain=claude.ai
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
})();
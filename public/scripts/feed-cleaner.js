// ==UserScript==
// @name         feed-cleaner
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hide LinkedIn feed posts
// @match        *://www.linkedin.com/*
// @match        *://linkedin.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('LinkedIn Feed Cleaner: Script started!');

    // Simple CSS injection
    const style = document.createElement('style');
    style.innerHTML = `
        .feed-shared-update-v2 {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    console.log('LinkedIn Feed Cleaner: CSS injected!');

    // Add visual confirmation
    setTimeout(() => {
        const indicator = document.createElement('div');
        indicator.innerHTML = '✅ Feed Cleaner Active';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #10a37f;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 99999;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(indicator);

        // Remove after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transition = 'opacity 0.5s';
            setTimeout(() => indicator.remove(), 500);
        }, 3000);
    }, 1000);

})();
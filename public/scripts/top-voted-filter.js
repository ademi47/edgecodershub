// ==UserScript==
// @name         top-voted-filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show only highly-engaged posts from past 24 hours matching keywords
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
        'AI',
        'programming',
        'web development',
        'frontend',
    ];

    // ==========================================
    // ENGAGEMENT THRESHOLDS
    // ==========================================
    const ENGAGEMENT_CONFIG = {
        minReactions: 5,      // Minimum reactions (likes, celebrates, etc.)
        minComments: 1,        // Minimum comments
        minEngagement: 10,    // Minimum total engagement (reactions + comments * 10)
        hoursLimit: 72         // Only show posts from past X hours
    };

    // ==========================================
    // SCRIPT CONFIGURATION
    // ==========================================
    const CONFIG = {
        caseSensitive: false,
        showTopPostsList: true,
        sortByEngagement: true  // Sort displayed posts by engagement score
    };

    console.log('LinkedIn Top Voted Filter: Started');

    let topPosts = [];
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

    // Function to parse post timestamp
    function getPostAge(post) {
        const timeElement = post.querySelector('.feed-shared-actor__sub-description, .update-components-actor__sub-description, time');
        if (!timeElement) return null;

        const timeText = timeElement.textContent.trim().toLowerCase();

        // Parse time patterns
        let hours = 0;

        if (timeText.includes('minute') || timeText.includes('min')) {
            const minutes = parseInt(timeText) || 0;
            hours = minutes / 60;
        } else if (timeText.includes('hour') || timeText.includes('hr')) {
            hours = parseInt(timeText) || 0;
        } else if (timeText.includes('day')) {
            const days = parseInt(timeText) || 0;
            hours = days * 24;
        } else if (timeText.includes('week')) {
            const weeks = parseInt(timeText) || 0;
            hours = weeks * 24 * 7;
        } else if (timeText.includes('month')) {
            hours = 999; // Too old
        } else if (timeText.includes('year')) {
            hours = 9999; // Too old
        } else if (timeText.includes('now') || timeText.includes('just')) {
            hours = 0;
        }

        return hours;
    }

    // Function to extract engagement metrics
    function getEngagementMetrics(post) {
        let reactions = 0;
        let comments = 0;

        // Try to find reaction count
        const reactionElement = post.querySelector('.social-details-social-counts__reactions-count, .social-details-social-counts__social-proof-container');
        if (reactionElement) {
            const reactionText = reactionElement.textContent.trim();
            reactions = parseEngagementNumber(reactionText);
        }

        // Try to find comment count
        const commentElement = post.querySelector('.social-details-social-counts__comments, [data-test-id="social-actions__comments"]');
        if (commentElement) {
            const commentText = commentElement.textContent.trim();
            comments = parseEngagementNumber(commentText);
        }

        // Calculate engagement score (comments weighted more heavily)
        const engagementScore = reactions + (comments * 10);

        return {
            reactions,
            comments,
            engagementScore
        };
    }

    // Function to parse engagement numbers (handles K, M notation)
    function parseEngagementNumber(text) {
        const match = text.match(/[\d,]+\.?\d*/);
        if (!match) return 0;

        let num = parseFloat(match[0].replace(/,/g, ''));

        if (text.includes('K') || text.includes('k')) {
            num *= 1000;
        } else if (text.includes('M') || text.includes('m')) {
            num *= 1000000;
        }

        return Math.floor(num);
    }

    // Function to process posts
    function processPosts() {
        const posts = document.querySelectorAll('.feed-shared-update-v2');
        let newTopPostsCount = 0;

        posts.forEach(post => {
            // Skip if already processed
            const postId = post.getAttribute('data-urn') || post.innerHTML.substring(0, 50);
            if (processedPosts.has(postId)) return;
            processedPosts.add(postId);

            // Get post content and check keyword match
            const postText = getPostText(post);
            const matchedKeyword = containsAllowedKeyword(postText);

            // Get post age
            const postAge = getPostAge(post);

            // Get engagement metrics
            const metrics = getEngagementMetrics(post);

            // Determine if post should be shown
            const isRecent = postAge !== null && postAge <= ENGAGEMENT_CONFIG.hoursLimit;
            const meetsEngagement = (
                metrics.reactions >= ENGAGEMENT_CONFIG.minReactions ||
                metrics.comments >= ENGAGEMENT_CONFIG.minComments ||
                metrics.engagementScore >= ENGAGEMENT_CONFIG.minEngagement
            );
            const matchesKeyword = matchedKeyword !== null;

            if (matchesKeyword && isRecent && meetsEngagement) {
                // SHOW POST WITH GREEN HIGHLIGHT
                post.style.border = '3px solid #10a37f';
                post.style.position = 'relative';
                post.style.display = 'block';

                // Get author name
                const authorElement = post.querySelector('.update-components-actor__name, .feed-shared-actor__name');
                const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown';

                // Add engagement badge
                const badge = document.createElement('div');
                badge.innerHTML = `
                    ✅ TOP POST<br>
                    <small>🔥 ${metrics.reactions} reactions | 💬 ${metrics.comments/1000000} comments</small><br>
                    <small>📌 "${matchedKeyword}"</small>
                `;
                badge.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: linear-gradient(135deg, #10a37f 0%, #0d8f6f 100%);
                    color: white;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: bold;
                    z-index: 10;
                    text-align: center;
                    line-height: 1.4;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                `;
                post.appendChild(badge);

                // Store top post info
                topPosts.push({
                    author: authorName,
                    keyword: matchedKeyword,
                    reactions: metrics.reactions,
                    comments: metrics.comments,
                    engagementScore: metrics.engagementScore,
                    age: postAge,
                    timestamp: new Date().toLocaleTimeString(),
                    element: post
                });

                newTopPostsCount++;
                console.log(`Top post from ${authorName}: ${metrics.reactions} reactions, ${metrics.comments} comments (keyword: "${matchedKeyword}")`);
            } else {
                // HIDE POST
                post.style.display = 'none';
            }
        });

        if (newTopPostsCount > 0) {
            // Sort posts by engagement if enabled
            if (CONFIG.sortByEngagement) {
                sortPostsByEngagement();
            }
            updateTopPostsList();
        }
    }

    // Function to sort posts by engagement
    function sortPostsByEngagement() {
        const container = document.querySelector('.feed-shared-update-v2')?.parentElement;
        if (!container) return;

        // Sort topPosts array by engagement score
        topPosts.sort((a, b) => b.engagementScore - a.engagementScore);

        // Reorder DOM elements
        topPosts.forEach((post, index) => {
            if (post.element && post.element.style.display !== 'none') {
                container.appendChild(post.element);
            }
        });
    }

    // Function to create/update top posts list
    function updateTopPostsList() {
        if (!CONFIG.showTopPostsList) return;

        let panel = document.getElementById('top-posts-panel');

        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'top-posts-panel';
            panel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 340px;
                max-height: 600px;
                background: white;
                border: 2px solid #10a37f;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                z-index: 99999;
                overflow: hidden;
                font-family: -apple-system, system-ui, sans-serif;
            `;
            document.body.appendChild(panel);
        }

        // Sort by engagement score for display
        const sortedPosts = [...topPosts].sort((a, b) => b.engagementScore - a.engagementScore);

        const header = `
            <div style="background: linear-gradient(135deg, #10a37f 0%, #0d8f6f 100%); color: white; padding: 14px; font-weight: bold;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>🔥 Top Posts (${topPosts.length})</span>
                    <button id="close-top-panel" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0 5px;">×</button>
                </div>
                <div style="font-size: 10px; font-weight: normal; margin-top: 4px; opacity: 0.9;">
                    Past 24hrs • ${ENGAGEMENT_CONFIG.minEngagement}+ engagement
                </div>
            </div>
        `;

        const list = sortedPosts.slice(0, 15).map((post, index) => `
            <div style="padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; ${index === 0 ? 'background: #f0fdf4;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                    <div style="font-weight: bold; color: #333; flex: 1;">${post.author}</div>
                    <div style="background: #10a37f; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                        #${index + 1}
                    </div>
                </div>
                <div style="color: #10a37f; font-weight: 600; margin-bottom: 6px; font-size: 11px;">
                    📌 "${post.keyword}"
                </div>
                <div style="display: flex; gap: 12px; margin-bottom: 4px;">
                    <span style="color: #666; font-size: 11px;">❤️ ${post.reactions}</span>
                    <span style="color: #666; font-size: 11px;">💬 ${post.comments}</span>
                    <span style="color: #10a37f; font-size: 11px; font-weight: bold;">🔥 ${post.engagementScore}</span>
                </div>
                <div style="color: #999; font-size: 10px;">
                    ${post.age < 1 ? 'Just now' : post.age < 24 ? Math.floor(post.age) + 'h ago' : '24h ago'} • ${post.timestamp}
                </div>
            </div>
        `).join('');

        panel.innerHTML = header + `<div style="max-height: 530px; overflow-y: auto;">${list || '<div style="padding: 20px; text-align: center; color: #999;">No top posts yet...</div>'}</div>`;

        // Add close button functionality
        const closeBtn = document.getElementById('close-top-panel');
        if (closeBtn) {
            closeBtn.onclick = () => panel.remove();
        }
    }

    // Initial run
    setTimeout(() => {
        processPosts();

        // Show startup notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            🔥 Top Voted Filter Active<br>
            <small>24hrs • ${ENGAGEMENT_CONFIG.minEngagement}+ engagement</small><br>
            <small>${ALLOWED_KEYWORDS.length} keywords tracked</small>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 380px;
            background: linear-gradient(135deg, #10a37f 0%, #0d8f6f 100%);
            color: white;
            padding: 14px 22px;
            border-radius: 8px;
            z-index: 99999;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            text-align: center;
            line-height: 1.5;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }, 2000);

    // Watch for new posts
    const observer = new MutationObserver(() => {
        processPosts();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Periodic check and re-sort
    setInterval(() => {
        processPosts();
    }, 5000);

})();
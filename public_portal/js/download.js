// Download page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Track download clicks
    const downloadButtons = document.querySelectorAll('.download-btn');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const os = this.getAttribute('data-os');
            trackDownload(os);

            // Show thank you message
            showDownloadMessage(os);
        });
    });

    // Auto-detect OS and highlight appropriate download
    detectOS();
});

function detectOS() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'mac';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'windows';
    }

    if (os) {
        const card = document.querySelector(`[data-os="${os}"]`)?.closest('.download-card');
        if (card) {
            card.style.border = '3px solid var(--primary-color)';
            card.style.transform = 'scale(1.05)';
        }
    }
}

function trackDownload(os) {
    // Track download analytics
    console.log(`Download started: ${os}`);

    // In production, send to analytics
    // fetch('/api/public/download-stats', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ os, timestamp: new Date().toISOString() })
    // });
}

function showDownloadMessage(os) {
    const message = document.createElement('div');
    message.className = 'download-message';
    message.innerHTML = `
        <div class="message-content">
            <h3>✓ Download Started!</h3>
            <p>Your FEDRAL.AI agent for ${os === 'mac' ? 'macOS' : 'Windows'} is downloading...</p>
            <p><strong>Next steps:</strong></p>
            <ol>
                <li>Open the downloaded file</li>
                <li>Follow the welcome wizard</li>
                <li>Start analyzing your patient data!</li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
        </div>
    `;

    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    const content = message.querySelector('.message-content');
    content.style.cssText = `
        background: white;
        padding: 3rem;
        border-radius: 16px;
        max-width: 500px;
        text-align: center;
    `;

    const button = message.querySelector('button');
    button.style.cssText = `
        margin-top: 1.5rem;
        padding: 0.75rem 2rem;
        background: linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    `;

    document.body.appendChild(message);
}

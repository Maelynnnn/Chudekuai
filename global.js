if (!localStorage.getItem('first_visit_time')) {
    localStorage.setItem('first_visit_time', Date.now());
}

setInterval(() => {
    const isReserved = localStorage.getItem('live_reserved') === 'true';
    const isShown = localStorage.getItem('live_popup_shown') === 'true';

    const firstVisitTime = parseInt(localStorage.getItem('first_visit_time') || Date.now());
    const absoluteTriggerTime = firstVisitTime - 1200000;

    if (isReserved && !isShown) {
        if (Date.now() >= absoluteTriggerTime) {
            const isMinimized = localStorage.getItem('live_notice_minimized') === 'true';

            if (isMinimized) {
                showLiveFloatingBubble();
            } else {
                showGlobalNotification();
            }
        }
    }
}, 1000);

function showGlobalNotification() {
    if (document.getElementById('global-live-notice')) return;
    if (document.getElementById('global-live-bubble')) {
        document.getElementById('global-live-bubble').remove();
    }

    const notice = document.createElement('div');
    notice.id = 'global-live-notice';
    notice.className = 'global-notification';
    notice.innerHTML = `
        <div class="notice-content">
            <div class="notice-text">
                <p class="notice-title">[直播开播通知]</p>
                <p class="notice-body">您预约的名厨私房菜直播现已正式开播，点击进入查看</p>
            </div>
        </div>
        <span class="notice-close">&times;</span>
    `;

    document.body.appendChild(notice);

    notice.addEventListener('click', (e) => {
        if (e.target.className === 'notice-close') {
            e.stopPropagation();

            // 最小化live
            notice.remove();
            localStorage.setItem('live_notice_minimized', 'true');
            showLiveFloatingBubble();
            return;
        }

        handleLiveAccess();
    });
}

function showLiveFloatingBubble() {
    if (document.getElementById('global-live-bubble')) return;
    if (document.getElementById('global-live-notice')) return;

    const bubble = document.createElement('div');
    bubble.id = 'global-live-bubble';
    bubble.className = 'global-live-bubble';
    bubble.innerHTML = `
        <div class="bubble-live-dot"></div>
        <div class="bubble-live-text">直播进行中</div>
    `;

    document.body.appendChild(bubble);

    bubble.addEventListener('click', () => {
        bubble.remove();
        localStorage.setItem('live_notice_minimized', 'false');
        showGlobalNotification();
    });
}

function handleLiveAccess() {
    let accessKey = prompt("[安全验证] 该直播间为加密内测专场，请输入正确的入场密钥(全拼)：");

    if (accessKey) {
        if (accessKey.trim().toLowerCase() === 'baobeihuijia') {
            localStorage.setItem('live_popup_shown', 'true');
            localStorage.setItem('live_notice_minimized', 'false');

            const notice = document.getElementById('global-live-notice');
            const bubble = document.getElementById('global-live-bubble');

            if (notice) notice.remove();
            if (bubble) bubble.remove();

            window.location.href = 'live_room.html';
        } else {
            alert("[验证失败] 密钥错误！无法进入该保密直播间。");
        }
    }
}

// 邮箱创建通知

window.addEventListener('DOMContentLoaded', () => {
    const shouldShowMailNotice = localStorage.getItem('mail_created_notice_pending') === 'true';
    const isMailCreated = localStorage.getItem('mail_created') === 'true';

    if (shouldShowMailNotice && isMailCreated) {
        setTimeout(() => {
            showMailCreatedNotification();
        }, 800);
    }
});

function showMailCreatedNotification() {
    if (document.getElementById('mail-created-notice')) return;

    const username = localStorage.getItem('mail_username') || 'DESKTOP-UNKNOWN';
    const password = localStorage.getItem('mail_password') || 'chudekuai123';

    const notice = document.createElement('div');
    notice.id = 'mail-created-notice';
    notice.className = 'global-notification mail-created-notification';

    notice.innerHTML = `
        <div class="notice-content">
            <div class="notice-text">
                <p class="notice-title">[系统通知] 您的邮箱已被创建</p>
                <p class="notice-body">用户名：${username}</p>
                <p class="notice-body">初始密码：${password}</p>
            </div>
        </div>
        <span class="notice-close">&times;</span>
    `;

    document.body.appendChild(notice);

    notice.addEventListener('click', (e) => {
        if (e.target.className === 'notice-close') {
            e.stopPropagation();
            notice.remove();
            localStorage.setItem('mail_created_notice_pending', 'false');
            return;
        }

        localStorage.setItem('mail_created_notice_pending', 'false');
        // window.location.href = 'contact.html';
    });
}
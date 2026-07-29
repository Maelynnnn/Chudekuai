(() => {
    const CHANNEL_NAME = 'newworld_consciousness';
    const channel = new BroadcastChannel(CHANNEL_NAME);

    window.NewWorldLink = {
        channel,
        send(type, detail = {}) {
            channel.postMessage({
                type,
                detail,
                sentAt: Date.now()
            });
        },
        onMessage(handler) {
            channel.addEventListener('message', (event) => {
                const message = event.data;
                if (!message || typeof message.type !== 'string') return;
                handler(message);
            });
        }
    };
})();

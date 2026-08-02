(function () {
    const CHANNEL_NAME = 'newworld_consciousness';
    let channel = null;
    const listeners = new Set();

    try {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener('message', (event) => {
            const message = event.data;
            if (!message || typeof message.type !== 'string') return;
            listeners.forEach((listener) => listener(message));
        });
    } catch (error) {
        console.warn('BroadcastChannel unavailable:', error);
    }

    window.NewWorldLink = {
        send(type, payload = {}) {
            const message = {
                type,
                payload,
                sentAt: Date.now(),
                source: location.pathname
            };

            if (channel) channel.postMessage(message);
            listeners.forEach((listener) => listener(message));
        },

        onMessage(listener) {
            if (typeof listener !== 'function') return () => {};
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
})();

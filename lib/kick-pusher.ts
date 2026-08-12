import Pusher from 'pusher-js';

const KICK_PUSHER_KEY = '32cbd69e4b950bf97679';
const KICK_PUSHER_CLUSTER = 'us2';

let pusherInstance: Pusher | null = null;

export const getPusherInstance = () => {
    if (!pusherInstance) {
        pusherInstance = new Pusher(KICK_PUSHER_KEY, {
            cluster: KICK_PUSHER_CLUSTER,
            forceTLS: true,
        });
    }
    return pusherInstance;
};

export const subscribeToKickChat = <TMessage>(
    chatroomId: string | number,
    onMessage: (data: TMessage) => void
) => {
    const pusher = getPusherInstance();
    const channelName = `chatrooms.${chatroomId}.v2`;
    const channel = pusher.subscribe(channelName);

    channel.bind('App\\Events\\ChatMessageEvent', (data: TMessage) => {
        onMessage(data);
    });

    return channel;
};

export const unsubscribeFromKickChat = (chatroomId: string | number) => {
    const pusher = getPusherInstance();
    const channelName = `chatrooms.${chatroomId}.v2`;
    pusher.unsubscribe(channelName);
};

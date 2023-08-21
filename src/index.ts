import { $query, $update, Record, Vec, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// This is a global variable that is stored on the heap
type Db = {
    messages: {
        [id: string]: Message;
    };
};

type Message = Record<{
    id: string;
    title: string;
    body: string;
    attachmentURL: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

type MessagePayload = Record<{
    title: string;
    body: string;
    attachmentURL: string;
}>

let db: Db = {
    messages: {},
};


// Query calls complete quickly because they do not go through consensus
$query;
export function getMessage(id: string): Opt<Message> {
    const value = db.messages[id];
    return value !== undefined ? Opt.Some(value) : Opt.None;
}

$query;
export function getMessages(): Vec<Message> {
    return Object.values(db.messages);
}

// Update calls take a few seconds to complete
// This is because they persist state changes and go through consensus
$update;
export async function addMessage(payload: MessagePayload): Promise<string> {
    const message: Message = { id: uuidv4(), createdAt: ic.time(), updatedAt: Opt.None, ...payload }
    db.messages[message.id] = message;
    return message.id;
}


globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
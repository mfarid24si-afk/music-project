const LOADER_ID = 'player-page-loader';
const DONE_MS = 180;

let pending = 0;
let element = null;
let hideTimer = null;

function ensureElement() {
    if (element && element.isConnected) {
        return element;
    }

    const existing = document.getElementById(LOADER_ID);

    if (existing) {
        element = existing;

        return existing;
    }

    const created = document.createElement('div');
    created.id = LOADER_ID;
    created.setAttribute('aria-hidden', 'true');
    created.innerHTML = '<span></span>';
    document.body.appendChild(created);
    element = created;

    return created;
}

function render() {
    const el = ensureElement();

    if (pending > 0) {
        clearTimeout(hideTimer);
        hideTimer = null;
        delete el.dataset.done;
        el.dataset.active = 'true';

        return;
    }

    el.dataset.done = 'true';
    hideTimer = setTimeout(() => {
        delete el.dataset.active;
        delete el.dataset.done;
        hideTimer = null;
    }, DONE_MS);
}

export function withPageProgress(task) {
    pending += 1;
    render();

    return Promise.resolve()
        .then(task)
        .finally(() => {
            pending = Math.max(0, pending - 1);
            render();
        });
}
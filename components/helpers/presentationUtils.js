function decodeHtml(encodedStr) {
    if (!encodedStr) {
        return '';
    }
    const parser = new DOMParser();
    const dom = parser.parseFromString(`<!doctype html><body>${encodedStr}`, 'text/html');
    return dom.body.textContent
}

export { decodeHtml };
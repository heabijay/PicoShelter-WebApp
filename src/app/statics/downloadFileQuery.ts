export function downloadFileQuery(url: string, filename: string) {
    const linkBox = document.createElement('a');
    linkBox.style.position = 'fixed';
    linkBox.style.left = '0';
    linkBox.style.top = '0';
    linkBox.style.opacity = '0';
    linkBox.href = url;
    linkBox.download = filename;
    document.body.appendChild(linkBox);
    linkBox.click();
    document.body.removeChild(linkBox);
}
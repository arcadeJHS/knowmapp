const proxy = 'https://cors-proxy.matteo-piazza.workers.dev/proxy?url=';

export const getHtmlContent =  async function(url: string): Promise<string | undefined> {
    try {
        const response = await fetch(`${proxy}${url}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Create a new DOMParser
        const parser = new DOMParser();
        
        // Parse the HTML content
        const doc = parser.parseFromString(text, 'text/html');
        const body = doc.querySelector('body');

        // Remove all <script> and <style> elements
        const scripts = body?.querySelectorAll('script');
        scripts?.forEach(script => script.remove());

        const styles = body?.querySelectorAll('style');
        styles?.forEach(style => style.remove());
        
        return body?.textContent || '';
    } catch (error) {
        console.error('Error fetching or parsing the page:', error);
    }
};
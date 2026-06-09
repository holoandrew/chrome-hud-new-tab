export async function initNews() {
    const container = document.getElementById('news-container');
    const headerTitle = document.getElementById('news-header-title');
    
    // Helper to get storage
    const storageGet = (key) => new Promise(resolve => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([key], result => resolve(result[key]));
        } else {
            resolve(localStorage.getItem(key));
        }
    });

    const topic = await storageGet('dashboard_news_topic') || 'finanza';
    let rssSource = 'finanza.xml';
    let topicName = 'FINANZA';

    if (topic === 'tecnologia') { rssSource = 'tecnologia.xml'; topicName = 'TECNOLOGIA'; }
    if (topic === 'italia') { rssSource = 'italia.xml'; topicName = 'ITALIA'; }
    if (topic === 'mondo') { rssSource = 'mondo.xml'; topicName = 'MONDO'; }
    if (topic === 'sport24') { rssSource = 'sport24.xml'; topicName = 'SPORT'; }

    if (headerTitle) {
        headerTitle.innerHTML = `NEWS_ONLINE <span class="text-cyan-700">//</span> ${topicName}`;
    }

    const rssUrl = encodeURIComponent(`https://www.ilsole24ore.com/rss/${rssSource}`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
            container.innerHTML = '';
            const articles = data.items.slice(0, 10);
            
            articles.forEach(article => {
                const item = document.createElement('a');
                item.href = article.link;
                item.className = 'group flex gap-3 items-center border-l-2 border-cyan-500/30 pl-3 hover:border-cyan-400 transition-colors bg-[#0a1120]/30 hover:bg-[#0a1120]/60 p-2 rounded';
                
                let imgHtml = '';
                let thumb = article.thumbnail || (article.enclosure && article.enclosure.link);
                if (!thumb && article.description) {
                    const match = article.description.match(/<img[^>]+src="([^">]+)"/);
                    if (match) thumb = match[1];
                }
                
                if (thumb) {
                    imgHtml = `<img src="${thumb}" alt="" class="w-12 h-12 object-cover rounded opacity-80 group-hover:opacity-100 shrink-0">`;
                }

                const title = document.createElement('h3');
                title.className = 'text-xs font-medium text-cyan-50 group-hover:text-cyan-300 line-clamp-2 transition-colors leading-snug';
                title.textContent = article.title;
                
                const time = document.createElement('p');
                time.className = 'tech-text text-[9px] text-cyan-600 mt-1';
                const date = new Date(article.pubDate.replace(' ', 'T'));
                time.textContent = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + ` // ${topicName}`;

                const contentDiv = document.createElement('div');
                contentDiv.className = 'flex flex-col justify-center';
                contentDiv.appendChild(title);
                contentDiv.appendChild(time);

                if (imgHtml) {
                    item.innerHTML = imgHtml;
                    item.appendChild(contentDiv);
                } else {
                    item.appendChild(contentDiv);
                }

                container.appendChild(item);
            });
        } else {
            container.innerHTML = `<span class="tech-text text-red-400">ERRORE_CARICAMENTO_FEED</span>`;
        }
    } catch (e) {
        container.innerHTML = `<span class="tech-text text-red-400">ERRORE_CARICAMENTO_FEED</span>`;
    }

    // Aggiungi la logica di Collapse (Accordion)
    const header = document.getElementById('news-header');
    const icon = document.getElementById('news-toggle-icon');
    const wrapper = document.getElementById('news-widget').parentElement;
    let isExpanded = true;

    header.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
            wrapper.classList.add('h-[50vh]', 'md:h-[70vh]');
            wrapper.classList.remove('h-auto');
            container.style.display = 'flex';
            icon.classList.remove('-rotate-90');
        } else {
            wrapper.classList.remove('h-[50vh]', 'md:h-[70vh]');
            wrapper.classList.add('h-auto');
            container.style.display = 'none';
            icon.classList.add('-rotate-90');
        }
    });
}

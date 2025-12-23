<script> 
    /** 
    * TrackGO - Sistema de rastreamento de parâmetros do Facebook (Estratégia Shotgun)
    * Versão: 1.0.7 UNIVERSAL
    * 
    * Este script trabalha em conjunto com Facebook Pixel e propaga parâmetros 
    * usando estratégia "shotgun" para máxima compatibilidade com checkouts.
    * Aguarda Facebook Pixel processar primeiro antes de executar.
    * 
    * COMPATIBILIDADE UNIVERSAL:
    * - WordPress / Elementor / WooCommerce
    * - Next.js / React / Vue / Angular
    * - Vercel / Netlify / GitHub Pages / Heroku
    * - Qualquer plataforma com JavaScript
    * 
    * FEATURES:
    * - Detecta parâmetro tkg=ic e dispara fbq('track', 'InitiateCheckout')
    * - Intercepta cliques e garante que o evento seja disparado antes do redirect
    * - Interceptação universal (links, botões, qualquer elemento)
    * - Suporte a domínios públicos (Vercel, Netlify, etc.)
    * 
    * CHANGELOG v1.0.7:
    * - NOVO: Suporte universal para qualquer plataforma
    * - NOVO: Detecção de Public Suffix List (vercel.app, netlify.app, etc.)
    * - NOVO: getCookie robusto com iteração (funciona em Next.js e WordPress)
    * - NOVO: Logs de debug para confirmar salvamento de cookies
    * - FIX: Cookies agora funcionam em domínios públicos (não usa domain=)
    * - FIX: MAX_WAIT_FOR_FBP reduzido para 5 segundos
    */ 
(function() { 
    'use strict'; 

    //------------------------------------------------------------ 
    // CONFIGURAÇÃO E CONSTANTES 
    //------------------------------------------------------------ 
     
    const CONFIG = { 
        ignoreAllIframes: !!document.querySelector('[data-trackgo-ignore-iframe]'), 
        ignoreScriptRetry: !!document.querySelector('[data-trackgo-ignore-retry]'), 
        fastStart: !!document.querySelector('[data-trackgo-fast-start]'), 
        replacePlusSignal: !!document.querySelector('[data-trackgo-plus-signal]'), 
        ignoreClasses: document.querySelector('[data-trackgo-ignore-classes]')?. 
            getAttribute('data-trackgo-ignore-classes')?. 
            split(' ')?. 
            filter(c => !!c) || [],
        forceUrlOverwrite: !!document.querySelector('[data-trackgo-force-url]')
    }; 

    const FB_PARAMS = ['fbclid', '_fbc', '_fbp']; 
    const URL_PARAMS = ['fbclid', 'fbp', 'fbc'];
    const SHOTGUN_PARAMS = ['subid4', 'aff_sub4', 'cid', 'sck'];
    const ALL_PARAMS = [...URL_PARAMS, ...SHOTGUN_PARAMS];
    
    const COOKIE_EXPIRATION_DAYS = 90; 
    const INITIAL_DELAY = 3000;
    const MAX_WAIT_FOR_FBP = 5000; // 5 segundos máximo
    const CHECK_INTERVAL = 200;
     
    let currentParamCache = null; 
    let lastUrlParams = ''; 
    let isInitialized = false; 

    //------------------------------------------------------------ 
    // FUNÇÕES PARA GERENCIAMENTO DE COOKIES (UNIVERSAL)
    //------------------------------------------------------------ 
     
    function getCookie(name) { 
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
        return null;
    } 

    // Detecta domínios públicos que não permitem cookies com domain=
    function isPublicSuffix(domain) {
        const publicSuffixes = [
            'vercel.app', 'netlify.app', 'github.io', 'herokuapp.com', 
            'firebaseapp.com', 'web.app', 'pages.dev', 'workers.dev', 
            'azurewebsites.net', 'cloudfront.net', 'amplifyapp.com'
        ];
        return publicSuffixes.some(suffix => domain.endsWith(suffix));
    }

    function getTopLevelDomain() { 
        const hostname = window.location.hostname;
        if (isPublicSuffix(hostname)) { 
            return null; // Não usar domain= para domínios públicos
        }
        const parts = hostname.split('.'); 
        if (parts.length > 1) { 
            return '.' + parts.slice(-2).join('.'); 
        } 
        return hostname; 
    } 
     
    function setCookie(name, value, days = COOKIE_EXPIRATION_DAYS) { 
        try { 
            if (!value) return false;
            const expirationDate = new Date(); 
            expirationDate.setTime(expirationDate.getTime() + (days * 24 * 60 * 60 * 1000)); 
            const expires = "expires=" + expirationDate.toUTCString(); 
            const tld = getTopLevelDomain();
            const domainPart = tld ? ";domain=" + tld : "";
            const cookieString = `${name}=${encodeURIComponent(value)};${expires};path=/${domainPart};SameSite=Lax;Secure`;
            document.cookie = cookieString; 
            const saved = getCookie(name);
            if (saved) { 
                console.log('TrackGO: Cookie salvo OK:', name, '=', value.substring(0, 30) + (value.length > 30 ? '...' : '')); 
            } else { 
                console.warn('TrackGO: Cookie NÃO foi salvo:', name); 
            }
            return !!saved; 
        } catch (error) { 
            console.error('TrackGO: Erro ao salvar cookie', error); 
            return false; 
        } 
    } 

    //------------------------------------------------------------ 
    // FUNÇÕES UTILITÁRIAS SHOTGUN
    //------------------------------------------------------------
    
    function generateShotgunValue(fbp, fbc) {
        if (fbp && fbc) {
            return `${fbp}|${fbc}`;
        } else if (fbp) {
            return fbp;
        } else if (fbc) {
            return fbc;
        }
        return null;
    }
    
    function getSubdomainIndex() {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        
        if (parts.length <= 1 || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            return 0;
        }
        
        if (parts.length > 2) {
            return 2;
        }
        
        return 1;
    }
    
    function generateFbc(fbclid) {
        const subdomainIndex = getSubdomainIndex();
        const creationTime = Date.now();
        return `fb.${subdomainIndex}.${creationTime}.${fbclid}`;
    }
    
    function generateAndSaveShotgunParams(fbp, fbc, fbclid) {
        if (fbp) setCookie('fbp', fbp);
        if (fbc) setCookie('fbc', fbc);
        if (fbclid) setCookie('fbclid', fbclid);
        
        const shotgunValue = generateShotgunValue(fbp, fbc);
        
        if (shotgunValue) {
            setCookie('subid4', shotgunValue);
            setCookie('aff_sub4', shotgunValue);
            setCookie('cid', shotgunValue);
            setCookie('sck', shotgunValue);
            
            console.log('TrackGO: Parâmetros shotgun salvos:', {
                fbp: fbp || '(não disponível)',
                fbc: fbc || '(não disponível)',
                fbclid: fbclid || '(não disponível)',
                shotgunValue: shotgunValue
            });
        }
    }

    //------------------------------------------------------------ 
    // FUNÇÕES PARA DETECÇÃO TKG=IC
    //------------------------------------------------------------
    
    function hasInitiateCheckoutParam(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.searchParams.get('tkg') === 'ic';
        } catch (error) {
            return url.includes('tkg=ic');
        }
    }
    
    function fireInitiateCheckout() {
        try {
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'InitiateCheckout');
                console.log('TrackGO: Disparado fbq InitiateCheckout');
                return true;
            } else {
                console.warn('TrackGO: Facebook Pixel não encontrado (fbq não existe)');
                return false;
            }
        } catch (error) {
            console.error('TrackGO: Erro ao disparar InitiateCheckout', error);
            return false;
        }
    }
    
    function checkCurrentPageForInitiateCheckout() {
        if (hasInitiateCheckoutParam(window.location.href)) {
            fireInitiateCheckout();
        }
    }
    
    function extractTargetUrl(element) {
        if (element.tagName === 'A' && element.href) {
            return element.href;
        }
        
        const parentLink = element.closest('a');
        if (parentLink && parentLink.href) {
            return parentLink.href;
        }
        
        const dataUrl = element.getAttribute('data-url') || 
                       element.getAttribute('data-href') || 
                       element.getAttribute('data-link') ||
                       element.getAttribute('data-target');
        if (dataUrl) return dataUrl;
        
        const onclick = element.getAttribute('onclick');
        if (onclick) {
            const locationMatch = onclick.match(/(?:window\.)?location(?:\.href)?\s*=\s*['"](.*?)['"]/) ||
                                 onclick.match(/(?:window\.)?open\(['"](.*?)['"]/) ||
                                 onclick.match(/href\s*=\s*['"](.*?)['"]/) ||
                                 onclick.match(/url['"]\s*:\s*['"](.*?)['"]/) ||
                                 onclick.match(/['"](https?:\/\/[^'"]+)['"]/);
            if (locationMatch) return locationMatch[1];
        }
        
        return null;
    }
    
    function handleInitiateCheckoutClick(event, targetUrl) {
        if (!hasInitiateCheckoutParam(targetUrl)) {
            return false;
        }
        
        const link = event.target.closest('a');
        
        if (link && (link.target === '_blank' || event.ctrlKey || event.metaKey || event.button === 1)) {
            fireInitiateCheckout();
            return false;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        console.log('TrackGO: Interceptando clique tkg=ic, disparando evento...');
        
        fireInitiateCheckout();
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 150);
        
        return true;
    }
    
    function setupInitiateCheckoutListeners() {
        document.addEventListener('click', function(event) {
            const element = event.target;
            const targetUrl = extractTargetUrl(element);
            
            if (targetUrl) {
                handleInitiateCheckoutClick(event, targetUrl);
            }
        }, true);
        
        if (!CONFIG.ignoreAllIframes) {
            document.addEventListener('DOMContentLoaded', function() {
                checkIframesForInitiateCheckout();
            });
        }
    }
    
    function checkIframesForInitiateCheckout() {
        document.querySelectorAll('iframe').forEach(iframe => {
            if (iframe.src && hasInitiateCheckoutParam(iframe.src)) {
                fireInitiateCheckout();
            }
        });
    }

    //------------------------------------------------------------ 
    // INICIALIZAÇÃO: LÊ URL E SALVA NOS COOKIES 
    //------------------------------------------------------------ 
     
    function initializeFbParams() { 
        const urlParams = new URLSearchParams(window.location.search); 
        const currentUrl = window.location.search; 
         
        if (lastUrlParams === currentUrl && isInitialized) { 
            return; 
        } 
         
        console.log('TrackGO: Processando parâmetros após Facebook Pixel...', currentUrl); 
        let hasNewParams = false; 

        let fbp = getCookie('_fbp');
        
        const urlFbp = urlParams.get('_fbp') || urlParams.get('fbp');
        if (urlFbp) {
            if (!fbp || CONFIG.forceUrlOverwrite) {
                fbp = urlFbp;
                setCookie('_fbp', fbp);
                console.log(`TrackGO: ${!getCookie('_fbp') ? 'Definiu' : 'Sobrescreveu'} _fbp=${fbp} da URL`);
                hasNewParams = true;
            } else {
                console.log(`TrackGO: _fbp já existe (${fbp}), ignorando valor da URL.`);
            }
        }
        
        let fbc = getCookie('_fbc');
        const fbclid = urlParams.get('fbclid');
        
        if (fbclid) {
            const newFbc = generateFbc(fbclid);
            setCookie('_fbc', newFbc);
            if (fbc) {
                console.log(`TrackGO: Novo clique detectado! Atualizando _fbc de ${fbc} para ${newFbc}`);
            } else {
                console.log(`TrackGO: Gerou _fbc=${newFbc} a partir de fbclid`);
            }
            fbc = newFbc;
            hasNewParams = true;
        } else {
            const urlFbc = urlParams.get('_fbc') || urlParams.get('fbc');
            if (urlFbc) {
                if (!fbc || CONFIG.forceUrlOverwrite) {
                    fbc = urlFbc;
                    setCookie('_fbc', fbc);
                    console.log(`TrackGO: Definiu _fbc=${fbc} da URL`);
                    hasNewParams = true;
                }
            }
        }
        
        if (!fbp && !fbc) {
            console.warn('TrackGO: Nem _fbp nem _fbc disponíveis. Nenhum parâmetro para propagar.');
            return;
        }
        
        if (!fbp) {
            console.warn('TrackGO: _fbp não encontrado (possível AdBlocker), continuando apenas com _fbc');
        }
        
        if (!fbc) {
            console.log('TrackGO: _fbc não disponível, continuando apenas com _fbp');
        }
        
        generateAndSaveShotgunParams(fbp, fbc, fbclid);
        checkCurrentPageForInitiateCheckout();
         
        lastUrlParams = currentUrl; 
        if (hasNewParams) { 
            console.log('TrackGO: Novos parâmetros detectados, limpando cache.'); 
            currentParamCache = null; 
        } 
         
        isInitialized = true; 
    } 

    //------------------------------------------------------------ 
    // CLASSE UTILITÁRIA PARA GERENCIAR PARÂMETROS 
    //------------------------------------------------------------ 
     
    class ParamManager { 
        static getFbParameters() { 
            if (currentParamCache && lastUrlParams === window.location.search) { 
                return currentParamCache; 
            } 
             
            console.log('TrackGO: Construindo parâmetros...'); 
            const params = new Map(); 
             
            ALL_PARAMS.forEach(param => {
                const cookieValue = getCookie(param);
                if (cookieValue && cookieValue !== '') {
                    params.set(param, cookieValue);
                    console.log(`TrackGO: Cookie - ${param}=${cookieValue}`);
                }
            });
             
            currentParamCache = params; 
            console.log('TrackGO: Parâmetros finais:', Array.from(params.entries())); 
             
            return params; 
        } 

        static addFbParametersToUrl(url) { 
            if (!url) return url; 
             
            try { 
                const urlObj = new URL(url, window.location.origin); 
                const allParams = this.getFbParameters(); 
                 
                allParams.forEach((value, key) => { 
                    urlObj.searchParams.set(key, value); 
                }); 
                 
                let finalUrl = urlObj.toString(); 
                if (CONFIG.replacePlusSignal) { 
                    finalUrl = finalUrl.split("+").join("%20"); 
                } 
                 
                return finalUrl; 
            } catch (error) { 
                console.error('TrackGO: Erro ao processar URL', url, error); 
                return url; 
            } 
        } 
    } 

    //------------------------------------------------------------ 
    // FUNÇÕES PARA MODIFICAÇÃO DE ELEMENTOS DOM
    //------------------------------------------------------------ 
     
    function addParamsToLinks(onlyNew = false) { 
        if (!isInitialized) return; 
         
        document.querySelectorAll('a').forEach(link => { 
            if (link.href.startsWith('mailto:') ||  
                link.href.startsWith('tel:') ||  
                link.href.includes('#') || 
                CONFIG.ignoreClasses?.some(className => link.classList.contains(className))) { 
                return; 
            } 
             
            try { 
                const originalHref = link.getAttribute('data-original-href') || link.href; 
                if (!link.getAttribute('data-original-href')) { 
                    link.setAttribute('data-original-href', originalHref); 
                } 
                 
                link.href = ParamManager.addFbParametersToUrl(originalHref); 
            } catch (error) { 
                console.error('TrackGO: Erro ao processar link', link.href, error); 
            } 
        }); 
    } 

    function addParamsToForms(onlyNew = false) { 
        if (!isInitialized) return; 
         
        document.querySelectorAll('form').forEach(form => { 
            if (CONFIG.ignoreClasses?.some(className => form.classList.contains(className))) { 
                return; 
            } 
             
            try { 
                if (form.action && form.action !== '') { 
                    form.action = ParamManager.addFbParametersToUrl(form.action); 
                } 
                 
                const allParams = ParamManager.getFbParameters(); 

                allParams.forEach((value, key) => { 
                    const existingField = form.querySelector(`input[name="${key}"]`); 
                    if (existingField) { 
                        existingField.setAttribute('value', value); 
                        return; 
                    } 
                     
                    const hiddenField = document.createElement('input'); 
                    hiddenField.type = 'hidden'; 
                    hiddenField.name = key; 
                    hiddenField.value = value; 
                    hiddenField.setAttribute('data-trackgo', 'true');
                    form.appendChild(hiddenField); 
                }); 
            } catch (error) { 
                console.error('TrackGO: Erro ao processar formulário', form, error); 
            } 
        }); 
    } 

    function addParamsToIframes() { 
        if (CONFIG.ignoreAllIframes || !isInitialized) return; 
         
        document.querySelectorAll('iframe').forEach(iframe => { 
            const videoHosts = [ 
                'pandavideo.com', 'youtube.com', 'youtube-nocookie.com', 'youtu.be', 
                'vimeo.com', 'player.vimeo.com', 'wistia.com', 'wistia.net', 
                'dailymotion.com', 'facebook.com/plugins/video', 'fast.wistia.net' 
            ]; 
             
            if (!iframe.src || iframe.src === '' ||  
                videoHosts.some(host => iframe.src.includes(host)) || 
                CONFIG.ignoreClasses?.some(className => iframe.classList.contains(className))) { 
                return; 
            } 
             
            try { 
                if (hasInitiateCheckoutParam(iframe.src)) {
                    fireInitiateCheckout();
                }
                
                iframe.src = ParamManager.addFbParametersToUrl(iframe.src); 
            } catch (error) { 
                console.error('TrackGO: Erro ao processar iframe', iframe.src, error); 
            } 
        }); 
    } 

    //------------------------------------------------------------ 
    // OBSERVADOR E INICIALIZAÇÃO
    //------------------------------------------------------------ 
     
    let mutationTimeout; 
     
    function setupMutationObserver() { 
        const observer = new MutationObserver((mutations) => { 
            clearTimeout(mutationTimeout); 
            mutationTimeout = setTimeout(() => { 
                if (isInitialized) { 
                    addParamsToLinks(true); 
                    addParamsToForms(true); 
                    if (!CONFIG.ignoreAllIframes) { 
                        addParamsToIframes(); 
                    } 
                    checkIframesForInitiateCheckout();
                } 
            }, 100); 
        }); 
         
        observer.observe(document.body, { 
            subtree: true, 
            childList: true 
        }); 
    } 

    function overrideWindowOpen() { 
        const originalWindowOpen = window.open; 
         
        window.open = function(url, name, specs) { 
            try { 
                if (url && hasInitiateCheckoutParam(url.toString())) {
                    fireInitiateCheckout();
                }
                
                const processedUrl = url ? ParamManager.addFbParametersToUrl(url.toString()) : ''; 
                return originalWindowOpen(processedUrl, name || '', specs || ''); 
            } catch (error) { 
                console.error('TrackGO: Erro ao processar window.open', url, error); 
                return originalWindowOpen(url, name || '', specs || ''); 
            } 
        }; 
    } 

    function initialize() { 
        try { 
            console.log('TrackGO: Iniciando após aguardar Facebook Pixel...'); 
            initializeFbParams(); 
             
            if (isInitialized) { 
                addParamsToLinks(); 
                addParamsToForms(); 
                 
                if (!CONFIG.ignoreAllIframes) { 
                    addParamsToIframes(); 
                } 
                 
                console.log('TrackGO: Inicialização completa!'); 
            } 
        } catch (error) { 
            console.error('TrackGO: Erro durante inicialização', error); 
        } 
    } 

    function forceRefresh() { 
        console.log('TrackGO: Forçando atualização completa...'); 
        currentParamCache = null; 
        lastUrlParams = ''; 
        isInitialized = false; 
        initialize(); 
    } 

    function waitForFbpAndStart() {
        let elapsed = 0;
        
        const checkFbp = () => {
            const fbp = getCookie('_fbp');
            const fbc = getCookie('_fbc');
            
            if (fbp) {
                console.log(`TrackGO: _fbp encontrado após ${INITIAL_DELAY + elapsed}ms total, iniciando...`);
                if (fbc) {
                    console.log(`TrackGO: _fbc do Facebook Pixel: ${fbc}`);
                }
                startTrackGO();
                return;
            }
            
            elapsed += CHECK_INTERVAL;
            
            if (elapsed >= MAX_WAIT_FOR_FBP) {
                console.warn(`TrackGO: _fbp não encontrado após ${INITIAL_DELAY + MAX_WAIT_FOR_FBP}ms. Verifique o Facebook Pixel.`);
                startTrackGO();
                return;
            }
            
            setTimeout(checkFbp, CHECK_INTERVAL);
        };
        
        console.log(`TrackGO: Aguardando ${INITIAL_DELAY}ms para Facebook Pixel processar...`);
        setTimeout(checkFbp, INITIAL_DELAY);
    }
    
    function startTrackGO() {
        initialize(); 
        setupMutationObserver(); 
        overrideWindowOpen(); 
        setupInitiateCheckoutListeners();
        
        let currentUrl = window.location.href; 
        setInterval(() => { 
            if (window.location.href !== currentUrl) { 
                console.log('TrackGO: URL mudou, re-sincronizando...'); 
                currentUrl = window.location.href; 
                checkCurrentPageForInitiateCheckout();
                forceRefresh(); 
            } 
        }, 500);
         
        if (!CONFIG.ignoreScriptRetry) { 
            setTimeout(() => { 
                if (window.location.search !== lastUrlParams) { 
                    forceRefresh(); 
                } else { 
                    initialize(); 
                } 
            }, 2000); 
             
            setTimeout(initialize, 5000); 
        }
    }

    function main() { 
        waitForFbpAndStart();
    } 

    if (CONFIG.fastStart || document.readyState === 'complete') { 
        main(); 
    } else { 
        window.addEventListener('load', main); 
    } 

    // API pública
    window.TrackGO = { 
        addFbParamsToUrl: ParamManager.addFbParametersToUrl.bind(ParamManager), 
        getParameters: ParamManager.getFbParameters.bind(ParamManager), 
        refresh: forceRefresh, 
        forceSync: forceRefresh,
        generateShotgun: generateShotgunValue,
        checkInitiateCheckout: checkCurrentPageForInitiateCheckout, 
        fireInitiateCheckout: fireInitiateCheckout,
        extractTargetUrl: extractTargetUrl,
        version: '1.0.7',
        debug: () => { 
            console.log('TrackGO Debug v1.0.7 UNIVERSAL:'); 
            console.log('- Hostname:', window.location.hostname);
            console.log('- É domínio público:', isPublicSuffix(window.location.hostname));
            console.log('- URL atual:', window.location.search); 
            console.log('- Última URL processada:', lastUrlParams); 
            console.log('- Cache de parâmetros:', currentParamCache); 
            console.log('- Inicializado:', isInitialized);             
            console.log('- Interceptação universal ATIVA');
            console.log('- Parâmetros ativos:', Array.from(ParamManager.getFbParameters().entries())); 
            console.log('- TKG=IC na página atual:', hasInitiateCheckoutParam(window.location.href));
            console.log('- Config forceUrlOverwrite:', CONFIG.forceUrlOverwrite);
            
            const testButton = document.querySelector('button, [onclick], [data-url]');
            if (testButton) {
                console.log('- Teste extração de URL:', testButton);
                console.log('  URL extraída:', extractTargetUrl(testButton));
            }
            
            console.log('- Cookies Facebook:', {
                '_fbp': getCookie('_fbp'),
                '_fbc': getCookie('_fbc'),
                'fbclid': getCookie('fbclid')
            });
            
            console.log('- Cookies Shotgun:', {
                'fbp': getCookie('fbp'),
                'fbc': getCookie('fbc'),
                'subid4': getCookie('subid4'),
                'aff_sub4': getCookie('aff_sub4'),
                'cid': getCookie('cid'),
                'sck': getCookie('sck')
            });
            
            const trackgoFields = document.querySelectorAll('input[data-trackgo="true"]');
            console.log('- Campos em formulários:', Array.from(trackgoFields).map(f => `${f.name}=${f.value}`));
        } 
    }; 
     
    console.log("TrackGO v1.0.7 UNIVERSAL carregado! Funciona em WordPress, Next.js, Vercel, etc."); 
})(); 
</script>

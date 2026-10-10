const URL_ESTATISTICAS =
    'https://wakatime.com/share/@a0d04abd-cfe7-4836-bb0e-b44ee9a1aebf/4695fd9f-9287-4e71-af5c-166de9739c66.json'

const URL_LINGUAGENS =
    'https://wakatime.com/share/@a0d04abd-cfe7-4836-bb0e-b44ee9a1aebf/0127acce-84a9-4ff5-8694-6a72e3b89cf1.json'

const CACHE_MS = 15 * 60 * 1000

let cached = null
let salvoEm = 0
let request = null

export class WakaTimePendingError extends Error {}

export function getCachedWakaTimeStats() {
    return Date.now() - salvoEm < CACHE_MS ? cached : null
}

// Compartilhamento público via JSONP, sem jQuery ou chave secreta.
function consultarJSONP(url) {
    return new Promise((resolve, reject) => {
        const callback =
            `waka_${crypto.randomUUID().replaceAll('-', '')}`

        const script = document.createElement('script')
        let timer

        function limpar() {
            clearTimeout(timer)
            script.remove()
            delete window[callback]
        }

        window[callback] = (resposta) => {
            limpar()
            resolve(resposta)
        }

        script.onerror = () => {
            limpar()
            reject(new Error('Não foi possível acessar o WakaTime'))
        }

        timer = setTimeout(() => {
            limpar()
            reject(new Error('O WakaTime demorou para responder'))
        }, 15000)

        const endereco = new URL(url)
        endereco.searchParams.set('callback', callback)

        script.src = endereco.toString()
        document.body.appendChild(script)
    })
}

function organizarItens(lista) {
    if (!Array.isArray(lista)) return []

    return lista
        .filter((item) => Number(item.total_seconds) >= 60)
        .map((item) => ({
            name: item.name,
            seconds: Number(item.total_seconds),
            percent: Number(item.percent) || 0,
        }))
        .sort((a, b) => b.seconds - a.seconds)
}

function normalizar(data) {
    const total = data.grand_total ?? data
    const periodo = data.range ?? data

    return {
        totalSeconds: Number(
            total.total_seconds_including_other_language
            ?? total.total_seconds
            ?? 0,
        ),

        dailyAverage: Number(
            total.daily_average_including_other_language
            ?? total.daily_average
            ?? 0,
        ),

        since: periodo.start?.slice(0, 10) ?? null,
        until: periodo.end?.slice(0, 10) ?? null,
        totalDays: periodo.days_including_holidays ?? null,
        activeDays: periodo.days_minus_holidays ?? null,

        bestDay: data.best_day
            ? {
                date: data.best_day.date,
                seconds: Number(data.best_day.total_seconds) || 0,
            }
            : null,

        languages: organizarItens(data.languages),
        editors: organizarItens(data.editors),
    }
}

export function fetchWakaTimeStats() {
    const guardado = getCachedWakaTimeStats()

    if (guardado) return Promise.resolve(guardado)
    if (request) return request

    request = Promise.all([
        consultarJSONP(URL_ESTATISTICAS),
        consultarJSONP(URL_LINGUAGENS),
    ])
        .then(([resumo, linguagens]) => {
            if (!resumo.data || !Array.isArray(linguagens.data)) {
                throw new Error('Resposta inválida do WakaTime')
            }

            if (resumo.data.status === 'pending_update') {
                throw new WakaTimePendingError(
                    'O WakaTime ainda está calculando os dados',
                )
            }

            cached = {
                ...normalizar(resumo.data),

                languages: linguagens.data
                    .filter((item) => Number(item.percent) > 0)
                    .map((item) => ({
                        name: item.name,
                        percent: Number(item.percent),
                        color: item.color,
                    }))
                    .sort((a, b) => b.percent - a.percent),
            }

            salvoEm = Date.now()
            return cached
        })
        .finally(() => {
            request = null
        })

    return request
}

// Agrupa os itens menores em "Outras".
export function splitTop(items, limit = 6) {
    const top = items.slice(0, limit)
    const restantes = items.slice(limit)

    return {
        top,
        rest: restantes.length
            ? {
                count: restantes.length,
                seconds: restantes.reduce(
                    (soma, item) => soma + item.seconds, 0,
                ),
                percent: restantes.reduce(
                    (soma, item) => soma + item.percent, 0,
                ),
            }
            : null,
    }
}

export function formatDuration(seconds = 0) {
    const minutos = Math.floor(seconds / 60)
    const horas = Math.floor(minutos / 60)
    const resto = minutos % 60

    if (!horas) return `${resto} min`
    return resto ? `${horas} h ${resto} min` : `${horas} h`
}

export function formatPercent(value, locale = 'pt-BR') {
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: 1,
    }).format(value / 100)
}

export function formatDate(value, locale = 'pt-BR') {
    if (!value) return ''

    const date = new Date(`${value.slice(0, 10)}T12:00:00Z`)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeZone: 'America/Sao_Paulo',
    }).format(date)
}
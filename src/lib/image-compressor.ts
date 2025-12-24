/**
 * Utilitário para compressão de imagem antes de enviar para API de IA
 * Reduz o consumo de tokens em até 80%
 */

const MAX_DIMENSION = 1024  // Máximo de pixels em qualquer dimensão
const JPEG_QUALITY = 0.85   // Qualidade de compressão JPEG

/**
 * Comprime uma imagem para reduzir o consumo de tokens na API
 * @param base64Image - Imagem em base64 (com ou sem prefixo data:image)
 * @returns Imagem comprimida em base64 (formato JPEG)
 */
export async function compressImage(base64Image: string): Promise<string> {
    // Remover prefixo data:image se existir
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

    // Criar imagem para obter dimensões
    const img = new Image()

    return new Promise((resolve, reject) => {
        img.onload = () => {
            let { width, height } = img

            // Verificar se precisa redimensionar
            if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
                // Imagem já está pequena, retornar original
                resolve(base64Image)
                return
            }

            // Calcular novas dimensões mantendo proporção
            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height = Math.round(height * (MAX_DIMENSION / width))
                    width = MAX_DIMENSION
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width = Math.round(width * (MAX_DIMENSION / height))
                    height = MAX_DIMENSION
                }
            }

            // Criar canvas para redimensionar
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Falha ao criar contexto do canvas'))
                return
            }

            // Desenhar imagem redimensionada
            ctx.drawImage(img, 0, 0, width, height)

            // Converter para JPEG comprimido
            const compressedBase64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY)

            resolve(compressedBase64)
        }

        img.onerror = () => {
            reject(new Error('Falha ao carregar imagem'))
        }

        // Carregar imagem
        if (base64Image.startsWith('data:')) {
            img.src = base64Image
        } else {
            img.src = `data:image/jpeg;base64,${base64Data}`
        }
    })
}

/**
 * Versão server-side da compressão usando sharp (se disponível)
 * Para uso em API routes do Next.js
 */
export async function compressImageServer(base64Image: string): Promise<string> {
    try {
        // Tentar usar sharp para compressão server-side
        const sharp = await import('sharp')

        // Remover prefixo data:image se existir
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')

        // Obter metadados da imagem
        const metadata = await sharp.default(buffer).metadata()

        // Verificar se precisa redimensionar
        if ((metadata.width || 0) <= MAX_DIMENSION && (metadata.height || 0) <= MAX_DIMENSION) {
            return base64Image
        }

        // Redimensionar e comprimir
        const compressedBuffer = await sharp.default(buffer)
            .resize(MAX_DIMENSION, MAX_DIMENSION, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: Math.round(JPEG_QUALITY * 100) })
            .toBuffer()

        return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`
    } catch {
        // Sharp não disponível, retornar imagem original
        console.warn('Sharp não disponível, retornando imagem original')
        return base64Image
    }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawText = (req.query.text as string || '').trim();
    const lang = (req.query.lang as string || 'id').trim();

    if (!rawText) {
      res.status(400).json({ error: 'Missing text parameter' });
      return;
    }

    // Clean text for Indonesian voice
    const cleanText = rawText
      .replace(/Rp\s?/g, 'Rupiah ')
      .replace(/%/g, ' persen ')
      .replace(/\//g, ' atau ')
      .replace(/[^\w\s.,!?:-]/gi, '');

    const sentenceList = cleanText.match(/[^.!?\n,]+[.!?\n,]?|.+/g) || [cleanText];
    const chunks: string[] = [];
    let cur = '';

    for (const s of sentenceList) {
      const part = s.trim();
      if (!part) continue;
      if ((cur + ' ' + part).trim().length <= 150) {
        cur = (cur + ' ' + part).trim();
      } else {
        if (cur) chunks.push(cur);
        if (part.length > 150) {
          const words = part.split(' ');
          let temp = '';
          for (const w of words) {
            if ((temp + ' ' + w).trim().length <= 150) {
              temp = (temp + ' ' + w).trim();
            } else {
              if (temp) chunks.push(temp);
              temp = w;
            }
          }
          if (temp) chunks.push(temp);
          cur = '';
        } else {
          cur = part;
        }
      }
    }
    if (cur) chunks.push(cur);

    if (chunks.length === 0) {
      res.status(400).json({ error: 'No valid text chunks' });
      return;
    }

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
      const ttsRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
          'Accept': 'audio/mpeg, audio/*; q=0.9, */*; q=0.1'
        }
      });

      if (ttsRes.ok) {
        const ab = await ttsRes.arrayBuffer();
        audioBuffers.push(Buffer.from(ab));
      }
    }

    if (audioBuffers.length === 0) {
      res.status(502).json({ error: 'TTS synthesis failed' });
      return;
    }

    const combinedBuffer = Buffer.concat(audioBuffers);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', combinedBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(combinedBuffer);
  } catch (err: any) {
    console.error('Vercel TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS Error' });
  }
}

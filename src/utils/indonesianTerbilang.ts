/**
 * Indonesian Number-to-Words (Terbilang) & Spoken Currency Converter
 * Memastikan pengucapan angka dan nominal Rupiah pada Text-to-Speech (TTS)
 * dilafalkan dengan kata bahasa Indonesia alami, misalnya:
 * - 1.000 -> "seribu" / "seribu rupiah"
 * - 50.000 -> "lima puluh ribu" / "lima puluh ribu rupiah"
 * - 1.250.000 -> "satu juta dua ratus lima puluh ribu rupiah"
 */

/**
 * Konversi angka bulat positif menjadi kata terbilang bahasa Indonesia.
 */
export function numberToIndonesianWords(n: number): string {
  const num = Math.floor(Math.abs(n));
  if (isNaN(num)) return '';
  if (num === 0) return 'nol';

  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

  if (num < 12) {
    return satuan[num];
  } else if (num < 20) {
    return satuan[num - 10] + ' belas';
  } else if (num < 100) {
    const tens = Math.floor(num / 10);
    const rest = num % 10;
    return (tens === 1 ? 'sepuluh' : satuan[tens] + ' puluh') + (rest > 0 ? ' ' + satuan[rest] : '');
  } else if (num < 200) {
    const rest = num % 100;
    return 'seratus' + (rest > 0 ? ' ' + numberToIndonesianWords(rest) : '');
  } else if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    return satuan[hundreds] + ' ratus' + (rest > 0 ? ' ' + numberToIndonesianWords(rest) : '');
  } else if (num < 2000) {
    const rest = num % 1000;
    return 'seribu' + (rest > 0 ? ' ' + numberToIndonesianWords(rest) : '');
  } else if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    return numberToIndonesianWords(thousands) + ' ribu' + (rest > 0 ? ' ' + numberToIndonesianWords(rest) : '');
  } else if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const rest = num % 1000000;
    return numberToIndonesianWords(millions) + ' juta' + (rest > 0 ? ' ' + numberToIndonesianWords(rest) : '');
  } else if (num < 1000000000000) {
    const billions = Math.floor(num / 1000000000);
    const rest = num % 1000000000;
    return numberToIndonesianWords(billions) + ' miliar' + (rest > 0 ? ' ' + numberToIndonesianWords(rest) : '');
  } else if (num < 1000000000000000) {
    const trillions = Math.floor(num / 1000000000000);
    const rest = num % 1000000000000;
    return numberToIndonesianWords(trillions) + ' triliun' + (rest > 0 ? ' ' + numberToIndonesianWords(rest) : '');
  }
  return num.toString();
}

/**
 * Format nominal Rupiah menjadi kata-kata terbilang bahasa Indonesia.
 * Contoh: 1000 -> "seribu rupiah"
 *         1200000 -> "satu juta dua ratus ribu rupiah"
 */
export function formatRupiahSpoken(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  if (rounded === 0) return 'nol rupiah';
  return `${numberToIndonesianWords(rounded)} rupiah`;
}

/**
 * Preprosesor cerdas teks sebelum diumpankan ke Text-to-Speech (TTS)
 * Mengubah simbol mata uang (Rp), angka bertitik ribuan (1.000), persen (%), waktu (14:00),
 * dan kode tenggat (H-3) menjadi kalimat bahasa Indonesia yang fasih dan natural.
 */
export function prepareIndonesianTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Ganti nominal Rupiah bertitik atau polos: "Rp 1.200.000", "Rp1.000", "Rp 50.000"
  text = text.replace(/Rp\s?([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]+)/gi, (_match, numStr) => {
    const cleanNum = parseInt(numStr.replace(/\./g, ''), 10);
    if (!isNaN(cleanNum)) {
      return formatRupiahSpoken(cleanNum);
    }
    return _match;
  });

  // 2. Ganti angka dengan pemisah ribuan titik: "1.000", "50.000", "1.500.000"
  text = text.replace(/\b([0-9]{1,3}(?:\.[0-9]{3})+)\b/g, (_match, numStr) => {
    const cleanNum = parseInt(numStr.replace(/\./g, ''), 10);
    if (!isNaN(cleanNum)) {
      return numberToIndonesianWords(cleanNum);
    }
    return _match;
  });

  // 3. Ganti persentase: "80%", "100%", "50 %"
  text = text.replace(/([0-9]+(?:\.[0-9]+)?)\s*%/g, (_match, numStr) => {
    const num = Math.round(parseFloat(numStr));
    return `${numberToIndonesianWords(num)} persen`;
  });

  // 4. Ganti indikator H-minus: "H-1", "H-2", "H-3", "H-7"
  text = text.replace(/\bH-([0-9]+)\b/gi, (_match, d) => {
    const day = parseInt(d, 10);
    return `h minus ${numberToIndonesianWords(day)}`;
  });

  // 5. Ganti durasi menit: "30 menit", "10 menit", "5 menit"
  text = text.replace(/\b(60|45|30|15|10|5)\s*menit\b/gi, (_match, m) => {
    const min = parseInt(m, 10);
    return `${numberToIndonesianWords(min)} menit`;
  });

  // 6. Ganti format jam: "14:30", "08:00"
  text = text.replace(/\b([0-2]?[0-9]):([0-5][0-9])\b/g, (_match, hour, minute) => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const hWords = numberToIndonesianWords(h);
    if (m === 0) {
      return `pukul ${hWords} tepat`;
    } else if (m === 30) {
      return `pukul ${hWords} lewat tiga puluh menit`;
    }
    return `pukul ${hWords} lewat ${numberToIndonesianWords(m)} menit`;
  });

  // 7. Bersihkan karakter khusus yang mengganggu TTS
  text = text
    .replace(/\//g, ' atau ')
    .replace(/&/g, ' dan ')
    .replace(/[-_]/g, ' ')
    .replace(/[^\w\s.,!?:-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

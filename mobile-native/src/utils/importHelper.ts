import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { Platform } from 'react-native';
import { Word, WordLevel } from '../data/mockWords';

export interface ImportFailure {
  row: number;
  reason: string;
  data: any;
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  failures: ImportFailure[];
  words: Word[];
}

const REQUIRED_FIELDS = ['word', 'meaning'];
const VALID_LEVELS: WordLevel[] = ['专升本', 'CET4', 'CET6', 'IELTS'];

export class ImportHelper {
  static async parseFile(fileUri: string, mimeType: string): Promise<ImportResult> {
    try {
      let rawData: any[] = [];

      if (mimeType === 'application/json' || fileUri.endsWith('.json')) {
        let content: string;
        if (Platform.OS === 'web') {
          const response = await fetch(fileUri);
          content = await response.text();
        } else {
          content = await FileSystem.readAsStringAsync(fileUri);
        }
        rawData = JSON.parse(content);
        if (!Array.isArray(rawData)) {
          throw new Error('JSON content must be an array of words');
        }
      } else {
        // Excel / CSV
        let workbook;
        if (Platform.OS === 'web') {
          const response = await fetch(fileUri);
          const arrayBuffer = await response.arrayBuffer();
          workbook = XLSX.read(arrayBuffer, { type: 'array' });
        } else {
          const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
          workbook = XLSX.read(content, { type: 'base64' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rawData = XLSX.utils.sheet_to_json(sheet);
      }

      return this.processData(rawData);
    } catch (error: any) {
      console.error('Import parse error:', error);
      throw new Error(`File parsing failed: ${error.message}`);
    }
  }

  private static processData(rawData: any[]): ImportResult {
    const words: Word[] = [];
    const failures: ImportFailure[] = [];

    rawData.forEach((row, index) => {
      const rowNum = index + 1; // 1-based index for user friendliness
      
      // Normalize keys (lowercase)
      const normalizedRow: any = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.toLowerCase().trim()] = row[key];
      });

      // 1. Validation
      const missingFields = REQUIRED_FIELDS.filter(field => !normalizedRow[field] && !normalizedRow[this.getChineseKey(field)]);
      if (missingFields.length > 0) {
        failures.push({
          row: rowNum,
          reason: `Missing required fields: ${missingFields.join(', ')}`,
          data: row
        });
        return;
      }

      // 2. Mapping
      try {
        const word = this.mapRowToWord(normalizedRow, index);
        words.push(word);
      } catch (error: any) {
        failures.push({
          row: rowNum,
          reason: `Mapping error: ${error.message}`,
          data: row
        });
      }
    });

    return {
      successCount: words.length,
      failureCount: failures.length,
      failures,
      words
    };
  }

  private static getChineseKey(key: string): string {
    const map: Record<string, string> = {
      word: '单词',
      meaning: '释义',
      phonetic_uk: '英式音标',
      phonetic_us: '美式音标',
      part_of_speech: '词性',
      level: '等级',
      tags: '标签',
      roots: '词根'
    };
    return map[key] || key;
  }

  private static mapRowToWord(row: any, index: number): Word {
    // Helper to get value from english or chinese key
    const get = (key: string, defaultVal = '') => {
      return row[key] || row[this.getChineseKey(key)] || defaultVal;
    };

    const wordStr = get('word');
    if (typeof wordStr !== 'string') throw new Error('Word must be a string');

    // Parse Level
    let level = get('level', 'CET4');
    if (!VALID_LEVELS.includes(level as WordLevel)) {
      level = 'CET4'; // Fallback
    }

    // Parse Examples
    // Supports:
    // 1. 'examples' column with JSON string
    // 2. 'example_en' and 'example_cn' columns (single example)
    // 3. 'example_en_1', 'example_cn_1', etc.
    const examples: { en: string; cn: string }[] = [];
    
    if (row['examples']) {
      try {
        const parsed = typeof row['examples'] === 'string' ? JSON.parse(row['examples']) : row['examples'];
        if (Array.isArray(parsed)) examples.push(...parsed);
      } catch (e) {
        // Ignore json parse error
      }
    }

    // Try discrete columns
    for (let i = 1; i <= 3; i++) {
      const en = row[`example_en_${i}`] || row[`example_en${i}`] || (i === 1 ? row['example_en'] : undefined);
      const cn = row[`example_cn_${i}`] || row[`example_cn${i}`] || (i === 1 ? row['example_cn'] : undefined);
      if (en && cn) {
        examples.push({ en, cn });
      }
    }

    return {
      id: `import-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      word: wordStr,
      phonetic_uk: get('phonetic_uk'),
      phonetic_us: get('phonetic_us'),
      part_of_speech: get('part_of_speech'),
      meaning: get('meaning'),
      level: level as WordLevel,
      tags: get('tags').split(/[,，]/).map((s: string) => s.trim()).filter(Boolean),
      examples,
      synonyms: get('synonyms', '').split(/[,，]/).filter(Boolean),
      antonyms: get('antonyms', '').split(/[,，]/).filter(Boolean),
      roots: get('roots')
    };
  }
}

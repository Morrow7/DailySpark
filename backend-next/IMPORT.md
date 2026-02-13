# Bulk Import Feature

## Overview
This feature allows administrators or users to bulk import vocabulary words from Excel or CSV files. It supports rich data including meanings, examples, and metadata.

## API Endpoint
`POST /api/words/import`

### Headers
- `Authorization`: Bearer <token>
- `Content-Type`: multipart/form-data

### Body
- `file`: The Excel (.xlsx) or CSV file.

## Data Format
The file should have the following headers (English or Chinese):

| English Key | Chinese Header | Required | Description |
|---|---|---|---|
| `word` | `单词` | Yes | The target word |
| `meaning` | `释义` | Yes | Chinese definition |
| `phonetic` | `音标` | No | IPA phonetic symbol |
| `partOfSpeech` | `词性` | No | e.g. n., v., adj. |
| `level` | `等级` | No | e.g. CET4, IELTS |
| `example` | `例句` | No | English example sentence |

## Performance & Limits
- **File Size**: Max 10MB
- **Batch Size**: Processing is chunked (50 items/batch) to ensure stability.
- **Speed**: Target < 30s for 3000 words.
- **Deduplication**: Automatically skips words that already exist in the user's library (case-insensitive).

## Error Handling
The API returns a summary object:
```json
{
  "success": true,
  "total": 100,
  "imported": 95,
  "duplicates": 3,
  "failed": 2,
  "errors": [
    { "row": 12, "error": [...] }
  ]
}
```

## Testing
Run `npm run test:import` to simulate an import session with valid, duplicate, and invalid data.

# Challenge Generation System - Implementation Guide

## Overview

This guide documents the comprehensive challenge generation system implemented based on `prompt.txt` specifications. The system generates high-quality, original coding challenges using AI with full control over difficulty, language, topics, and problem styles.

## Architecture

### 1. Database Schema (`backend/prisma/schema.prisma`)

The `Challenge` model has been extended with all fields from the prompt.txt specification:

**Core Fields:**
- `title`, `description`, `difficulty`, `language`, `rubric`

**New Fields from prompt.txt:**
- `topic` - Subject area (arrays, recursion, OOP, etc.)
- `problemStyle` - Type of problem (Algorithmic, Real-world, Debugging, Code Completion, Optimization)
- `inputFormat` - How input is provided
- `outputFormat` - Expected output format
- `constraints` - Technical constraints (JSON array as string)
- `examples` - Example inputs/outputs with explanations (JSON array)
- `starterCode` - Skeleton code to help students start
- `referenceSolution` - Working solution for validation
- `timeComplexity` - Big O time complexity
- `spaceComplexity` - Big O space complexity
- `edgeCases` - Important edge cases (JSON array)
- `hints` - Progressive hints (JSON array)
- `testCases` - Test cases for validation (JSON array)

### 2. AI Service (`backend/services/aiService.js`)

Two main functions for challenge generation:

#### `generateChallengeFromSpec(params)`
**Purpose:** Generate challenges using the full prompt.txt specification

**Parameters:**
```javascript
{
  language: 'C' | 'C++' | 'Java' | 'JavaScript' | 'Python',
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert',
  topic: string,  // e.g., 'arrays', 'recursion', 'graphs'
  problemStyle: 'Algorithmic' | 'Real-world' | 'Debugging' | 'Code Completion' | 'Optimization',
  outputLength: 'Short' | 'Medium' | 'Long',
  includeHints: boolean,
  includeTests: boolean
}
```

**Returns:** Complete challenge object with all prompt.txt fields

**How it works:**
1. Embeds the entire master prompt from prompt.txt into the AI request
2. Includes difficulty calibration guidelines
3. Specifies exact JSON schema for output
4. Uses higher token limit (3072) for comprehensive responses

#### `generateChallenge(level, language, recentTopics)` 
**Purpose:** Legacy compatibility function

**How it works:**
1. Converts numeric level (1-5) to difficulty string
2. Calls `generateChallengeFromSpec()` internally
3. Returns data in both legacy and new formats for backward compatibility

### 3. API Endpoints (`backend/routes/challenges.js`)

#### `POST /api/challenges/generate` (Legacy)
- Maintains backward compatibility
- Uses user's level to determine difficulty
- Saves all new fields to database

#### `POST /api/challenges/generate-advanced` (New)
- Full control over all prompt.txt parameters
- Input validation using Zod schema
- Returns comprehensive challenge data

**Request Example:**
```json
{
  "language": "Python",
  "difficulty": "Medium",
  "topic": "arrays",
  "problemStyle": "Algorithmic",
  "outputLength": "Medium",
  "includeHints": true,
  "includeTests": true
}
```

**Response Example:**
```json
{
  "id": "...",
  "title": "Binary Search Implementation",
  "description": "Implement binary search...",
  "difficulty": 3,
  "language": "Python",
  "topic": "arrays",
  "problemStyle": "Algorithmic",
  "inputFormat": "A sorted array and target value",
  "outputFormat": "Index of target or -1",
  "constraints": "[\"1 <= arr.length <= 10^4\"]",
  "examples": "[{\"input\": \"...\", \"output\": \"...\"}]",
  "starterCode": "def binary_search(arr, target):\n    pass",
  "referenceSolution": "def binary_search(arr, target):\n    ...",
  "timeComplexity": "O(log n)",
  "spaceComplexity": "O(1)",
  "edgeCases": "[\"Empty array\", \"Single element\"]",
  "hints": "[\"Think about dividing search space\"]",
  "testCases": "[{\"input\": \"...\", \"expected_output\": \"...\"}]"
}
```

### 4. Validation

Zod schema enforces:
- Valid language selection (C, C++, Java, JavaScript, Python)
- Valid difficulty levels (Beginner, Easy, Medium, Hard, Expert)
- Valid problem styles (5 types)
- Valid output lengths (Short, Medium, Long)
- Boolean flags for hints and tests

Invalid inputs return 400 with detailed error messages.

### 5. Frontend Integration (`frontend/src/api/index.js`)

New API function exported:
```javascript
export const generateAdvancedChallenge = (data) => 
  API.post('/api/challenges/generate-advanced', data);
```

## Difficulty Calibration

As specified in prompt.txt:

| Level | Characteristics |
|-------|----------------|
| **Beginner** | Basic syntax, simple loops/conditions, no advanced data structures |
| **Easy** | Arrays, strings, basic functions, simple OOP |
| **Medium** | Hash maps, stacks, queues, recursion, moderate algorithmic thinking |
| **Hard** | Dynamic programming, graph algorithms, advanced data structures |
| **Expert** | Optimization heavy, multi-concept fusion, deep reasoning |

## Problem Styles

1. **Algorithmic** - Classic algorithm implementation problems
2. **Real-world** - Practical scenarios and applications
3. **Debugging** - Find and fix errors in code
4. **Code Completion** - Fill in missing parts
5. **Optimization** - Improve existing code performance

## Usage Examples

### Basic Challenge Generation (Legacy)
```javascript
// In frontend
const response = await generateChallenge({ language: 'javascript' });
```

### Advanced Challenge Generation
```javascript
// In frontend
const response = await generateAdvancedChallenge({
  language: 'Python',
  difficulty: 'Medium',
  topic: 'binary search',
  problemStyle: 'Algorithmic',
  outputLength: 'Medium',
  includeHints: true,
  includeTests: true
});
```

## Testing

Comprehensive test suite in `backend/tests/integration/challenges-integration.test.js`:

1. ✅ Legacy endpoint still works
2. ✅ Advanced endpoint generates comprehensive challenges
3. ✅ Input validation works correctly
4. ✅ Default values are applied
5. ✅ Rate limiting (1 request/minute per user)
6. ✅ Authentication required
7. ✅ Error handling for AI failures

**Run tests:**
```bash
cd ai-coding-tutor/backend
npm test -- challenges-integration.test.js
```

## Rate Limiting

Both endpoints enforce:
- 1 challenge generation per minute per user
- Returns 429 status if rate limit exceeded

## Error Handling

- **400** - Invalid input parameters (Zod validation failure)
- **401** - Authentication required
- **429** - Rate limit exceeded
- **500** - AI service failure or database error

## Migration Notes

To apply the schema changes:

```bash
cd ai-coding-tutor/backend
npx prisma generate
npx prisma db push
```

**Note:** The database uses MongoDB, so fields are automatically added. Existing challenges will have `null` for new fields.

## Future Enhancements

Potential improvements:
1. Allow instructors to customize the master prompt
2. Add challenge versioning
3. Implement A/B testing for different prompt formats
4. Add analytics on which difficulty/topic combinations work best
5. Create challenge templates for common patterns
6. Add multi-language challenge generation (generate same challenge in multiple languages)

## Prompt.txt Compliance

✅ All required fields implemented
✅ Difficulty calibration guidelines embedded
✅ Validation for all input types
✅ Comprehensive JSON schema output
✅ Support for all 5 languages
✅ Support for all 5 problem styles
✅ Optional hints and tests
✅ Edge cases and constraints included
✅ Complexity analysis included

## Summary

The implementation fully satisfies the prompt.txt specification, providing:
- ✅ Comprehensive challenge generation with 20+ fields
- ✅ Full control over language, difficulty, topic, and style
- ✅ Backward compatibility with existing system
- ✅ Input validation and error handling
- ✅ Extensive test coverage
- ✅ Production-ready API endpoints

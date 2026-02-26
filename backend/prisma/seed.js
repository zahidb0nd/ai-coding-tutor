require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const challenges = [
    {
        title: 'Hello World Function',
        description:
            'Write a JavaScript function called `greet` that takes a name as a parameter and returns the string "Hello, [name]!". If no name is provided, it should return "Hello, World!".',
        difficulty: 1,
        language: 'javascript',
        rubric:
            'Function is named greet (10pts). Takes a name parameter (10pts). Returns correct greeting with name (30pts). Handles missing name with default "World" (30pts). Uses proper string formatting (10pts). No syntax errors (10pts).',
    },
    {
        title: 'Array Sum Calculator',
        description:
            'Write a function called `sumArray` that takes an array of numbers and returns their sum. Handle edge cases: if the array is empty, return 0. If the input is not an array, return null.',
        difficulty: 1,
        language: 'javascript',
        rubric:
            'Function named sumArray (10pts). Correctly sums array elements (30pts). Returns 0 for empty array (20pts). Returns null for non-array input (20pts). Uses proper loop or reduce method (10pts). No syntax errors (10pts).',
    },
    {
        title: 'FizzBuzz',
        description:
            'Write a function called `fizzBuzz` that takes a number n and returns an array of strings from 1 to n. For multiples of 3, use "Fizz". For multiples of 5, use "Buzz". For multiples of both 3 and 5, use "FizzBuzz". For all other numbers, use the number as a string.',
        difficulty: 2,
        language: 'javascript',
        rubric:
            'Function named fizzBuzz (10pts). Returns array of correct length (10pts). Correctly identifies multiples of 3 as "Fizz" (20pts). Correctly identifies multiples of 5 as "Buzz" (20pts). Correctly identifies multiples of both as "FizzBuzz" (20pts). Converts other numbers to strings (10pts). No syntax errors (10pts).',
    },
    {
        title: 'Palindrome Checker',
        description:
            'Write a function called `isPalindrome` that takes a string and returns true if it is a palindrome (reads the same backward as forward), and false otherwise. The check should be case-insensitive and should ignore spaces and punctuation.',
        difficulty: 2,
        language: 'javascript',
        rubric:
            'Function named isPalindrome (10pts). Returns boolean (10pts). Correctly identifies palindromes (25pts). Case-insensitive comparison (20pts). Ignores spaces and punctuation (20pts). Handles edge cases like empty string (5pts). No syntax errors (10pts).',
    },
    {
        title: 'Object Frequency Counter',
        description:
            'Write a function called `charFrequency` that takes a string and returns an object where each key is a character and the value is how many times it appears. Ignore spaces. All characters should be lowercase in the output.',
        difficulty: 2,
        language: 'javascript',
        rubric:
            'Function named charFrequency (10pts). Returns object with correct keys (20pts). Correct frequency counts (25pts). Ignores spaces (15pts). Converts to lowercase (15pts). Handles empty string (5pts). No syntax errors (10pts).',
    },
    {
        title: 'Array Deduplication',
        description:
            'Write a function called `removeDuplicates` that takes an array and returns a new array with all duplicate values removed, preserving the original order of first appearances. Do NOT use Set — implement the logic manually using loops or array methods.',
        difficulty: 3,
        language: 'javascript',
        rubric:
            'Function named removeDuplicates (10pts). Returns new array without duplicates (30pts). Preserves original order (20pts). Does not use Set (10pts). Handles empty array (10pts). Works with different data types (10pts). No syntax errors (10pts).',
    },
    {
        title: 'Deep Object Clone',
        description:
            'Write a function called `deepClone` that takes an object and returns a deep copy. It should handle nested objects, arrays, and primitive values. Modifying the clone should not affect the original. Do not use JSON.parse/JSON.stringify.',
        difficulty: 3,
        language: 'javascript',
        rubric:
            'Function named deepClone (10pts). Correctly clones primitive values (10pts). Correctly clones nested objects (25pts). Correctly clones arrays (20pts). Modifications to clone don\'t affect original (20pts). Does not use JSON trick (5pts). No syntax errors (10pts).',
    },
    {
        title: 'Debounce Function',
        description:
            'Implement a `debounce` function that takes a callback function and a delay in milliseconds. It should return a new function that delays invoking the callback until after the specified delay has elapsed since the last time the debounced function was called. If called again before the delay, the timer resets.',
        difficulty: 4,
        language: 'javascript',
        rubric:
            'Function named debounce (10pts). Takes callback and delay parameters (10pts). Returns a new function (15pts). Delays execution by specified time (20pts). Resets timer on subsequent calls (25pts). Uses clearTimeout correctly (10pts). No syntax errors (10pts).',
    },
    {
        title: 'Promise.all Implementation',
        description:
            'Write a function called `promiseAll` that mimics the behavior of Promise.all(). It should take an array of promises and return a new promise that resolves with an array of results when all promises resolve, or rejects as soon as any promise rejects.',
        difficulty: 4,
        language: 'javascript',
        rubric:
            'Function named promiseAll (10pts). Returns a Promise (10pts). Resolves with array of results in correct order (25pts). Rejects immediately if any promise rejects (20pts). Handles empty array input (10pts). Handles non-promise values in array (15pts). No syntax errors (10pts).',
    },
    {
        title: 'Mini Event Emitter',
        description:
            'Create a class called `EventEmitter` with three methods: `on(event, callback)` to register a listener, `emit(event, ...args)` to trigger all listeners for an event with optional arguments, and `off(event, callback)` to remove a specific listener. Support multiple listeners per event.',
        difficulty: 5,
        language: 'javascript',
        rubric:
            'Class named EventEmitter (10pts). on() correctly registers listeners (20pts). emit() triggers all registered listeners with correct args (25pts). off() removes specific listener (20pts). Supports multiple listeners per event (15pts). Handles edge cases like emitting unregistered events (5pts). No syntax errors (5pts).',
    },
];

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing challenges
    await prisma.submission.deleteMany();
    await prisma.challenge.deleteMany();

    // Insert challenges
    for (const challenge of challenges) {
        await prisma.challenge.create({ data: challenge });
    }

    console.log(`✅ Seeded ${challenges.length} challenges`);
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

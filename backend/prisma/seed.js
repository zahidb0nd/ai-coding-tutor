require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const baseChallenges = [
    {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 1,
        rubric: 'Code must find the two indices correctly. Time complexity should be O(N) using a hash map.',
        examples: JSON.stringify([{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }]),
        testCases: JSON.stringify([{ input: 'nums = [3,2,4], target = 6', expected_output: '[1,2]' }])
    },
    {
        title: 'Reverse String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.',
        difficulty: 1,
        rubric: 'Code must reverse the sequence in place. Time complexity O(N).',
        examples: JSON.stringify([{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: 'Elements are swapped to reverse the array.' }]),
        testCases: JSON.stringify([{ input: 's = ["H","a","n","n","a","h"]', expected_output: '["h","a","n","n","a","H"]' }])
    },
    {
        title: 'Fizz Buzz',
        description: 'Given an integer n, return a string array answer (1-indexed) where: answer[i] == "FizzBuzz" if i is divisible by 3 and 5, "Fizz" if divisible by 3, "Buzz" if divisible by 5, and i (as a string) otherwise.',
        difficulty: 1,
        rubric: 'Correct outputs for multiples of 3, 5, and 15.',
        examples: JSON.stringify([{ input: 'n = 3', output: '["1","2","Fizz"]', explanation: '3 is div by 3.' }]),
        testCases: JSON.stringify([{ input: 'n = 5', expected_output: '["1","2","Fizz","4","Buzz"]' }])
    },
    {
        title: 'Valid Palindrome',
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
        difficulty: 1,
        rubric: 'Code accurately filters characters and checks reverse equivalence in O(N).',
        examples: JSON.stringify([{ input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: 'amanaplanacanalpanama is a palindrome.' }]),
        testCases: JSON.stringify([{ input: 's = "race a car"', expected_output: 'false' }])
    },
    {
        title: 'Fibonacci Number',
        description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.',
        difficulty: 1,
        rubric: 'Recursive or iterative approach must return F(n).',
        examples: JSON.stringify([{ input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' }]),
        testCases: JSON.stringify([{ input: 'n = 4', expected_output: '3' }])
    },
    {
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        difficulty: 2,
        rubric: 'Must use Kadane\'s algorithm or similar O(N) approach.',
        examples: JSON.stringify([{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6.' }]),
        testCases: JSON.stringify([{ input: 'nums = [1]', expected_output: '1' }])
    },
    {
        title: 'Merge Intervals',
        description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        difficulty: 2,
        rubric: 'Properly sort intervals and combine overlaps. Time complexity O(N log N).',
        examples: JSON.stringify([{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merge them into [1,6].' }]),
        testCases: JSON.stringify([{ input: 'intervals = [[1,4],[4,5]]', expected_output: '[[1,5]]' }])
    },
    {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
        difficulty: 2,
        rubric: 'Requires use of a stack to match brackets. Time complexity O(N).',
        examples: JSON.stringify([{ input: 's = "()"', output: 'true', explanation: 'Matches correctly.' }]),
        testCases: JSON.stringify([{ input: 's = "(]"', expected_output: 'false' }])
    },
    {
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 2,
        rubric: 'Use dynamic programming or fibonacci approach to find combinations.',
        examples: JSON.stringify([{ input: 'n = 2', output: '2', explanation: '1+1 and 2.' }]),
        testCases: JSON.stringify([{ input: 'n = 3', expected_output: '3' }])
    },
    {
        title: 'Missing Number',
        description: 'Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.',
        difficulty: 2,
        rubric: 'O(N) time and O(1) space required using mathematical sum or XOR.',
        examples: JSON.stringify([{ input: 'nums = [3,0,1]', output: '2', explanation: 'n=3, sum should be 6, actual sum is 4. 6-4=2.' }]),
        testCases: JSON.stringify([{ input: 'nums = [0,1]', expected_output: '2' }])
    },
    {
        title: 'Move Zeroes',
        description: 'Given an integer array nums, move all 0\'s to the end of it while maintaining the relative order of the non- zero elements.',
        difficulty: 2,
        rubric: 'Must update array in-place without copying it.',
        examples: JSON.stringify([{ input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]', explanation: 'Ordered zero placement.' }]),
        testCases: JSON.stringify([{ input: 'nums = [0]', expected_output: '[0]' }])
    },
    {
        title: 'Reverse Linked List',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        difficulty: 3,
        rubric: 'Pointer manipulation required to reverse nodes in O(N).',
        examples: JSON.stringify([{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Successfully reverses list.' }]),
        testCases: JSON.stringify([{ input: 'head = [1,2]', expected_output: '[2,1]' }])
    },
    {
        title: 'Linked List Cycle',
        description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
        difficulty: 3,
        rubric: 'Must utilize slow and fast pointers for O(1) space complexity.',
        examples: JSON.stringify([{ input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'Tail connects to 1st node.' }]),
        testCases: JSON.stringify([{ input: 'head = [1], pos = -1', expected_output: 'false' }])
    },
    {
        title: 'LRU Cache',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        difficulty: 4,
        rubric: 'Uses combination of Hash Map and Doubly Linked list for O(1) ops.',
        examples: JSON.stringify([{ input: 'operations on capacity 2', output: 'correct values', explanation: 'Values are properly tracked/evicted.' }]),
        testCases: JSON.stringify([{ input: 'get/put', expected_output: 'validity' }])
    },
    {
        title: 'Number of Islands',
        description: 'Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands.',
        difficulty: 3,
        rubric: 'Requires DFS or BFS traversal of grid.',
        examples: JSON.stringify([{ input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3', explanation: '3 disconnected islands.' }]),
        testCases: JSON.stringify([{ input: 'grid = [["1","0"],["0","1"]]', expected_output: '2' }])
    },
    {
        title: 'Binary Search',
        description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
        difficulty: 3,
        rubric: 'Time complexity must be O(log N).',
        examples: JSON.stringify([{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists at index 4.' }]),
        testCases: JSON.stringify([{ input: 'nums = [-1,0,3,5,9,12], target = 2', expected_output: '-1' }])
    },
    {
        title: 'Longest Substring Without Repeating Characters',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        difficulty: 3,
        rubric: 'Use sliding window approach. Time complexity O(N).',
        examples: JSON.stringify([{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }]),
        testCases: JSON.stringify([{ input: 's = "bbbbb"', expected_output: '1' }])
    },
    {
        title: 'Contains Duplicate',
        description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
        difficulty: 1,
        rubric: 'Use Hash Set for O(N) complexity.',
        examples: JSON.stringify([{ input: 'nums = [1,2,3,1]', output: 'true', explanation: '1 appears twice.' }]),
        testCases: JSON.stringify([{ input: 'nums = [1,2,3,4]', expected_output: 'false' }])
    },
    {
        title: 'Product of Array Except Self',
        description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
        difficulty: 4,
        rubric: 'Do not use division operation. Resolve in O(N).',
        examples: JSON.stringify([{ input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Product combinations.' }]),
        testCases: JSON.stringify([{ input: 'nums = [-1,1,0,-3,3]', expected_output: '[0,0,9,0,0]' }])
    },
    {
        title: 'Best Time to Buy and Sell Stock',
        description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
        difficulty: 2,
        rubric: 'One-pass O(N) complexity to track minimum buy price and maximum profit.',
        examples: JSON.stringify([{ input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' }]),
        testCases: JSON.stringify([{ input: 'prices = [7,6,4,3,1]', expected_output: '0' }])
    }
];

const languages = ['javascript', 'typescript', 'python', 'c'];

async function main() {
    console.log('Clearing existing data...');
    await prisma.submission.deleteMany({});
    await prisma.challenge.deleteMany({});

    console.log(`Seeding 80 challenges (20 challenges x ${languages.length} languages)...`);

    let count = 0;
    for (const lang of languages) {
        for (const base of baseChallenges) {
            const challengeToCreate = {
                title: `${base.title} (${lang})`,
                description: base.description,
                difficulty: base.difficulty,
                language: lang,
                rubric: base.rubric,
                examples: base.examples,
                testCases: base.testCases,
                topic: 'Algorithms'
            };

            await prisma.challenge.create({
                data: challengeToCreate
            });
            count++;
        }
    }

    console.log(`Seeding completed successfully! Created ${count} challenges.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding 5 new challenges...');

    const challenges = [
        {
            title: 'ASCII Value Finder',
            description: 'Write a program to find and print the ASCII value of a given character.',
            difficulty: 1,
            language: 'c',
            rubric: 'Code must correctly output the ASCII value. Efficiency is O(1).',
            examples: JSON.stringify([
                { input: 'A', output: '65', explanation: 'The ASCII value of A is 65.' },
                { input: 'z', output: '122', explanation: 'The ASCII value of z is 122.' }
            ]),
            testCases: JSON.stringify([
                { input: 'B', expected_output: '66' },
                { input: '!', expected_output: '33' }
            ])
        },
        {
            title: 'Reverse String via Pointers',
            description: 'Write a C program that reverses a given string strictly using pointers, without using standard library functions like strrev().',
            difficulty: 2,
            language: 'c',
            rubric: 'Code must use pointers to swap characters in place. Time complexity should be O(N) and space O(1).',
            examples: JSON.stringify([
                { input: 'hello', output: 'olleh', explanation: 'The characters are reversed in place.' }
            ]),
            testCases: JSON.stringify([
                { input: 'world', expected_output: 'dlrow' },
                { input: 'C', expected_output: 'C' }
            ])
        },
        {
            title: 'Implement a Singly Linked List',
            description: 'Implement a basic Singly Linked List with methods to append a node and print the list.',
            difficulty: 3,
            language: 'javascript',
            rubric: 'Code should implement a Node class and LinkedList class correctly. Time complexity for append should be O(1) if tracking tail or O(N) if only tracking head.',
            examples: JSON.stringify([
                { input: '[1, 2, 3]', output: '1 -> 2 -> 3', explanation: 'Appending 1, 2, and 3 should result in this format.' }
            ]),
            testCases: JSON.stringify([
                { input: '[5]', expected_output: '5' },
                { input: '[10,20]', expected_output: '10 -> 20' }
            ])
        },
        {
            title: 'Detect Linked List Cycle',
            description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it using Floyd\\'s Cycle- Finding Algorithm(Tortoise and Hare).',
      difficulty: 4,
        language: 'c',
        rubric: 'Code should use two pointers (slow and fast). Time complexity must be O(N) and Space complexity O(1). Memory leaks should be avoided.',
        examples: JSON.stringify([
            { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).' }
        ]),
        testCases: JSON.stringify([
            { input: 'head = [1,2], pos = 0', expected_output: 'true' },
            { input: 'head = [1], pos = -1', expected_output: 'false' }
        ])
    },
{
    title: 'LRU Cache Implementation',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods in O(1) average time complexity.',
            difficulty: 5,
                language: 'python',
                    rubric: 'Must utilize a hash map and a doubly linked list or Python\\'s OrderedDict to achieve O(1) operations.',
    examples: JSON.stringify([
        { input: 'put(1, 1), put(2, 2), get(1), put(3, 3), get(2)', output: 'null, null, 1, null, -1', explanation: 'LRU cache operations tracking keys correctly.' }
    ]),
        testCases: JSON.stringify([
            { input: 'put(2,1), get(2)', expected_output: 'null, 1' }
        ])
}
  ];

for (const c of challenges) {
    const created = await prisma.challenge.create({
        data: c
    });
    console.log(`Created challenge: ${created.title}`);
}

console.log('Seeding completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

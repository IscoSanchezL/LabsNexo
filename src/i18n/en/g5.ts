import type { GradeText } from '../content';

const APPLY = 'Apply the rule in order and check the result.';

export const en5: GradeText = {
  title: 'Algorithm Inventors', world: 'Idea Factory',
  modules: {
    'Funciones propias': {
      title: 'Own functions', intro: 'A function is a block you invent: define it once and use it whenever you want.',
      levels: [
        { title: 'Use a function', prompt: 'The function “square” is already defined. Call it to draw.', concept: 'Calling a function',
          hint: ['Look in the “Functions” group in the block box.', 'Drag “square” under “when started”.', 'A single block: call square.'] },
        { title: 'Two squares', prompt: 'Draw two separate squares using the same function twice.', concept: 'Reusing',
          hint: ['Call “square”, move to the right and call it again.', 'To move: turn right 90, move forward 100 and turn left 90.', 'square, right 90, move forward 100, left 90, square.'] },
        { title: 'Invent a function', prompt: 'Write what “triangle” does inside its definition and then call it.', concept: 'Defining a function',
          hint: ['Inside “define triangle” goes the drawing of the triangle.', 'A triangle is repeating 3 times: move forward 80 and turn 120.', 'Define triangle with repeat 3 (move forward 80, right 120) and call it.'] },
        { title: 'Flower of squares', prompt: 'Turn a little after each square and repeat it to form a flower.', concept: 'Functions and loops together',
          hint: ['Inside a loop, call “square”.', 'After each square turn 45 degrees.', 'Repeat 8: call square, right 45.'] },
        { title: 'House with functions', prompt: 'Use “square” and “triangle” to draw a house with a roof.', concept: 'Composing functions',
          hint: ['First the square for the base.', 'Go up 60 to the corner and turn 30 degrees for the roof.', 'square, move forward 60, right 30, triangle.'] },
      ],
    },
    'Ordenamiento visual': {
      title: 'Visual sorting', intro: 'Watch successive comparisons and follow how the list changes.',
      levels: [
        { title: 'First bubble', prompt: 'List [4, 2, 3]. In the first comparison, which values are swapped?', concept: 'Bubble sort compares neighbors',
          options: ['4 and 2', '2 and 3', '4 and 3'], answer: '4 and 2', code: ['[4,2,3] → compare 4 and 2'],
          hint: ['Compare the first two neighbors first.', APPLY, 'Solution: 4 and 2.'], solution: '4 and 2' },
        { title: 'Next comparison', prompt: 'After [2, 4, 3], what happens when comparing 4 and 3?', concept: 'Adjacent swap',
          options: ['It becomes [4, 2, 3]', 'It becomes [2, 3, 4]', 'It becomes [3, 4, 2]'], answer: 'It becomes [2, 3, 4]',
          hint: ['The larger of the two moves to the right.', APPLY, 'Solution: It becomes [2, 3, 4].'], solution: 'It becomes [2, 3, 4]' },
        { title: 'Almost sorted', prompt: '[1, 3, 2] when comparing 3 and 2 becomes…', concept: 'Sorting trace',
          hint: ['Swap the neighbors if they are out of order.', APPLY, 'Solution: [1, 2, 3].'] },
        { title: 'Count comparisons', prompt: 'How many neighboring pairs does one pass compare for 4 values?', concept: 'Bubble pass',
          hint: ['A list of four has three neighboring pairs.', APPLY, 'Solution: 3.'] },
        { title: 'Ascending order', prompt: 'Sort 5, 1, 4 from smallest to largest.', concept: 'Ascending order',
          hint: ['The smallest must be at the start.', APPLY, 'Solution: [1, 4, 5].'] },
      ],
    },
    'Código binario': {
      title: 'Binary code', intro: 'Each switch adds a value: on is 1 and off is 0.',
      levels: [
        { title: 'Bulbs 1 0 1', prompt: 'Which decimal number does binary 101 represent?', concept: 'Positional binary system',
          hint: ['The positions are worth 4, 2 and 1.', APPLY, 'Solution: 5.'] },
        { title: 'Turn on the 6', prompt: 'Which combination of values adds up to 6?', concept: 'Representing a sum in binary',
          hint: ['Combine 4 and 2; leave the 1 off.', APPLY, 'Solution: 110.'] },
        { title: 'Value on the right', prompt: 'In 1001, what is the right-hand switch worth?', concept: 'Binary place value',
          hint: ['The rightmost position is worth one.', APPLY, 'Solution: 1.'] },
        { title: 'Sum of lights', prompt: 'The 8, 4, 2, 1 switches are at 0,1,1,0. What is the total?', concept: 'Binary conversion',
          hint: ['Add only the values that are on.', APPLY, 'Solution: 6.'] },
        { title: 'Make nine', prompt: 'Which binary pattern represents 9?', concept: 'Encoding numbers',
          hint: ['Nine is eight plus one.', APPLY, 'Solution: 1001.'] },
      ],
    },
    'Más funciones': {
      title: 'More functions', intro: 'Define your own functions and combine them to draw bigger things.',
      levels: [
        { title: 'A line function', prompt: 'Use the function “line” twice to make a corner.', concept: 'Calling several times',
          hint: ['Call “line”, turn and call it again.', 'The turn is 90 degrees to the right.', 'line, right 90, line.'] },
        { title: 'The hexagon', prompt: 'Write inside “hexagon” what it draws and then call it.', concept: 'Defining a function',
          hint: ['Inside “define hexagon” goes a loop.', 'Six times: move forward 50 and turn 60.', 'Define hexagon with repeat 6 (move forward 50, right 60) and call it.'] },
        { title: 'Broken function', prompt: 'The square is left open. Fix the function.', concept: 'Debugging a function',
          hint: ['Look inside the definition of “square”.', 'A square has four sides.', 'Change the 3 to a 4.'] },
        { title: 'Three turned squares', prompt: 'Call “square” three times, turning between each one.', concept: 'Functions inside loops',
          hint: ['Inside a loop, call “square”.', 'Three squares go all the way around: 360 ÷ 3 degrees.', 'Repeat 3: square, right 120.'] },
        { title: 'Windmill', prompt: 'Define “windmill” using the function “square” four times.', concept: 'Functions that use functions',
          hint: ['Inside “windmill” you can call “square”.', 'Four squares, turning 90 degrees between each one.', 'Define windmill with repeat 4 (square, right 90) and call it.'] },
      ],
    },
  },
  exam: [
    { question: 'What happens when you call a function?', options: ['Its instructions run', 'The program is erased', 'The computer turns off'], answer: 'Its instructions run' },
    { question: 'move(4) uses 4 as…', options: ['A parameter', 'An error', 'An answer'], answer: 'A parameter' },
    { question: 'Bubble sort compares…', options: ['Neighboring elements', 'The first with the last', 'Random elements'], answer: 'Neighboring elements' },
    { question: '[4,2] after comparing and swapping becomes…', options: ['[2,4]', '[4,2]', '[4,4]'], answer: '[2,4]' },
    { question: 'One pass over 4 values compares… neighboring pairs.', options: ['2', '3', '4'], answer: '3' },
    { question: 'Which decimal number does 101 in binary represent?', options: ['4', '5', '6'], answer: '5' },
    { question: 'Which binary pattern adds 4+2?', options: ['101', '110', '111'], answer: '110' },
    { question: 'What is the right-hand switch worth?', options: ['1', '2', '8'], answer: '1' },
    { question: '0110 uses values 8,4,2,1. What does it add up to?', options: ['5', '6', '7'], answer: '6' },
    { question: 'Which pattern represents nine?', options: ['1000', '1001', '1010'], answer: '1001' },
  ],
  advanced: {
    title: 'Algorithm bank', intro: 'Optional challenges about efficiency, tracing and representation.',
    questions: [
      { question: 'How many comparisons does one bubble-sort pass make with 8 elements?', options: ['7', '8', '16'], answer: '7' },
      { question: 'In [5,2,4], after comparing 5 and 2, the list becomes…', options: ['[2,5,4]', '[5,2,4]', '[2,4,5]'], answer: '[2,5,4]' },
      { question: 'Which binary representation matches 13?', options: ['1011', '1101', '1110'], answer: '1101' },
      { question: 'A function receives n and returns n×n. For n=5 it returns…', options: ['10', '20', '25'], answer: '25' },
      { question: 'What improvement does a reusable function usually bring?', options: ['It avoids repeating the same instructions', 'It makes the algorithm need no data', 'It always cuts the result in half'], answer: 'It avoids repeating the same instructions' },
    ],
  },
};

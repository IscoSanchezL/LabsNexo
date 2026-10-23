import type { ModuleText } from '../content';

const RIGHT = 'Repeat until the goal: if right → right and move forward; else if ahead → move forward; else left.';
const LEFT = 'Repeat until the goal: if left → left and move forward; else if ahead → move forward; else right.';

/** Traducciones del segundo lote de retos extra, por grado y por el título en español del módulo. */
export const enExtra2: Record<number, Record<string, ModuleText>> = {
  1: {
    'Arregla al robot': {
      title: 'Fix the robot', intro: 'The robot’s program has a bug. Find which block to change!',
      levels: [
        { title: 'A step is missing', prompt: 'The robot stops short. What does it need?', concept: 'Counting the steps', hint: ['Count the squares up to the goal.', 'The robot takes three steps, but more are needed.', 'Add a “move forward” block.'] },
        { title: 'Turn the other way', prompt: 'The path goes up, but the robot crashes. Which turn is wrong?', concept: 'Left or right', hint: ['Press ▶ and see where it crashes.', 'The path goes up and the robot turns down.', 'Change the right turn to a left turn.'] },
        { title: 'One turn too many', prompt: 'There is one turn too many. Remove it.', concept: 'Removing what is extra', hint: ['Look at how many turns are in a row.', 'Two turns in a row make the robot face backwards.', 'Remove one of the turns.'] },
        { title: 'Wrong order', prompt: 'The robot turns too early. Change the order of the blocks.', concept: 'Order matters', hint: ['Before turning, the robot must reach the corner.', 'Right now it turns toward a wall.', 'Put two “move forward” blocks before the turn.'] },
        { title: 'A star is missing', prompt: 'The robot reaches the goal but leaves a star behind.', concept: 'Checking the whole goal', hint: ['Press ▶ and see which square the robot skips.', 'The star is below the direct path.', 'Go down to collect the star and come back up to the goal.'] },
      ],
    },
    'Primeros dibujos': {
      title: 'First drawings', intro: 'The turtle draws wherever it goes. Copy the ghost drawing, one stroke at a time.',
      levels: [
        { title: 'Long line', prompt: 'Make the turtle draw the long line.', concept: 'Moving draws', hint: ['The turtle starts facing up.', 'Use a “move forward” block with a big number.', 'Move forward 150.'] },
        { title: 'The letter L', prompt: 'Draw an L: go up and then turn.', concept: 'Move, turn and move', hint: ['First go up 100.', 'Then turn right 90 degrees.', 'Move forward 100, right 90, move forward 60.'] },
        { title: 'The letter T', prompt: 'Draw a T. You will have to go back over your steps.', concept: 'Turning both ways', hint: ['Go up 100 and turn left to draw half of the top bar.', 'Turn around (180 degrees) to draw the other half.', 'Move forward 100, left 90, move forward 50, right 180, move forward 100.'] },
        { title: 'Staircase', prompt: 'Draw two equal steps.', concept: 'A pattern of steps', hint: ['Each step: go up, turn right, move and face up again.', 'There are two equal steps.', 'Move forward 40, right 90, move forward 40, left 90, and again.'] },
        { title: 'My square', prompt: 'Draw a square without loops: one side at a time.', concept: 'Four equal sides', hint: ['A square has four equal sides.', 'Between sides the turtle turns 90 degrees.', 'Move forward 80 and right 90, four times.'] },
      ],
    },
  },
  2: {
    'Más bucles': {
      title: 'More loops', intro: 'The paths are longer. A loop saves you lots of blocks!',
      levels: [
        { title: 'Eleven steps', prompt: 'A very long path. How many times do you repeat “move forward”?', concept: 'Repeating many times', hint: ['Count the squares between the robot and the goal.', 'Put “move forward” inside “repeat”.', 'Repeat 11 times: move forward.'] },
        { title: 'Wide U', prompt: 'Go around in a U shape with three stretches.', concept: 'Loops and turns', hint: ['The path has three stretches and two right turns.', 'Use a loop for each stretch.', 'Repeat 4 move, right, repeat 2 move, right, repeat 4 move.'] },
        { title: 'Four-step staircase', prompt: 'Four equal steps: find the group that repeats.', concept: 'Repeating a group', hint: ['Look at one step: two squares, down, one square, back.', 'That group of five blocks repeats four times.', 'Repeat 4: move, move, right, move, left.'] },
        { title: 'Stars and a corner', prompt: 'Collect all the stars with two loops.', concept: 'Collecting and turning', hint: ['Four steps to the right, a corner and three steps down.', 'One loop for each straight stretch.', 'Repeat 4 move, right, repeat 3 move.'] },
        { title: 'Around the square', prompt: 'Go around the square collecting all the stars and finish at the goal.', concept: 'Planning with loops', hint: ['You must go all the way around the square: the goal is right below the start.', 'Three sides of three steps and one of two, with three turns.', 'Repeat 3 move, right, ×3, and at the end repeat 2 move.'] },
      ],
    },
    'Dibujos que se repiten': {
      title: 'Drawings that repeat', intro: 'If a drawing repeats, a loop draws it for you!',
      levels: [
        { title: 'Dotted line', prompt: 'Draw a dashed line: draw, jump, draw, jump…', concept: 'Pen up and down', hint: ['Each dash: move with the pen down and then move with the pen up.', 'Do not forget to put the pen down again.', 'Repeat 4: move forward 20, pen up, move forward 20, pen down.'] },
        { title: 'The cross', prompt: 'Draw a cross: four arms coming out of the center.', concept: 'Going and coming back', hint: ['Each arm: move forward, turn around and come back to the center.', 'Then turn a quarter turn for the next arm.', 'Repeat 4: move forward 60, right 180, move forward 60, right 90.'] },
        { title: 'The rhombus', prompt: 'A rhombus has equal sides but different corners.', concept: 'Two alternating turns', hint: ['The corners of the rhombus are two sizes: 60 and 120 degrees.', 'The group “side, turn, side, turn” repeats twice.', 'Repeat 2: move forward 70, right 60, move forward 70, right 120.'] },
        { title: 'Color stripes', prompt: 'A line that changes color on every stretch.', concept: 'Changing color', hint: ['Each round uses two colors.', 'Change the color before each stretch.', 'Repeat 3: color red, move forward 30, color blue, move forward 30.'] },
        { title: 'Turned square', prompt: 'A tilted square, like a diamond.', concept: 'Turning before drawing', hint: ['It is a normal square, but the turtle starts turned.', 'Turn 45 degrees before the loop.', 'Right 45, repeat 4: move forward 60, right 90.'] },
      ],
    },
  },
  3: {
    'Laberintos con bucles': {
      title: 'Mazes with loops', intro: 'Longer, trickier paths. Combine loops and “repeat until the goal”.',
      levels: [
        { title: 'The long L', prompt: 'One very long stretch and a shorter one.', concept: 'Two loops', hint: ['Six steps to the right and three down.', 'One loop for each stretch.', 'Repeat 6 move, right, repeat 3 move.'] },
        { title: 'Staircase to the goal', prompt: 'Do not count the steps: repeat until you arrive!', concept: 'Repeat until a condition', hint: ['Each step is the same group of blocks.', 'Use “repeat until the goal” with the step inside.', 'Repeat until the goal: move, move, right, move, left.'] },
        { title: 'Giant U', prompt: 'Three stretches of four steps.', concept: 'Loops and turns', hint: ['There are three equal stretches with two right turns.', 'One loop for each stretch.', 'Repeat 4 move, right, repeat 4 move, right, repeat 4 move.'] },
        { title: 'Alternating corners', prompt: 'Two steps, right, two steps, left… until when?', concept: 'A pattern with two turns', hint: ['Look at the pattern: two steps, turn, two steps, opposite turn.', 'It repeats until you reach the goal.', 'Repeat until the goal: move ×2, right, move ×2, left.'] },
        { title: 'Snake of stars', prompt: 'Follow the snake collecting all the stars.', concept: 'Planning a long route', hint: ['The path goes right, down, left, down and right.', 'Two right turns and two left turns.', 'Repeat 4 move, right, repeat 2, right, repeat 4, left, repeat 2, left, repeat 4.'] },
      ],
    },
    'Caza de errores': {
      title: 'Bug hunt', intro: 'Every program has a hidden bug. Try it, watch and fix it.',
      levels: [
        { title: 'Turn to the wrong side', prompt: 'The robot crashes at the corner. What changes?', concept: 'Debugging a direction', hint: ['Press ▶ and see where it crashes.', 'The path goes down, but the robot turns up.', 'Change the left turn to a right turn.'] },
        { title: 'Loops in a row', prompt: 'The two loops are stuck together and the turn ended up at the end.', concept: 'Order matters', hint: ['Press ▶ and see what the robot does.', 'The turn must go between the two stretches.', 'Move the turn between the two loops.'] },
        { title: 'One step short', prompt: 'The robot stops one step from the goal.', concept: 'Counting the steps', hint: ['Count the squares in the stretch that goes down.', 'The second loop repeats fewer times than needed.', 'Change the 2 to a 3.'] },
        { title: 'The second corner', prompt: 'The first corner is fine, the second is not.', concept: 'Step-by-step debugging', hint: ['Run the program and see which corner it crashes at.', 'The path makes two equal turns.', 'Change the left turn to a right turn.'] },
        { title: 'Loop with a turn inside', prompt: 'Someone put the turn inside the loop.', concept: 'What goes inside the loop', hint: ['Inside the loop, the robot turns after every step.', 'The turn is only needed once.', 'Take the turn out of the loop and add the second stretch.'] },
      ],
    },
  },
  4: {
    'Decisiones en laberintos': {
      title: 'Decisions in mazes', intro: 'A good algorithm solves any maze. Try the hand rule.',
      levels: [
        { title: 'Wall on the right', prompt: 'This time use your right hand: always follow the wall on the right.', concept: 'Right-hand rule', hint: ['It is like the left rule, but the other way round.', 'If there is a path to the right: turn right and move. Otherwise move forward; if you cannot, turn left.', RIGHT] },
        { title: 'Dead end', prompt: 'The path has dead ends. The left hand never gets lost.', concept: 'An algorithm for any path', hint: ['If the robot reaches a dead end, it turns around by itself.', 'If there is a path to the left, always take it.', LEFT] },
        { title: 'Collect the stars', prompt: 'The stars are in the dead ends. Collect them all!', concept: 'Exploring the whole maze', hint: ['The hand rule goes through every dead end.', 'The robot only finishes if it reaches the goal with all the stars.', RIGHT] },
        { title: 'Long maze', prompt: 'A bigger maze. The same program solves it.', concept: 'One program, many mazes', hint: ['Do not change the idea: change only the maze.', 'A good program does not depend on the size.', LEFT] },
        { title: 'Maze with treasure', prompt: 'The biggest maze in this module, with hidden stars.', concept: 'Reusing a good idea', hint: ['It is the same right-hand trick.', 'All the stars are collected without changing anything.', RIGHT] },
      ],
    },
    'Variables que cambian': {
      title: 'Changing variables', intro: 'A variable can grow on every turn. That is how growing shapes are drawn!',
      levels: [
        { title: 'Growing triangles', prompt: 'Five triangles coming out of the same corner, each one bigger.', concept: 'A variable that grows', hint: ['Inside: a triangle with the box “side”.', 'Outside: repeat 5 times and add 12 to the side.', 'Set side 12; repeat 5: [repeat 3: move forward side, right 120], change side by 12.'] },
        { title: 'Nested squares', prompt: 'Five squares, one inside the other.', concept: 'Loop and variable together', hint: ['Inside: a square with the box “side”.', 'Outside: repeat 5 times and add 20 to the side.', 'Set side 20; repeat 5: [repeat 4: move forward side, right 90], change side by 20.'] },
        { title: 'Growing rays', prompt: 'Six rays from the center, each one longer than the last.', concept: 'Changing a variable on every round', hint: ['Each ray: move forward, turn around and come back to the center.', 'Then turn 120 and add 10 to the length.', 'Set length 20; repeat 6: move forward length, right 180, move forward length, right 120, change length by 10.'] },
        { title: 'Adjustable pentagon', prompt: 'Store the side and the angle in two boxes to draw a pentagon.', concept: 'Several variables', hint: ['A pentagon has five sides: 360 ÷ 5 = 72 degrees per turn.', 'Set both boxes and use both inside the loop.', 'Set side 70; set angle 72; repeat 5: move forward side, right angle.'] },
        { title: 'Wrong angle', prompt: 'The square is left open. Which number in the box is wrong?', concept: 'Debugging a variable', hint: ['A square has 90-degree corners.', 'Look at the number the box “angle” holds.', 'Change it to 90.'] },
      ],
    },
  },
  5: {
    'Funciones en el laberinto': {
      title: 'Functions in the maze', intro: 'Keep a group of robot orders in a function and use it whenever you want.',
      levels: [
        { title: 'Step in a function', prompt: 'The function “stair” is already defined. Call it three times.', concept: 'Calling a function', hint: ['Look for “stair” in the Functions group.', 'Each call goes up one step.', 'Call stair three times.'] },
        { title: 'Define the step', prompt: 'Write what “stair” does and repeat it four times.', concept: 'Defining and repeating', hint: ['One step: move, right, move, left.', 'Inside “define stair” go those four blocks.', 'Define stair with move, right, move, left and repeat its call 4 times.'] },
        { title: 'One side, three times', prompt: 'Go around the square and collect all the stars: define “side” with two steps.', concept: 'Reusing a function', hint: ['Each side of the square is two steps long.', 'Define “side” with two “move forward” blocks and turn right between calls.', 'side, right, side, right, side, right, move.'] },
        { title: 'Many steps', prompt: 'Six steps: one function and one loop!', concept: 'A function inside a loop', hint: ['The function is already ready.', 'Call it inside a “repeat”.', 'Repeat 6: call stair.'] },
        { title: 'Up and down', prompt: 'Define “descend” and combine the two functions to reach the goal.', concept: 'Two functions together', hint: ['“descend” is the mirror of “climb”: the turns switch sides.', 'Move, right, move, left.', 'Define descend with move, right, move, left. Then repeat 2: climb, descend.'] },
      ],
    },
    'Dibujos con funciones': {
      title: 'Drawings with functions', intro: 'Invent functions and use them as building blocks for bigger and bigger drawings.',
      levels: [
        { title: 'Triangle star', prompt: 'Call “triangle” six times, turning between each one.', concept: 'A function inside a loop', hint: ['Inside a loop, call “triangle”.', 'Six triangles go all the way around: 360 ÷ 6 degrees.', 'Repeat 6: call triangle, right 60.'] },
        { title: 'Row of squares', prompt: 'Four squares in a row. Lift the pen to move between them.', concept: 'Functions and pen', hint: ['Turn to face right before you start.', 'Each round: draw the square, lift the pen, move and put it down.', 'Right 90; repeat 4: square, pen up, move forward 50, pen down.'] },
        { title: 'Define the point', prompt: 'A five-pointed star: define “point” and repeat it.', concept: 'Defining a small function', hint: ['Each point is one long side and one big turn.', 'Inside “point”: move forward 80 and right 144.', 'Define point with move forward 80, right 144; repeat 5: call point.'] },
        { title: 'Star flower', prompt: 'Use the function “star” six times, turned, to make a flower.', concept: 'Function and turn', hint: ['Call “star” inside a loop.', 'After each star turn 60 degrees.', 'Repeat 6: call star, right 60.'] },
        { title: 'Tower of squares', prompt: 'Define “tower” with three stacked squares, using the function “square”.', concept: 'Functions that use functions', hint: ['Inside “tower” you can call “square”.', 'Draw a square, go up 40 and repeat.', 'Define tower with repeat 3: square, move forward 40. Then call it.'] },
      ],
    },
  },
  6: {
    'Algoritmos de laberinto': {
      title: 'Maze algorithms', intro: 'Big mazes are solved with a short, well-thought-out rule.',
      levels: [
        { title: 'Right hand, big maze', prompt: 'Solve this maze with the right-hand rule.', concept: 'Wall-following algorithm', hint: ['Priority: right, ahead, left.', 'If there is a path to the right, take it; otherwise move forward; otherwise turn left.', RIGHT] },
        { title: 'Stars in the dead ends', prompt: 'With your left hand, collect all the stars and reach the goal.', concept: 'Exploring without getting lost', hint: ['The hand rule goes through every dead end.', 'If there is a path to the left: turn and move forward.', LEFT] },
        { title: 'No spare blocks', prompt: 'Solve the maze with the shortest possible program.', concept: 'Efficiency', hint: ['You only need one loop and two decisions.', 'Do not repeat blocks you do not need.', 'Repeat until the goal: if right → right and move forward; else if ahead → move forward; else left (7 blocks).'] },
        { title: 'The great maze of stars', prompt: 'A huge maze with hidden stars.', concept: 'One algorithm, any size', hint: ['The same rule works even if the maze is huge.', 'Collect the stars without changing the program.', LEFT] },
        { title: 'The final maze', prompt: 'The biggest of all. Show that your algorithm works.', concept: 'Testing an algorithm', hint: ['Trust your rule: you already know it works.', 'Priority: right, ahead, left.', RIGHT] },
      ],
    },
    'Espirógrafos': {
      title: 'Spirographs', intro: 'With loops inside loops and variables, the turtle draws flowers, circles and stars.',
      levels: [
        { title: 'Petal flower', prompt: 'Each petal is two arcs. Six petals make a flower.', concept: 'Three nested loops', hint: ['An arc is many short steps with a small turn.', 'A petal is two arcs with a 90 turn between them; the flower is six petals.', 'Repeat 6: [repeat 2: [repeat 9: move forward 8, right 10], right 90], right 60.'] },
        { title: 'Circle of circles', prompt: 'Twelve turned circles make a wheel.', concept: 'A circle is a polygon with many sides', hint: ['A circle: 36 short steps with a 10-degree turn.', 'Repeat the circle 12 times, turning 360 ÷ 12.', 'Repeat 12: [repeat 36: move forward 5, right 10], right 30.'] },
        { title: 'Growing spiral', prompt: 'A spiral that opens up on every turn.', concept: 'A variable in a loop', hint: ['Start with a very small side: 2.', 'On each round move forward, turn 20 degrees and add 1 to the side.', 'Set side 2; repeat 30: move forward side, right 20, change side by 1.'] },
        { title: 'Eight-pointed star', prompt: 'A star that closes after eight long sides.', concept: 'Star angles', hint: ['There are eight equal sides.', 'Each turn is 135 degrees.', 'Repeat 8: move forward 90, right 135.'] },
        { title: 'Ring of pentagons', prompt: 'Ten turned pentagons make a ring.', concept: 'Changing the inner shape', hint: ['A pentagon: 5 times move forward and turn 72.', 'Repeat it 10 times turning 360 ÷ 10.', 'Repeat 10: [repeat 5: move forward 40, right 72], right 36.'] },
      ],
    },
  },
};

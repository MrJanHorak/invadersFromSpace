userInput = [
  'cold',
  'medium',
  'hot',
  'small',
  'large',
  'tiny',
];
poemsObject = {
  poem1: `In the ${userInput[0]} park, I ${userInput[1]} with ${userInput[2]} \nBeneath the ${userInput[3]} sky, where the ${userInput[4]} did ${userInput[5]} around.\nThe [adjective] breeze, it whispered in my ${userInput[7]},\nAs I [verb] with [adjective] [noun], not a care in my ${userInput[7]}.\nThe [noun] bloomed in [color], so [adjective] and [adjective],\nWhile [plural noun] [verb] by, with laughter so [adjective].\nIn this [adjective] moment, I couldn't help but [verb] with [emotion],\nFor in the [noun]'s embrace, I found pure [noun] and devotion.`,
  inputWords: ['adjective', 'noun', 'verb', 'plural noun', 'emotion']
 
  },

console.log(poemsObject.poem1);
console.log('Please enter a ' + poemsObject.inputWords[0]);
console.log('Please enter a ' + poemsObject.inputWords[1]);
console.log('Please enter a ' + poemsObject.inputWords[2]);
console.log('Please enter a ' + poemsObject.inputWords[3]);
console.log('Please enter a ' + poemsObject.inputWords[4]);

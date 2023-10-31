const imagesArray = [
  'images/A.png',
  'images/B.png',
  'images/C.png',
  'images/D.png',
  'images/E.png',
  'images/F.png',
  'images/H.png',
  'images/J.png',
  'images/K.png',
  'images/L.png',
  'images/P.png',
  'images/R.png',
  'images/S.png',
  'images/T.png',
  'images/W.png',
  'images/Y.png',
  'images/Z.png',
  'images/A.png',
  'images/B.png',
  'images/C.png',
  'images/D.png',
  'images/E.png',
  'images/F.png',
  'images/H.png',
  'images/J.png',
  'images/K.png',
  'images/L.png',
  'images/P.png',
  'images/R.png',
  'images/S.png',
  'images/T.png',
  'images/W.png',
  'images/Y.png',
  'images/Z.png',
];
let shuffledArray = [];

function cardLayout() {
  shuffleArray(imagesArray);
  gridMaker(shuffledArray, 6);
}

function shuffleArray(arr) {
  const generatedIndex = [];
  while(generatedIndex.length !== arr.length) {
    console.log(generatedIndex.length)
    const generateNum = Math.floor(Math.random() * 34);
    if (!generatedIndex.includes(generateNum)) {
      shuffledArray.push(imagesArray[generateNum]);
      generatedIndex.push(generateNum);
    }
  }
  return shuffledArray;
}
const grid = [];
function gridMaker(shuffledArray, chunkSize) {
  for (let i = 0; i < shuffledArray.length; i += chunkSize) {
    grid.push(shuffledArray.slice(i, i + chunkSize));
  }
}
cardLayout();
console.log('Images Array length: ',imagesArray.length);

console.log('ShuffledArray: ',shuffledArray);
console.log('Grid:',grid);


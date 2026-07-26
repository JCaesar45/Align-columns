function formatText(input, justification) {
  // Split each line by the '$' delimiter
  const lines = input.map(line => line.split('$'));
  
  // Find the maximum number of columns across all lines
  const maxCols = lines.reduce((max, line) => Math.max(max, line.length), 0);
  
  // Calculate the maximum width for each column
  const maxLens = Array(maxCols).fill(0);
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      maxLens[i] = Math.max(maxLens[i], line[i].length);
    }
  }
  
  // Process each line and apply the specified justification
  const result = lines.map(line => {
    const formattedColumns = [];
    
    for (let i = 0; i < maxCols; i++) {
      // Get the word for this column, or empty string if the line doesn't have this column
      const word = i < line.length ? line[i] : '';
      const colWidth = maxLens[i];
      
      // Format the word based on justification
      let formattedWord;
      if (justification === 'left') {
        formattedWord = word.padEnd(colWidth, ' ');
      } else if (justification === 'right') {
        formattedWord = word.padStart(colWidth, ' ');
      } else if (justification === 'center') {
        const totalPadding = colWidth - word.length;
        const leftPadding = Math.floor(totalPadding / 2);
        const rightPadding = totalPadding - leftPadding;
        formattedWord = ' '.repeat(leftPadding) + word + ' '.repeat(rightPadding);
      }
      
      formattedColumns.push(formattedWord);
    }
    
    // Join columns with at least one space between them
    return formattedColumns.join(' ');
  });
  
  // Join lines with newline character
  return result.join('\n');
}

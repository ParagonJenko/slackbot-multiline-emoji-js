let grid = [
  [0, 0],
  [0, 0]
]

let slackbot_string;

function getValueOfElement(id){
  return document.getElementById(id).value;
}

function updateGrid(){
  grid[0][0] = getValueOfElement("topleft");
  grid[0][1] = getValueOfElement("topright");

  grid[1][0] = getValueOfElement("bottomleft");
  grid[1][1] = getValueOfElement("bottomright");

  console.log(grid);

  buildSlackbotString()
}
/* 

2x2 STRING

`command`\n${00}${01}\n${10}${11}\n

*/
function buildSlackbotString() {

  let command_trigger = getValueOfElement("command");
    
  let topleft = grid[0][0];
  let topright = grid[0][1];

  let bottomleft = grid[1][0]
  let bottomright = grid[1][1]

  slackbot_string = `\`${command_trigger}\`\\n`
  slackbot_string += `:${topleft}::${topright}:\\n`
  slackbot_string += `:${bottomleft}::${bottomright}:\\n`

  console.log(slackbot_string);

  document.getElementById("slackbot_string").innerText = slackbot_string;

}
# A small Javascript website that allows you to easily create multiline Slackbot emojis.

_This was originally attempted to be built in Python but unfortunately the library didn't work_

## How do I use this?

See [the GitHub pages](https://paragonjenko.github.io/slackbot-multiline-emoji-js/)

## The Project:

To use the open source [image-splitter](https://github.com/RuyiLi/image-splitter) Javascript library to split the image, and produce a string to add to Slack along with the emojis!

### The hurdles:

The library is hardcoded to be set to pixels for the image, whereas the use case for my project will be the amount of squares they want the emoji to be.

I couldn't understand it enough in the timeframe I wanted to build my MVP so I've put that to the side until I can refactor the code.

### My Proposed Solution.

I just need a really basic way to display the string - not to pull the image.

Therefore I've built this to display a 2x2 grid that you can copy into Slackbot.

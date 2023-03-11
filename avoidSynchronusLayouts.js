/*
Avoid forced synchronous layouts #
Shipping a frame to screen has this order:

Using flexbox as layout
First the JavaScript runs, then style calculations, then layout. It is, however, possible to force a browser to perform layout earlier with JavaScript. It is called a forced synchronous layout.

The first thing to keep in mind is that as the JavaScript runs all the old layout values from the previous frame are known and available for you to query. So if, for example, you want to write out the height of an element (let’s call it “box”) at the start of the frame you may write some code like this:
*/

// Schedule our function to run at the start of the frame.
requestAnimationFrame(logBoxHeight);

function logBoxHeight() {
    // Gets the height of the box in pixels and logs it out.
    console.log(box.offsetHeight);
}


/*
Things get problematic if you’ve changed the styles of the box before you ask for its height:
*/

function logBoxHeight() {

    box.classList.add('super-big');

    // Gets the height of the box in pixels
    // and logs it out.
    console.log(box.offsetHeight);
}


/*
Now, in order to answer the height question, the browser must first apply the style change (because of adding the super-big class), and then run layout. Only then will it be able to return the correct height. This is unnecessary and potentially expensive work.

Because of this you should always batch your style reads and do them first (where the browser can use the previous frame’s layout values) and then do any writes:

Done correctly the above function would be:
*/

function logBoxHeight() {
    // Gets the height of the box in pixels
    // and logs it out.
    console.log(box.offsetHeight);

    box.classList.add('super-big');
}

/*
For the most part you shouldn’t need to apply styles and then query values; using the last frame’s values should be sufficient. Running the style calculations and layout synchronously and earlier than the browser would like are potential bottlenecks, and not something you will typically want to do.


Avoid layout thrashing #
There’s a way to make forced synchronous layouts even worse: do lots of them in quick succession. Take a look at this code:
*/

function resizeAllParagraphsToMatchBlockWidth() {

    // Puts the browser into a read-write-read-write cycle.
    for (var i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.width = box.offsetWidth + 'px';
    }
}

/*
This code loops over a group of paragraphs and sets each paragraph’s width to match the width of an element called “box”. It looks harmless enough, but the problem is that each iteration of the loop reads a style value (box.offsetWidth) and then immediately uses it to update the width of a paragraph (paragraphs[i].style.width). On the next iteration of the loop, the browser has to account for the fact that styles have changed since offsetWidth was last requested (in the previous iteration), and so it must apply the style changes, and run layout. This will happen on every single iteration!.

The fix for this sample is to once again read then write values:
*/

// Read.
var width = box.offsetWidth;

function resizeAllParagraphsToMatchBlockWidth() {
    for (var i = 0; i < paragraphs.length; i++) {
    // Now write.
    paragraphs[i].style.width = width + 'px';
    }
}
/*
If you want to guarantee safety you should check out FastDOM, which automatically batches your reads and writes for you, and should prevent you from triggering forced synchronous layouts or layout thrashing accidentally.
*/

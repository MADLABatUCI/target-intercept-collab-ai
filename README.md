<h1>
Target Intercept Collaborative AI Game
</h1>

This is a collaborative AI game. Feel free to take inspiration as long as you cite this as inspiration. Email Sheer Karny (skarny@uci.edu) for citation instructions

<h2>
Basic overview of the code.
</h2>

Before diving into the details, we need to go into the general way these pages work. Specifically, unique HTML pages have accompanying JavaScript to run the individual game components. The exeperiment is broken down into three main sections: 1. Consent, 2. Interactive game \& experiment instructions, 3. The full experiment.

__'index.html'__ initializes the web interface for the code. 


<h2>
Instruction section of this game.
</h2>

There are a range of different game components one can initialize in this game. To begin with, there is an interactive instruction section that involves 4 gameplay sections that teach, successivelly, how to play the game. Instructions begin with 'instructions.html' which points to the these successive pages: __'instructions-gameplay-pg1.html'__ --> __'instructions-gameplay-pg2.html'__ --> __'instructions-gameplay-pg3.html'__ --> __'instructions-gameplay-pg4.html'__ --> __'instructions-AI.html'__.

After this last intruction page, 'instructions-AI.html', which informs the player about the presence of an AI collaborator, the participant is sent is sent to 'integrity-pledge.html' where all participants sign an integrity pledge. After signing this, the player is sent to the main experiment.

<h3>
The JavaScript children of each of the fornamed HTML pages:
</h3>

* 'instructions.html' - 'instructions.js'
* 'instructions-gameplay-pg1.html' - 'instructions-gameplay-pg1.js'
* 'instructions-gameplay-pg2.html' - 'instructions-gameplay-pg2.js'
* 'instructions-gameplay-pg3.html' - 'instructions-gameplay-pg3.js'
* 'instructions-gameplay-pg4.html' - 'instructions-gameplay-pg4.js'
* 'instructions-AI.html' - 'instructions-AI.js'
* 'integrity-pledge.html' - 'integrity-pledge.js'



Loading the relveant html attributes inside __'index.html'__:
Starting at line 93 (in the DEBUG conditional), you can manipulate which of the gameplay components to individually open. The default is loading the 'consent.html' page which is the first page all actual participants will encounter. However, you can skip into 1. the main experiment, & 2. the interactive instruction section pages. To do this, you need only intialize the correct HTML attribute that accompanies that page. The code that does this is there for you to uncomment and skip into each of those pages. 

<h2>
Structure of the AI algorithm:
</h2>

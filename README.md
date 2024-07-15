<h1>
Target Intercept Collaborative AI Game
</h1>

This is a collaborative AI game written in JavaScript. Feel free to take inspiration as long as you cite this as inspiration. Email Sheer Karny (skarny@uci.edu) for citation instructions

<h2>
Basic overview of the code.
</h2>

Before diving into the details, we need to go into the general way these pages work. Specifically, unique HTML pages have accompanying JavaScript to run the individual game components. The exeperiment is broken down into three main sections: 1. Consent, 2. Interactive game \& experiment instructions, 3. The full experiment.

_'index.html'_ initializes the web interface for the code. 


<h2>
Instruction section flow.
</h2>

There are a range of different game components one can initialize in this game. To begin with, there is an interactive instruction section that involves 4 gameplay sections that teach, successivelly, how to play the game. Instructions begin with 'instructions.html' which points to the these successive pages: 

_'instructions.html'_ --> _'instructions-gameplay-pg1.html'_ --> _'instructions-gameplay-pg2.html'_ --> _'instructions-gameplay-pg3.html'_ --> _'instructions-gameplay-pg4.html'_ --> _'instructions-AI.html'_.

After this last intruction page, 'instructions-AI.html', which informs the player about the presence of an AI collaborator, the participant is sent is sent to 'integrity-pledge.html' where all participants sign an integrity pledge. After signing this, the player is sent to the main experiment.

<h3>
The JavaScript children of each of the fornamed HTML pages:
</h3>

* _'instructions.html'_ - _'instructions.js'_
* _'instructions-gameplay-pg1.html'_ - _'instructions-gameplay-pg1.js'_
* _'instructions-gameplay-pg2.html'_ - _'instructions-gameplay-pg2.js'_
* _'instructions-gameplay-pg3.html'_ - _'instructions-gameplay-pg3.js'_
* _'instructions-gameplay-pg4.html'_ - _'instructions-gameplay-pg4.js'_
* _'instructions-AI.html'_ - _'instructions-AI.js'_
* _'integrity-pledge.html'_ - '_integrity-pledge.js'_


<h2>
Game and AI code.
</h2>

<h3>
Overview:
</h3>
The following breaks down the long and complicated code for running the game as well as the AI planner.



<h2>
More important details:
</h2>

<h3>
Skipping through different sections of the game:
</h3>
Starting at line 93 (in the DEBUG conditional), you can manipulate which of the gameplay components to individually open. The default is loading the 'consent.html' page which is the first page all actual participants will encounter. However, you can skip into 1. the main experiment, & 2. the interactive instruction section pages. To do this, you need only intialize the correct HTML attribute that accompanies that page. The code that does this is there for you to uncomment and skip into each of those pages. 

<h2>
Structure of the AI algorithm:
</h2>

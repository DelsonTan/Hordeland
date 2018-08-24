# Final Project: Multiplayer Web Game

## V1

### Requirements

* Real time, multiplayer (Websockets)
* Players type in a name using a form, then enter the game world immediately
* Database Info:
  * Keep track of player lifetime scores in a database
  * Keep track of most damage dealt/most kills in one life in a database
* Player spawns at a random location
* World Info:
  * 2D larger than the canvas
  * (much) larger than each player's personal view
  * top down view
  * players cannot walk off the world
* Player moves in 4 directions using arrow keys
* Player can shoot at other players and cause them to lose health
* Players who do the most damage(or most kills?) are displayed at the top left/right of the screen, in a scoreboard
* Objective is to maintain top position as long as possible
* Player has health and dies (restart? exits the game?) when they go below 0 health
* Notifications when a player kills another player
 
### Game State
Positions are vital for collision detection
* World width and height (may be fixed)
* Player (Note: AI units would have similar parameters)
  * name
  * position
  * width/height (may be fixed)
  * Damage dealt
  * Kills
  * Health
* Projectile/Attack
  * position
  * damage
  * width/height (may be fixed)
* Obstacle/Cover
  * position
  * width/height (may be fixed or randomized)
The client side renderer should have enough information to render everything in the game with this information
 
### Database Data
* Player
  * name
  * kills
  * total damage dealt
  * most damage dealt in one life
* Game (instance)
  * URL
  * Number of players(?)
  
  
### Stretch
* More complex database schema to track lifetime statistics for the game (e.g. total players registered, logged in right now, total damage ever dealt, total deaths, total ai deaths, etc etc)
* Chat system
* Fantasy theme?
* Emote/Quick Message wheel (press T, then press 1-9 for things like "GG", "EASY" etc)
* Player collision
* Minimap
* Obstacles
* Killing spree/top of the leaderboard indicator on the relevant player
* Usernames are password protected
* Resource limitation of some sort for attacks (ammo, energy, cooldown, mana, whichever)
* Different types of attacks (versus only one type of attack)
  * store different attack statistics in the database
* Mobile version of the game
* AI opponents
  * AI boss!
  * Player names turn more red as they hurt/kill other players, so other players know they are aggressive
  * Players who attack red names do not incur this penalty
   * Stretch-stretch - player names turn blue when they attack/kill red players
   * red players get bonus damage against players, blue players get bonus damage against bosses/AI, or vice versa (depends on which way we want to incentivize our players to behave)
* Randomized terrain
* Better art/themed maps
* Incrementing counter next to player name for how many times they die (for flavor) i.e. bob1, bob2 ... bob 999 (died 999 times)
* (Basic) sounds?
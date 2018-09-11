# Hordeland

Hosted on Heroku: http://hordeland.herokuapp.com/  
Co-created with Raf Rocha: https://github.com/rafrocha/

## 1.0
* Real-time massively multiplayer third person shooting game
* WASD or arrow keys to move, hold down left click to shoot
* Simple score system: get points by eliminating players or AI opponents
* Consumable health potions that are picked up upon walking over them
* "Boss" AI opponents which are much harder to kill but give stat boosts for some time upon eliminating them
* Players lose all points upon death
* Player objective: increase and maintain position in the scoreboard
* Basic chat system
* Soundtrack!

## Tech Stack
* Pure javascript for rendering and game logic (no game engine)
* Client-side rendering but zero game logic done on the front end
* Express server to manage game logic and websocket (Socket.io) connections 
* React components for the user interface (chat, scoreboard, elimination log, elimination messages, login screen)

## Credits
* OpenGameArt for the sprites and tileset
* Tiled application for building our maps
